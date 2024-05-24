import * as vscode from 'vscode';

export class EditorFunctions {
    public static getSelectedText(): string {
        const editor = vscode.window.activeTextEditor;
        let result = '';

        if (!editor) {
            return result;
        }

        const selection = editor.selection;
        
        if (selection && !selection.isEmpty) {
            const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
            const highlighted = editor.document.getText(selectionRange);

            result = highlighted;
        }

        return result;
    }

    public static getScriptContent(): string | undefined {
        const content = EditorFunctions.getFileContent();
        const scriptPattern = /<script>(.|\n)*<\/script>/mgi;

        const match = content?.match(scriptPattern);
        if (!match) {
            return;
        }

        return match[0];
    }

    static getFileContent(): undefined | string {
        return vscode.window.activeTextEditor?.document.getText();
    }

    static addToComponents(scriptContent: string, componentName: string): void {
        // find components in script
        const componentsPattern = /components: *{((.|\n)*?)}/g;
        const componentsMatch = scriptContent.match(componentsPattern);

        if (!componentsMatch) {
            // add new components declaration

            return;
        }

    }
}