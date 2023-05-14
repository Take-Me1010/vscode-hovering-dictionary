
import * as vscode from 'vscode';
import { Lookuper } from './lookuper';
import { UniqList } from './lib/uniqlist';

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

export class DictionaryHoverProvider implements vscode.HoverProvider {
    constructor(private lookuper: Lookuper) {
    }

    private createDictionaryMarkdown(head: string, description: string) {
        const md = `
# ${head}
${description}
`;
        return new vscode.MarkdownString(md);
    }

    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null | undefined> {
        if (token.isCancellationRequested) {
            return undefined;
        }
        const target = new UniqList<string>();
        const words = getWordsFromPosition(document, position);
        if (!words) {
            return undefined;
        }
        target.merge(words);
        
        const selections = getWordsFromSelections(document);
        if (selections) {
            for (let i = selections.length - 1; i > 0 ; i--) {
                target.unshift(selections[i]);
            }
        }
        const result = await this.lookuper.lookupAll(target.toArray());
        const hoveringContent = result.map((result) => {
            return this.createDictionaryMarkdown(result.head, result.description);
        });
        return new vscode.Hover(hoveringContent);
    }
}
