
import * as vscode from 'vscode';

import { LookupResult } from '../lookuper';

export type MessagePayload = {
    type: 'POST'
    body: LookupResult[]
} | {
    type: 'DELETE'
};

export class DictionaryExplorerWebview implements vscode.WebviewViewProvider {
    public static readonly viewType = 'hovering-dictionary.resultViewer';

    private view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri, private isShown: boolean) {

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

    public setIsShown(isShown: boolean) {
        this.isShown = isShown;
    }

    public updateEntries(entries: LookupResult[]) {
        if (this.view && this.isShown) {
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

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link href="${styleMainUri}" rel="stylesheet">

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
