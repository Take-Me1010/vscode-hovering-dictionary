

import * as vscode from 'vscode';

export async function showQuickPick(items: readonly string[], options: vscode.QuickPickOptions) {
    return new Promise<string>((resolve, reject) => {
        vscode.window.showQuickPick(items, options)
            .then((ans) => {
                if (!ans) {
                    reject(undefined);
                    return;
                }
                resolve(ans);
            });
    });
}

export async function showOpenDialog(options?: vscode.OpenDialogOptions) {
    return new Promise<vscode.Uri[]>((resolve, reject) => {
        vscode.window.showOpenDialog(options)
            .then((uris) => {
                if (!uris) {
                    reject(undefined);
                    return;
                }
                resolve(uris);
            });
    });
}
