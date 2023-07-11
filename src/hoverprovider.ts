
import * as vscode from 'vscode';
import { ReplaceRule } from './config';
import { LookupResult } from './lookuper';

/**
 * class to convert given loot-up result to markdown string.
 */
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

export class HoveringResultFactory {
    mdFactory: MarkdownFactory;
    constructor(configs: { replaceRules: ReplaceRule[] }) {
        this.mdFactory = new MarkdownFactory(configs.replaceRules);
    }

    async createHover(result: LookupResult[]): Promise<vscode.Hover | null | undefined> {
        const hoveringContent = result.map((result) => {
            return this.mdFactory.produce(result);
        });
        // TODO: pay attention to https://github.com/microsoft/vscode/issues/14165
        return new vscode.Hover(hoveringContent);
    }
}
