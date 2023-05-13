import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';


import { DictionaryFileFormat, DictionaryFileEncoding } from './dictparser/interface';
import * as utils from './utils';

interface DictionaryInformation {
    files: string[]
}

export async function registerDefaultDict(context: vscode.ExtensionContext) {
    const dictFolder = path.resolve(context.extensionPath, 'static/gen/data');
    const dictionaryList: string[] = (await utils.loadJson(path.resolve(dictFolder, 'dict.json')) as DictionaryInformation).files;

    const data: Record<string, string> = {};
    for (const file of dictionaryList) {
        // because `file` is like '/data/dict0.json', remove first '/'.
        const dictPath = path.resolve(context.extensionPath, 'static/gen', file.slice(1));
        const dictData = await utils.loadJson(dictPath);
        Object.assign(data, dictData);
    }

    const keys = Object.keys(data);
    await utils.writeJson(
        path.resolve(context.globalStorageUri.fsPath, 'default.json'),
        data
    );
    return keys.length;
}

export async function registerDictFromFile(file: string, format: DictionaryFileFormat, encoding: DictionaryFileEncoding) {
    const plainText = utils.readFileAsText(file, encoding);
    return 0;
}
