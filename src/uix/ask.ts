import { window } from 'vscode';
import { DictionaryFileEncoding, DICT_FILE_ENCODINGS, DictionaryFileFormat, DICT_FILE_FORMAT } from '../reader/types';

export async function askImportingFileInformation() {
    const uris = await window.showOpenDialog({
        canSelectMany: false,
        title: 'select a dictionary file'
    });
    if (!uris) { return undefined; }
    const file = uris[0].fsPath;

    const format = await window.showQuickPick(DICT_FILE_FORMAT, {
        title: "Select the format of the selected file", canPickMany: false
    }) as DictionaryFileFormat | undefined;
    if (!format) { return undefined; }

    const encoding = await window.showQuickPick(DICT_FILE_ENCODINGS, {
        title: 'Select the encoding of the selected file.', canPickMany: false
    }) as DictionaryFileEncoding | undefined;
    if (!encoding) { return undefined; }

    return { file, format, encoding };
}
