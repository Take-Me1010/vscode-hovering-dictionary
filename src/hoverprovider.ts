
import * as vscode from 'vscode';
import { Lookuper } from './lookuper';

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

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
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
        
        const hoveringContent = this.lookuper.lookupAll(words).map((result) => {
            return this.createDictionaryMarkdown(result.head, result.description);
        });
        return new vscode.Hover(hoveringContent);
    }
}
