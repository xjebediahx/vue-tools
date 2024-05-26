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

    static getPositionOfMatch(regex: RegExp, positionAtEnd: boolean = false): vscode.Position | undefined {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }
        
        const document = editor.document;
        const text = document.getText();
        const match = regex.exec(text);

        if (match) {
            return positionAtEnd ? document.positionAt(match.index + match[0].length) : document.positionAt(match.index);
        }
    }

    static getIndentString(): string | undefined {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        const document = editor.document;
        const options = editor.options;

        // Ermitteln, ob die Einrückung mit Tabs oder Leerzeichen erfolgt
        const insertSpaces = options.insertSpaces as boolean;

        // Ermitteln der Tab-Breite
        const tabSize = options.tabSize as number;

        // Einrückungsstring basierend auf den Einstellungen erstellen
        return insertSpaces ? ' '.repeat(tabSize) : '\t';
    }

    static async insertText(text: string, position?: vscode.Position): Promise<void> {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;

            await editor.edit(editBuilder => {
                if (position) {
                    editBuilder.insert(position, text);
                } else {
                    editBuilder.replace(selection, text);
                }
            });

            
        }
    }

    static async deleteSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            await editor.edit(editBuilder => {
                editBuilder.delete(editor.selection);
            });
        }
    }

}