
import * as vscode from 'vscode';
import { getCommonStyle } from './common';
import { LookupResult } from '../../lookuper';
import { ReplaceRule, CustomCssColors } from '../../config';

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
    private colorMapping: CustomCssColors;
    private replaceRules: ReplaceRule[];

    constructor(private readonly _extensionUri: vscode.Uri, configs: { colorMapping: CustomCssColors, replaceRules: ReplaceRule[] }) {
        this.colorMapping = configs.colorMapping;
        this.replaceRules = configs.replaceRules;
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

    public async updateEntries(entries: LookupResult[]) {
        return await this.view?.webview.postMessage({
            type: 'POST',
            body: entries
        } as MessagePayload);
    }

    public async clearEntries() {
        return await this.view?.webview.postMessage({
            type: 'DELETE'
        } as MessagePayload);
    }

    // public updateReplaceRule() {
    //     if (this.view) {
    //         const body: UpdateBody = this.replaceRules.map((rule) => ({ state: 'replaceRule', value: rule }));
    //         this.view.webview.postMessage({
    //             type: 'UPDATE',
    //             body: body
    //         } as MessagePayload);
    //     }
    // }

    /**
     * create CSS from `this.colorMapping`.
     * @returns 
     */
    private createCustomCss() {
        return Object.entries(this.colorMapping).map(([className, value]) => {
            return /* css */`
span.${className} {
    color: ${value};
}`;
        }).join('\n');
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

${this.createCustomCss()}
`;
    }

    /**
     * HACK: The way to initialize the `replaceRule` in the html is currently injecting `window` object in the html, which is not beautiful and not type-safe.
     */
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
    <script nonce="${nonce}">
        window.initialReplaceRules = ${JSON.stringify(this.replaceRules)};
    </script>
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

