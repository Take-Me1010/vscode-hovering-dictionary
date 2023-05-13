import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { loadJson } from './utils';
import * as entry from './lib/core/entry';
import * as rule from './lib/core/rule';

export type LookupResult = {
    head: string,
    description: string
};

export class Lookuper {
    private data: Record<string, string> | null;
    private entryBuilder;
    constructor(private context: vscode.ExtensionContext, dictionaries = ['default']) {
        this.data = null;

        for (const dict of dictionaries) {
            this.loadDictionary(dict);
        }

        // lazy
        this.loadRule();
        this.entryBuilder = entry.build();
    }

    private async loadRule() {
        const ruleFile = path.resolve(this.context.extensionPath, 'static/gen/data/rule.json');
        rule.load(ruleFile);
    }

    public async loadDictionary(name: string) {
        const dictPath = path.resolve(this.context.globalStorageUri.fsPath, `${name}.json`);
        if (fs.existsSync(dictPath)) {
            const dictData = await loadJson(dictPath) as Record<string, string>;
            this.data = Object.assign(this.data ?? {}, dictData);
        }
    }

    private createEntry(word: string): string[] {
        const { entries } = this.entryBuilder(word, true);
        return entries;
    }

    public lookup(word: string): LookupResult[] {
        if (!this.data) { return []; }

        const result: LookupResult[] = [];

        const entries = this.createEntry(word);
        for (const entry of entries) {
            const description = this.data[entry];
            if (description) {
                result.push({
                    head: entry,
                    description: description
                });
            }
        }
        return result;
    }

    public lookupAll(words: string[]): LookupResult[] {
        const result: LookupResult[] = [];
        for (const word of words) {
            const res = this.lookup(word);
            if (res.length > 0) {
                result.push(...res);
            }
        }
        return result;
    }
}
