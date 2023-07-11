/*
    utilities about reading and writing files.
*/
import * as fs from 'fs';
import * as iconv from 'iconv-lite';

export async function loadJson(file: string) {
    return new Promise<Record<string, any>>((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
            }
            const decoded = data.toString('utf-8');
            const json = JSON.parse(decoded) as Record<string, any>;
            return resolve(json);
        });
    });
}

export async function writeJson(path: string, data: Object) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data), (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

export async function readFileAsText(path: string, encoding: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) { reject(err); }
            const decoded = iconv.decode(data, encoding);
            resolve(decoded);
        });
    });
}
