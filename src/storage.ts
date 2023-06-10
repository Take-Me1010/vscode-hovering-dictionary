
import * as path from 'path';

import { Level } from 'level';
import { AbstractBatchPutOperation } from 'abstract-level';

export class DictionaryStorage {
    private db;

    /**
     * To get data from the database, don't forget to call `activate`.
     * 
     * NOTE: But multiple instances access at the same time seem not to be supported. Avoid it by using `vscode.window.onDidChangeWindowState`.
     * @param storageFolderPath the database path.
     */
    constructor(storageFolderPath: string) {
        this.db = new Level<string, string>(path.resolve(storageFolderPath, 'db'));
    }

    public async activate() {
        await this.db.open();
    }

    public async deactivate() {
        this.db.close();
    }

    public async set(data: Record<string, string>) {
        const order: AbstractBatchPutOperation<typeof this.db, string, string>[] = [];
        Object.entries(data).map((entry) => {
            const [head, desc] = entry;
            order.push({
                type: 'put',
                key: head,
                value: desc
            });
        });
        await this.db.batch(order);
    }

    public async get(...keys: string[]): Promise<(string | undefined)[]> {
        // `getMany` may return `undefined` if the given key doesn't exists.
        return await this.db.getMany(keys);
    }
}
