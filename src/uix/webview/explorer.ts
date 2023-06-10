
import * as vscode from 'vscode';
import { getCommonStyle } from './common';
import { LookupResult } from '../../lookuper';

export type ReplaceRule = { search: string, replace: string };
export type UpdateBody = ({ state: 'replaceRule', value: ReplaceRule })[];

export type MessagePayload = {
    type: 'POST'
    body: LookupResult[]
} | {
    type: 'DELETE'
} | {
    type: 'UPDATE',
    body: UpdateBody
};

export class DictionaryExplorerWebview implements vscode.WebviewViewProvider {
    public static readonly viewType = 'hovering-dictionary.resultViewer';

    private view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        this.view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    public updateEntries(entries: LookupResult[]) {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'POST',
                body: entries
            } as MessagePayload);
        }
    }

    public clearEntries() {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'DELETE'
            } as MessagePayload);
        }
    }

    public setReplaceRules(rules: ReplaceRule[]) {
        if (this.view) {
            const body: UpdateBody = rules.map((rule) => ({ state: 'replaceRule', value: rule }));
            this.view.webview.postMessage({
                type: 'UPDATE',
                body: body
            } as MessagePayload);
        }
    }

    /**
     * get CSS for the result viewer.
     */
    private getMainStyleCss() {
        return /* css */ `
body {
    background-color: transparent;
}

section.entry {
    border-bottom: 1px solid var(--vscode-button-foreground);
}

section.entry > .head {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

span.group {
    color: #080;
}`;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style nonce="${nonce}">
        ${getCommonStyle()}
    </style>
    <style nonce="${nonce}">
        ${this.getMainStyleCss()}
    </style>
    <title>Hover Dictionary Reference View</title>
</head>
<body>
    <article id="container">
    </article>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

