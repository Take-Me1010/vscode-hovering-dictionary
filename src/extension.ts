
import * as vscode from 'vscode';

import { HoveringResultFactory } from './hoverprovider';
import { Lookuper } from './lookuper';
import { readDefaultDict, readDictFromFile } from './reader';
import { DictionaryFileEncoding, DictionaryFileFormat } from './reader/types';
import { DictionaryStorage } from './storage';
import { GlobalStateManager } from './state';
import { DictionaryExplorerWebview, ToggleButton } from './uix';
import { askImportingFileInformation } from './uix/ask';

import { ExtensionConfiguration } from './config';
import * as utils from './utils';

class HoveringDictionaryExtension implements vscode.HoverProvider {
	public static readonly extensionName = 'hovering-dictionary';

	private storage: DictionaryStorage;
	private lookuper: Lookuper;

	/**
	 * determines wether the hover is shown or not.
	 */
	private isHoverShown: boolean;

	constructor(context: vscode.ExtensionContext, private hoveringResultFactory: HoveringResultFactory, private webview: DictionaryExplorerWebview, initialState: { isHoverShown: boolean }) {
		this.storage = new DictionaryStorage(context.globalStorageUri.fsPath);
		this.lookuper = new Lookuper(context.extensionPath, this.storage);
		this.isHoverShown = initialState.isHoverShown;

		this.registerProviders(context);
	}

	/**
	 * called only in `constructor`.
	 */
	private registerProviders(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.languages.registerHoverProvider('*', this)
		);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(DictionaryExplorerWebview.viewType, this.webview)
		);
	}

	public setIsHoverShown(isHoverShown: boolean) {
		this.isHoverShown = isHoverShown;
	}

	async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null | undefined> {
		if (token.isCancellationRequested) {
			return undefined;
		}
		const words = utils.getWordsFromPosition(document, position);
		if (!words) {
			return undefined;
		}
		const selections = utils.getWordsFromSelections(document);
		if (selections) {
			// 選択している部分を、ホバーよりも優先するので`unshift`で挿入
			words.unshift(...selections);
		}

		const target = Array.from(new Set(words));
		const result = await this.lookuper.lookupAll(target);

		this.webview.updateEntries(result);
		if (this.isHoverShown) {
			return await this.hoveringResultFactory.createHover(result);
		} else {
			return undefined;
		}
	}

	public async activate() {
		await this.storage.activate();
	}
	public async deactivate() {
		await this.storage.deactivate();
	}

	public async loadDefaultDictionary(context: vscode.ExtensionContext) {
		const data = await readDefaultDict(context);
		await this.storage.set(data);
		return Object.keys(data).length;
	}
	public async importDictionaryFile(fileInformation: { file: string, format: DictionaryFileFormat, encoding: DictionaryFileEncoding }) {
		const data = await readDictFromFile(fileInformation);
		await this.storage.set(data);
		return Object.keys(data).length;
	}
}

// define as a module level variable in order To call `extension.deactivate()`.
let extension: HoveringDictionaryExtension;

export async function activate(context: vscode.ExtensionContext) {
	const stateManager = new GlobalStateManager(context);
	const config = new ExtensionConfiguration(HoveringDictionaryExtension.extensionName);

	let isHoverShown = stateManager.get('hoverIsShown');
	if (isHoverShown === undefined) {
		stateManager.set('hoverIsShown', true);
		isHoverShown = true;
	}

	const _webview = new DictionaryExplorerWebview(context.extensionUri, {
		colorMapping: config.get('customCssColorsForResultViewer'), replaceRules: config.get('replaceRulesForResultViewer')
	});
	const _hover = new HoveringResultFactory({
		replaceRules: config.get('replaceRulesForHover')
	});
	const extension = new HoveringDictionaryExtension(context, _hover, _webview, {
		isHoverShown
	});

	const toggleButton = new ToggleButton(vscode.StatusBarAlignment.Right, 0, {
		command: 'hovering-dictionary.toggle-hover-visibility',
		tooltip: 'hovering-dictionary: Toggle hover state (shown or not shown)',
		isHoverShown: isHoverShown
	});
	context.subscriptions.push(toggleButton.getStatusBarItem());
	toggleButton.show();

	stateManager.on('hoverIsShown', (value) => {
		extension.setIsHoverShown(value);
		toggleButton.setIcon(value);
	});

	// To avoid multiple access to the database, only the instance under the active window is activated.
	vscode.window.onDidChangeWindowState((e) => {
		if (e.focused) {
			extension.activate();
		} else {
			extension.deactivate();
		}
	});
	if (vscode.window.state.focused) {
		extension.activate();
	}

	// when the extension is activated at the first time, ask the user if the default dictionary will be loaded.
	if (!stateManager.get('defaultDictLoadedOrRejectedLoading')) {
		const ans = await vscode.window.showInformationMessage('Thank you for installing, do you want to load default dictionary (English into Japanese)?', 'Yes', 'No')
		if (ans === 'Yes') {
			await vscode.commands.executeCommand('hovering-dictionary.load-default-dictionary');
		} else {
			stateManager.set('defaultDictLoadedOrRejectedLoading', true);
		}
	}

	/* define commands here */
	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.load-default-dictionary', async () => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Loading default dictionary data..."
		}, async (progress, token) => {
			const num = await extension.loadDefaultDictionary(context);
			stateManager.set('defaultDictLoadedOrRejectedLoading', true);
			vscode.window.showInformationMessage(`${num} words registered.`, { modal: false });
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.import-dictionary', async () => {
		const info = await askImportingFileInformation();
		if (info === undefined) { return; }

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification
		}, async (progress, token) => {
			const num = await extension.importDictionaryFile(info);
			vscode.window.showInformationMessage(`${num} words registered.`, { modal: false });
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hovering-dictionary.toggle-hover-visibility', () => {
		stateManager.set('hoverIsShown', !stateManager.get('hoverIsShown'));
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	extension.deactivate();
}
