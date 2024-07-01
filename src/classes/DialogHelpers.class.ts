import { VariableCandidate } from "./VueFunctions.class";
import * as vscode from 'vscode';

export class DialogHelpers {

    static createVariableSelectionDialog(variables: VariableCandidate[]): Promise<VariableCandidate[]> {
        return new Promise((resolve, reject) => {
            const panel = vscode.window.createWebviewPanel(
                'radioButtonDialog', // Identifikator des Webviews
                'Select variables to create', // Titel des Panels
                vscode.ViewColumn.One, // Editor-Spalte, in der das Panel angezeigt wird
                {} // Webview-Optionen
            );
    
            // Setze den HTML-Inhalt der Webview
            panel.webview.html = DialogHelpers.getWebviewContent(variables);
    
            // Behandle Nachrichten von der Webview
            panel.webview.onDidReceiveMessage(
                (message) => {
                    switch (message.command) {
                        case 'variablesSelected':
                            resolve(message.payload);
                            return;
                        default:
                            reject();
                    }
                },
                undefined,
                // context.subscriptions
            );
        });

    }

    private static getWebviewContent(variables: VariableCandidate[]) {

        const inputHtml = variables.reduce((html, variable) => {
            return html + `
                <dt>${variable.name}</dt>
                <dd>
                    <label><input type="radio" name="v-type-${variable.name}" value="ignore" /> ignore</label>
                    <label><input type="radio" name="v-type-${variable.name}" value="props" /> props</label>
                    <label><input type="radio" name="v-type-${variable.name}" value="computed" /> computed</label>
                    <label><input type="radio" name="v-type-${variable.name}" value="methods" /> ignore</label> 
                </dd>
            `;
        }, '');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Radio Button Dialog</title>
            </head>
            <body>
                <h1>Choose an option</h1>
                <form id="radioForm">
                    <dl>
                    ${inputHtml}
                    </dl>
                    <button type="button" onclick="submitForm()">Submit</button>
                </form>
                <script>
                    const vscode = acquireVsCodeApi();
    
                    function submitForm() {
                        const form = document.getElementById('radioForm');
                        const formData = new FormData(form);
                        const selectedOption = formData.get('option');

                        console.log(formData);
                        vscode.postMessage({
                           command: 'variablesSelected',
                           payload: selectedOption ? \`You selected: \${selectedOption}\` : 'No option selected'
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }

}