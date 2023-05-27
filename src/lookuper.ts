import * as vscode from 'vscode';
import * as path from 'path';

import * as entry from './lib/core/entry';
import * as rule from './lib/core/rule';

import { DictionaryStorage } from './storage';

export type LookupResult = {
    head: string,
    description: string
};

export class Lookuper {
    private entryBuilder;
    /**for debug */
    private count;
    constructor(private context: vscode.ExtensionContext, private storage: DictionaryStorage) {
        // lazy
        this.loadRule();
        this.entryBuilder = entry.build();

        this.count = 0;
    }

    private async loadRule() {
        const ruleFile = path.resolve(this.context.extensionPath, 'static/gen/data/rule.json');
        rule.load(ruleFile);
    }

    private createEntry(word: string): string[] {
        const { entries } = this.entryBuilder(word, true);
        return entries;
    }

    public async lookup(word: string): Promise<LookupResult[]> {
        const result: LookupResult[] = [];

        const entries = this.createEntry(word);
        const descriptions = await this.storage.get(...entries);
        descriptions.forEach((desc, i) => {
            if (desc) {
                result.push({
                    head: entries[i],
                    description: desc
                });
            }
        });
        return result;
    }

    public async lookupAll(words: string[]): Promise<LookupResult[]> {
        const count = this.count++;
        DEBUG && console.time(`look up - ${count}`);
        const results = await Promise.all(words.map((word) => {
            return this.lookup(word);
        }));
        DEBUG && console.timeEnd(`look up - ${count}`);
        return results.reduce((prev, curr) => {
            return prev.concat(...curr);
        }, []);
    }
}
