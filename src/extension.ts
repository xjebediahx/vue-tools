// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EditorFunctions } from './classes/EditorFunctions.class';
import { FileFunctions } from './classes/FileFuntions.class';
import { VueFunctions } from './classes/VueFunctions.class';

const EXTENSION_MESSAGE_PREFIX = 'Vue Tools';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "vue-tools" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vue-tools.extractComponent', async () => {
		// check if Vue file
		if (vscode.window.activeTextEditor?.document.languageId !== 'vue') {
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}: This works only on Vue files`);
			return;
		}

		// check if file has script tag and return script content
		const scriptContent = EditorFunctions.getScriptContent();
		if (!scriptContent) {
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}: File has no script tag`);
			return;
		}

		const selectedText = EditorFunctions.getSelectedText();
		
		// check if anything selected
		if (!selectedText) {
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}: No text selected`);
			return;
		}

		// check if template  exists
		const templateStartPosition = EditorFunctions.getPositionOfMatch(/<template>/g, true); // begin at end of template opening tag
		const templateEndPosition = EditorFunctions.getPositionOfMatch(/<\/template>/g); // end at beginning of template closing tag

		if (!templateStartPosition || !templateEndPosition) {
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}: No temnplate found in file`);
			return;
		}

		// check if selection in template
		const selection = vscode.window.activeTextEditor?.selection;

		if (
			selection &&
			(selection.start.line <= templateStartPosition?.line || selection.end.line >= templateEndPosition?.line)) {
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}: Selection is not in template`);
			return;
		}

		const possibleVariables = VueFunctions.checkForVariables(selectedText);

		const inputBoxOptions: vscode.InputBoxOptions = {
			title: 'Directory / Component'
		};

		const newComponentPath = await vscode.window.showInputBox(inputBoxOptions);

		if (newComponentPath) {
			FileFunctions.createNewComponentFile(newComponentPath, selectedText);
			VueFunctions.addImport(newComponentPath);
			vscode.window.showInformationMessage(`${EXTENSION_MESSAGE_PREFIX}:  New component ` + newComponentPath);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
