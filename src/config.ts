import * as vscode from 'vscode';

export type ReplaceRule = { search: string, replace: string };
export type CustomCssColors = { [className: string]: string };

interface Configuration {
    replaceRulesForHover: ReplaceRule[],
    replaceRulesForResultViewer: ReplaceRule[],
    customCssColorsForResultViewer: CustomCssColors
}

const defaultConfiguration: Configuration = {
    replaceRulesForHover: [
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
    ],
    replaceRulesForResultViewer: [
        {
            search: "(■.+|◆.+)",
            replace: /* html */ `<span class="group">$1</span>`,
        },
        {
            search: "({.+?}|\\[.+?\\]|\\(.+?\\))",
            replace: /* html */ `<span class="group">$1</span>`,
        },
        {
            search: "(【.+?】|《.+?》|〈.+?〉|〔.+?〕)",
            replace: /* html */ `<span class="group">$1</span>`,
        },
        {
            search: "\\n|\\\\n",
            replace: /* html */ `<br/>`,
        },
    ],
    customCssColorsForResultViewer: {
        group: '#080'
    }
};

export class ExtensionConfiguration {
    config: vscode.WorkspaceConfiguration;
    constructor(extensionName: string) {
        this.config = vscode.workspace.getConfiguration(extensionName);
    }

    public get<T extends keyof Configuration>(key: T): Configuration[T] {
        const value = this.config.get<Configuration[T]>(key);
        return value ?? defaultConfiguration[key];
    }

    public set<T extends keyof Configuration>(key: T, value: Configuration[T] | undefined) {
        return this.config.update(key, value);
    }
}
