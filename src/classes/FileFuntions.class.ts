import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import template from '../templates/compnentTemplate';

export class FileFunctions {
    static readFile(path: string): string {
        return fs.readFileSync(path, 'utf-8');
    }

    static saveFile(filePath: string, content: string): void {
        const baseDirectory = path.dirname(filePath);

        if (!fs.existsSync(baseDirectory)) {
            fs.mkdirSync(baseDirectory, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content, 'utf-8');
    }

    static getCurrentPath(): string {
        if (!vscode.window.activeTextEditor) {
            throw new Error('No active editor');
        }

        const docPath = vscode.window.activeTextEditor.document.uri.fsPath;

        return path.dirname(docPath);
    }

    static createNewComponentFile(componentPath: string, content: string): void {
        const currentPath = FileFunctions.getCurrentPath();
        const fullPath = currentPath + '/' + componentPath;
        const componentPathParts = componentPath.split('/');
        const componentName = componentPathParts[ componentPathParts.length - 1 ].replace('.vue', '');
        
        let componentContent = template.replace('###HTML###', content);
        componentContent = componentContent.replace('###COMPONENT_NAME###', componentName);
        componentContent = componentContent.replace('###CSS_CLASS###', componentName.replace(/([a-z])([A-Z])/g, '$1-$2' ).toLowerCase());

        FileFunctions.saveFile(fullPath, componentContent);
    }
}