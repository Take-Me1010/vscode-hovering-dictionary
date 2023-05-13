/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present Take-Me1010
 * The code is rewritten in TypeScript.
 * 
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import * as fs from 'fs';
import * as iconv from 'iconv-lite';

export async function loadJson(file: string, encoding: BufferEncoding | 'Shift_JIS' | string = 'utf8'): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
            }
            const decoded = iconv.decode(data, encoding);
            const json = JSON.parse(decoded) as Record<string, any>;
            return resolve(json);
        });
    });
}

/**
 * update map object using given data.
 * @param map map object
 * @param data array object like [[key1, value1], [key2, value2], ...]
 * @example
 * const rule = new Map<string, string>();
 * updateMap(rule, [['hoge', 'fuga'], ['fuga', 'hoge_fuga']]);
 * console.log(rule)    //-> Map(2) { 'hoge' => 'fuga', 'fuga' => 'hoge_fuga' }
 */
export function updateMap<T>(map: Map<T, T>, data: [T, T][]) {
    for (let i = 0; i < data.length; i++) {
        const arr = data[i];
        map.set(arr[0], arr[1]);
    }
};
