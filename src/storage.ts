
import * as path from 'path';

import { loadJson } from './utils';

function getDictPath(storageFolderPath: string, identifier: string) {
    return path.resolve(storageFolderPath, `${identifier}.json`);
}

export class DictionaryStorage {
    private dictPaths: string[];
    private db;

    constructor(private storageFolderPath: string, identifiers: string[]) {
        this.dictPaths = identifiers.map((identifier) => {
            return getDictPath(storageFolderPath, identifier);
        });
        this.db = {} as Record<string, string>;
        // lazy
        this.reload();
    }

    public addDictionaries(...identifiers: string[]) {
        this.dictPaths.push(...identifiers.map((identifier) => {
            return getDictPath(this.storageFolderPath, identifier);
        }));
    }

    public async reload() {
        for (const dictPath of this.dictPaths) {
            const dictData: Record<string, string> = await loadJson(dictPath);
            Object.assign(this.db, dictData);
        }
    }

    public async get(key: string): Promise<string[]> {
        return new Promise((resolve) => {
            const desc = this.db[key];
            resolve([desc]);
        });
    }
}
