
import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';

import { DictionaryHoverProvider } from './hoverprovider';
import { Lookuper } from './lookuper';
import { registerDefaultDict, registerDictFromFile } from './register';
import { DictionaryFileEncoding, DictionaryFileFormat } from './dictparser/interface';


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
		let file: string, format: DictionaryFileFormat, encoding: DictionaryFileEncoding;
		vscode.window.showOpenDialog({
			canSelectMany: false,
			title: 'select a dictionary file'
		}).then((uris) => {
			if (!uris) { return; }
			file = uris[0].fsPath;

			vscode.window.showQuickPick(["EIJIRO", "TSV", "PDIC_LINE", "JSON"], {
				title: 'Select the format of the selected file.', canPickMany: false
			}).then((pick) => {
				if (!pick) { return; }
				format = pick as DictionaryFileFormat;

				vscode.window.showQuickPick(["Shift-JIS", "UTF-8", "UTF-16"], {
					title: 'Select the encoding of the selected file.', canPickMany: false
				}).then((pick) => {
					if (!pick) { return; }
					encoding = pick as DictionaryFileEncoding;
					
					registerDictFromFile(file, format, encoding)
						.then((num) => {
							vscode.window.showInformationMessage(`${num} words registered.`, { modal: false });
						});
				});
			});
		});
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
