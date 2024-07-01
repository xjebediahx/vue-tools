import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import template from '../templates/componentTemplate';
import { VariableCandidate, VueFunctions, VueMemberType } from './VueFunctions.class';

export class FileFunctions {
    static readFile(path: string): string {
        return fs.readFileSync(path, 'utf-8');
    }

    static saveFile(filePath: string, content: string): void {
        const baseDirectory = path.dirname(filePath);
        const extension = filePath.match(/\.vue$/g) ? '' : '.vue';

        if (!fs.existsSync(baseDirectory)) {
            fs.mkdirSync(baseDirectory, { recursive: true });
        }
        
        fs.writeFileSync(filePath + extension, content, 'utf-8');
    }

    static getCurrentPath(): string {
        if (!vscode.window.activeTextEditor) {
            throw new Error('No active editor');
        }

        const docPath = vscode.window.activeTextEditor.document.uri.fsPath;

        return path.dirname(docPath);
    }

    static createNewComponentFile(componentPath: string, content: string, variables: VariableCandidate[]): void {
        const currentPath = FileFunctions.getCurrentPath();
        const fullPath = currentPath + '/' + componentPath;
        const componentName = VueFunctions.getComponentNameFromComponentPath(componentPath);

        const propsString = VueFunctions.createVariableObjectString(variables, VueMemberType.Prop);
        const methodsString = VueFunctions.createVariableObjectString(variables, VueMemberType.Method);
        
        let componentContent = template.replace('###HTML###', content);
        componentContent = componentContent.replace('###COMPONENT_NAME###', componentName);
        componentContent = componentContent.replace('###CSS_CLASS###', VueFunctions.getTagName(componentName));
        componentContent = componentContent.replace('###PROPS###', propsString);
        componentContent = componentContent.replace('###METHODS###', methodsString);

        FileFunctions.saveFile(fullPath, componentContent);
    }
}