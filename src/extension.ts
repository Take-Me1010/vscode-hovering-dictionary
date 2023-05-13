
import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';

import { DictionaryHoverProvider } from './hoverprovider';
import { Lookuper } from './lookuper';
import { registerDefaultDict, registerDictFromFile } from './register';
import { DictionaryFileEncoding, DICT_FILE_ENCODINGS, DictionaryFileFormat, DICT_FILE_FORMAT } from './register/types';
import * as window from './window';

export function activate(context: vscode.ExtensionContext) {
	const STORAGE_PATH = context.globalStorageUri.fsPath;
	const lookuper = new Lookuper(context);

	if (!fs.existsSync(path.resolve(STORAGE_PATH, 'default.json'))) {
		if (!fs.existsSync(STORAGE_PATH)) {
			fs.mkdirSync(STORAGE_PATH);
		}
		vscode.window.showWarningMessage('No default dictionary data found. Download and read it?', 'Yes', 'No')
			.then((ans) => {
				switch (ans) {
					case 'Yes':
						vscode.commands.executeCommand('hovering-dictionary.load-default-dictionary');
						break;

					default:
						break;
				}
			});
	}

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.load-default-dictionary', async () => {
		const num = await registerDefaultDict(context);
		await lookuper.loadDictionary('default');
		vscode.window.showInformationMessage(`${num} words registered.`, { modal: false });
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.load-dictionary', async () => {
		const uris = await window.showOpenDialog({
			canSelectMany: false,
			title: 'select a dictionary file'
		});
		if (!uris) { return; }
		const file = uris[0].fsPath;

		const format = await window.showQuickPick(DICT_FILE_FORMAT, {
			title: "Select the format of the selected file", canPickMany: false
		}) as DictionaryFileFormat | undefined;
		if (!format) { return; }

		const encoding = await window.showQuickPick(DICT_FILE_ENCODINGS, {
			title: 'Select the encoding of the selected file.', canPickMany: false
		}) as DictionaryFileEncoding | undefined;
		if (!encoding) { return; }

		const num = await registerDictFromFile(context, 'test', { file, format, encoding })
		vscode.window.showInformationMessage(`${num} words registered.`, { modal: false });
	}));

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			'*',
			new DictionaryHoverProvider(lookuper)
		)
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
