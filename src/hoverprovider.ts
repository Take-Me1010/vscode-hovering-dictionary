
import * as vscode from 'vscode';
import { ReplaceRule } from './config';
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
    constructor(private replaceRules: ReplaceRule[]) {
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
    constructor(private lookuper: Lookuper, replaceRules: ReplaceRule[], private hoverIsShown: boolean) {
        this.mdFactory = new MarkdownFactory(replaceRules);
        this.callbacks = [];
    }

    public setIsShown(hoverIsShown: boolean) {
        this.hoverIsShown = hoverIsShown;
    }

    public on(event: 'hover', callback: HoverCallback) {
        this.callbacks.push(callback);
    }

    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null | undefined> {
        if (token.isCancellationRequested) {
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
        if (!this.hoverIsShown) {
            return undefined;
        }
        const hoveringContent = result.map((result) => {
            return this.mdFactory.produce(result);
        });
        // TODO: pay attention to https://github.com/microsoft/vscode/issues/14165
        return new vscode.Hover(hoveringContent);
    }
}
