import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import * as entry from './lib/core/entry';
import * as rule from './lib/core/rule';

import { DictionaryStorage } from './storage';

export type LookupResult = {
    head: string,
    description: string
};

export class Lookuper {
    private storage;
    private entryBuilder;
    /**for debug */
    private count;
    constructor(private context: vscode.ExtensionContext, dictionaries = ['default']) {
        this.storage = new DictionaryStorage(context.globalStorageUri.fsPath, dictionaries);

        for (const dict of dictionaries) {
            this.loadDictionary(dict);
        }

        // lazy
        this.loadRule();
        this.entryBuilder = entry.build();

        this.count = 0;
    }

    private async loadRule() {
        const ruleFile = path.resolve(this.context.extensionPath, 'static/gen/data/rule.json');
        rule.load(ruleFile);
    }

    public async loadDictionary(name: string) {
        const dictPath = path.resolve(this.context.globalStorageUri.fsPath, `${name}.json`);
        if (fs.existsSync(dictPath)) {
            this.storage.addDictionaries(name);
        }
    }

    private createEntry(word: string): string[] {
        const { entries } = this.entryBuilder(word, true);
        return entries;
    }

    public async lookup(word: string): Promise<LookupResult[]> {
        const result: LookupResult[] = [];

        const entries = this.createEntry(word);
        for (const entry of entries) {
            const descriptions = await this.storage.get(entry);
            if (descriptions) {
                result.push(...descriptions.filter(desc => (desc !== undefined)).map((description) => ({
                    head: entry,
                    description: description
                })));
            }
        }
        return result;
    }

    public async lookupAll(words: string[]): Promise<LookupResult[]> {
        const count = this.count++;
        console.time(`look up - ${count}`);
        const results = await Promise.all(words.map((word) => {
            return this.lookup(word);
        }));
        console.timeEnd(`look up - ${count}`);
        return results.reduce((prev, curr) => {
            return prev.concat(...curr);
        }, []);
    }
}
