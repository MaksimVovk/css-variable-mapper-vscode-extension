import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const SUPPORTED_LANGUAGES = [
		'css',
		'scss',
		'less',
		'vue',
		'html',
		'javascript',
		'javascriptreact',
		'typescript',
		'typescriptreact',
		'svelte',
		'angular'
	];
	let mappings: Record<string, any> = {};
	let variableToHex: Record<string, string> = {};
	let palette: vscode.CompletionItem[] = [];

	console.log('CSS Variable Mapper is now active!');
	const getMappings = () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) return {};

		const configPath = path.join(workspaceFolders[0].uri.fsPath, '.cssmapperconfig');
		console.log('Checking config at:', configPath);
		if (fs.existsSync(configPath)) {
			return JSON.parse(fs.readFileSync(configPath, 'utf8'));
		}
		return {};
	};

	const reloadConfig = () => {
		try {
			mappings = getMappings();
			palette = Object.keys(mappings).reduce((prev, next): vscode.CompletionItem[] => {
				const values = mappings[next];
				let hexValues = [];
				if (Array.isArray(values)) {
					hexValues = [...values]
				} else {
					hexValues.push(values)
				}

				const compileItems = hexValues.map(it => {
					const item = new vscode.CompletionItem(`${it} - ${next}`, vscode.CompletionItemKind.Color);
					item.insertText = it as string;
					item.detail = `Hex value: ${next}`;
					item.documentation = new vscode.MarkdownString(`Replaces HEX with \`${it}\``);
					return item;
				});


				return [...prev, ...compileItems]
			}, [])

			Object.entries(mappings).forEach(([hex, values]) => {
				const vars = Array.isArray(values) ? values : [values];
				vars.forEach(v => {
					variableToHex[v] = hex;
				});
			});
			console.log('CSS Mapper: Config reloaded successfully');
		} catch (e) {
			console.error('CSS Mapper: Failed to parse config');
		}
	}

	reloadConfig();

	const watcher = vscode.workspace.createFileSystemWatcher('**/.cssmapperconfig');

	watcher.onDidChange(() => reloadConfig());
	watcher.onDidCreate(() => reloadConfig());
	watcher.onDidDelete(() => {
		mappings = {};
		variableToHex = {};
		palette = [];
	});

	const colorProvider = vscode.languages.registerColorProvider(
		SUPPORTED_LANGUAGES,
		{
			provideDocumentColors(document: vscode.TextDocument) {
				const colors: vscode.ColorInformation[] = [];
				const text = document.getText();
				const regex = /var\((--[a-zA-Z0-9_-]+)\)/g;
				let match;

				while ((match = regex.exec(text)) !== null) {
					const varName = match[0];
					const hex = variableToHex[varName];

					if (hex) {
						const startPos = document.positionAt(match.index);
						const endPos = document.positionAt(match.index + match[0].length);

						const color = hexToVisualColor(hex);

						if (color) {
							colors.push(new vscode.ColorInformation(new vscode.Range(startPos, endPos), color));
						}
					}
				}
				return colors;
			},

			provideColorPresentations(color, context) {
				return [];
			}
		}
	);

	context.subscriptions.push(colorProvider);

	function hexToVisualColor(hex: string): vscode.Color | null {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return new vscode.Color(r, g, b, 1);
	}

	const provider = vscode.languages.registerCompletionItemProvider(
		SUPPORTED_LANGUAGES,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				return palette
			}
		},
		'#'
	);

	context.subscriptions.push(provider);
}