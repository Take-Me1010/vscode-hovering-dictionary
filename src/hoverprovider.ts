
import * as vscode from 'vscode';
import { LookupResult, Lookuper } from './lookuper';

function getWordsFromSelections(document: vscode.TextDocument) {
    const selections = vscode.window.activeTextEditor?.selections;
    if (!selections) {
        return undefined;
    }
    return selections.map((selection) => {
        return document.getText(selection);
    }).filter(s => s);
}

function getWordsFromPosition(document: vscode.TextDocument, position: vscode.Position) {
    const range = document.getWordRangeAtPosition(position, /\w+/);
    if (!range) {
        return undefined;
    }
    return [document.getText(range)];
}

class MarkdownFactory {
    private replaceRules;
    constructor() {
        /**
         * In `style` in a span tag, only `color` and `background-color` are permitted.
         * ref: https://stackoverflow.com/questions/67749752/how-to-apply-styling-and-html-tags-on-hover-message-with-vscode-api
         */
        this.replaceRules = [
            {
                search: "(■.+|◆.+)",
                replace: /* html */ `<span style="color:#080;">$1</span>`,
            },
            {
                search: "({.+?}|\\[.+?\\]|\\(.+?\\))",
                replace: /* html */ `<span style="color:#080;">$1</span>`,
            },
            {
                search: "(【.+?】|《.+?》|〈.+?〉|〔.+?〕)",
                replace: /* html */ `<span style="color:#080;">$1</span>`,
            },
            {
                search: "\\n|\\\\n",
                replace: /* html */ `<br/>`,
            },
        ];
    }
    public produce(entry: LookupResult) {
        let { head, description } = entry;
        for (const rule of this.replaceRules) {
            description = description.replaceAll(new RegExp(rule.search, 'g'), rule.replace);
        }
        const query = head.trim().replaceAll(' ', '+');

        const content = `
# [${head}](https://eow.alc.co.jp/search?q=${query})
${description}
        `;
        const md = new vscode.MarkdownString(content);
        md.supportHtml = true;
        md.isTrusted = true;
        return md;
    }
}
type HoverCallback = (result: LookupResult[]) => Promise<void> | void;

export class DictionaryHoverProvider implements vscode.HoverProvider {
    private mdFactory;
    private callbacks: HoverCallback[];
    constructor(private lookuper: Lookuper, private hoverIsShown: boolean) {
        this.mdFactory = new MarkdownFactory();
        this.callbacks = [];
    }

    public setIsShown(hoverIsShown: boolean) {
        this.hoverIsShown = hoverIsShown;
    }

    public on(event: 'hover', callback: HoverCallback) {
        this.callbacks.push(callback);
    }

    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null | undefined> {
        if (token.isCancellationRequested || !this.hoverIsShown) {
            return undefined;
        }
        const words = getWordsFromPosition(document, position);
        if (!words) {
            return undefined;
        }

        const selections = getWordsFromSelections(document);
        if (selections) {
            words.unshift(...selections);
        }
        const target = Array.from(new Set(words));
        const result = await this.lookuper.lookupAll(target);
        for (const callback of this.callbacks) {
            callback(result);
        }
        const hoveringContent = result.map((result) => {
            return this.mdFactory.produce(result);
        });
        // TODO: pay attention to https://github.com/microsoft/vscode/issues/14165
        return new vscode.Hover(hoveringContent);
    }
}
