
import * as vscode from 'vscode';

interface Option {
    command: string
    tooltip: string
}

export class ToggleButton {
    private btn;
    constructor(alignment: vscode.StatusBarAlignment, priority: number, options: Option) {
        this.btn = vscode.window.createStatusBarItem(alignment, priority);
        this.btn.command = options.command;
        this.btn.tooltip = options.tooltip;
    }

    setIcon(isShown: boolean) {
        const icon = isShown ? '$(search-stop)' : '$(search)';
        this.btn.text = icon;
    }

    public show() {
        this.btn.show();
    }

    public hide() {
        this.btn.hide();
    }
}