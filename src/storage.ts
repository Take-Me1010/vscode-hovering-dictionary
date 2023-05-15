
import * as path from 'path';

import { Level } from 'level';
import { AbstractBatchPutOperation } from 'abstract-level';

export class DictionaryStorage {
    private db;

    constructor(storageFolderPath: string) {
        this.db = new Level<string, string>(path.resolve(storageFolderPath, 'db'));
        // lazy
        this.activate();
    }

    private async activate() {
        await this.db.open();
    }

    public deactivate() {
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
