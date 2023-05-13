
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { DictionaryFileFormat, DictionaryFileEncoding } from './types';
import { createDictParser, DictParser } from './parser';
import { LineReader } from './linereader';
import * as utils from '../utils';

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

type RegisterFileInformation = {
    file: string, format: DictionaryFileFormat, encoding: DictionaryFileEncoding
};

export async function registerDictFromFile(context: vscode.ExtensionContext, identifier: string, info: RegisterFileInformation) {
    const plainText = await utils.readFileAsText(info.file, info.encoding);
    const parser: DictParser = createDictParser(info.format);
    const reader = new LineReader(plainText);

    let dictData: Record<string, string> = {};
    let wordCount = 0;

    while (reader.next()) {
        // if `reader.next() === true`, then `reader.getLine()` must be string, not `null`.
        const hd = parser.addLine(reader.getLine() as string);
        if (!hd) {
            continue;
        }
        dictData[hd.head] = hd.desc;
        wordCount += 1;
    }

    const lastData = parser.flush();
    if (lastData) {
        Object.assign(dictData, lastData);
        wordCount += Object.keys(lastData).length;
    }
    await utils.writeJson(
        path.resolve(context.globalStorageUri.fsPath, `${identifier}.json`),
        dictData
    );
}
