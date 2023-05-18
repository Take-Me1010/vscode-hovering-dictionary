
import * as vscode from 'vscode';

import { DictionaryHoverProvider } from './hoverprovider';
import { Lookuper } from './lookuper';
import { readDefaultDict, readDictFromFile } from './reader';
import { DictionaryFileEncoding, DICT_FILE_ENCODINGS, DictionaryFileFormat, DICT_FILE_FORMAT } from './reader/types';
import { DictionaryStorage } from './storage';
import { GlobalStateManager } from './state';
import { DictionaryExplorerWebview, ToggleButton } from './uix';

// define as a module level variable in order To call `storage.deactivate()`.
let storage: DictionaryStorage;

export function activate(context: vscode.ExtensionContext) {
	const STORAGE_PATH = context.globalStorageUri.fsPath;
	const stateManager = new GlobalStateManager(context);

	storage = new DictionaryStorage(STORAGE_PATH);

	const lookuper = new Lookuper(context, storage);
	const isShown = stateManager.get('hoverIsShown') ?? true;
	const hoverProvider = new DictionaryHoverProvider(lookuper, isShown);

	const toggleButton = new ToggleButton(vscode.StatusBarAlignment.Right, 0, {
		command: 'hovering-dictionary.toggle-hover-visibility',
		tooltip: 'hovering-dictionary: Toggle hover state (shown or not shown)'
	});
	toggleButton.show();

	const webview = new DictionaryExplorerWebview(context.extensionUri, stateManager.get('resultViewerIsShown') ?? true);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(
		DictionaryExplorerWebview.viewType, webview
	));

	hoverProvider.on('hover', (result) => {
		webview.updateEntries(result);
	});

	stateManager.on('hoverIsShown', (value) => {
		hoverProvider.setIsShown(value);
		toggleButton.setIcon(value);
	});

	stateManager.on('resultViewerIsShown', (value) => {
		if (value) {
			webview.clearEntries();
		}
		webview.setIsShown(value);
	});

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.load-default-dictionary', async () => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Loading default dictionary data...",
			cancellable: true
		}, async (progress, token) => {
			progress.report({
				increment: 0
			});
			const data = await readDefaultDict(context);

			progress.report({
				increment: 50
			});
			await storage.set(data);
			stateManager.set('defaultDictLoadedOrRejectedLoading', true);
			vscode.window.showInformationMessage(`${Object.keys(data).length} words registered.`, { modal: false });
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.import-dictionary', async () => {
		const uris = await vscode.window.showOpenDialog({
			canSelectMany: false,
			title: 'select a dictionary file'
		});
		if (!uris) { return; }
		const file = uris[0].fsPath;

		const format = await vscode.window.showQuickPick(DICT_FILE_FORMAT, {
			title: "Select the format of the selected file", canPickMany: false
		}) as DictionaryFileFormat | undefined;
		if (!format) { return; }

		const encoding = await vscode.window.showQuickPick(DICT_FILE_ENCODINGS, {
			title: 'Select the encoding of the selected file.', canPickMany: false
		}) as DictionaryFileEncoding | undefined;
		if (!encoding) { return; }

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification
		}, async (progress, token) => {
			progress.report({ increment: 0, message: 'loading the given file...' });
			const data = await readDictFromFile({ file, format, encoding });

			progress.report({ increment: 50, message: 'registering the loaded data...' });
			await storage.set(data);

			vscode.window.showInformationMessage(`${Object.keys(data).length} words registered.`, { modal: false });
			progress.report({ increment: 50 });
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.toggle-hover-visibility', () => {
		stateManager.set('hoverIsShown', !stateManager.get('hoverIsShown'));
	}));

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			'*',
			hoverProvider
		)
	);
	if (!stateManager.get('defaultDictLoadedOrRejectedLoading')) {
		vscode.window.showInformationMessage('Thank you for installing, do you want to load default dictionary (English into Japanese)?', 'Yes', 'No')
			.then(async (ans) => {
				if (ans === 'Yes') {
					await vscode.commands.executeCommand('hovering-dictionary.load-default-dictionary');
				} else {
					stateManager.set('defaultDictLoadedOrRejectedLoading', true);
				}
			});
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	storage.deactivate();
}
