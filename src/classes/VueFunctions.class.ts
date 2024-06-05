import { EditorFunctions } from "./EditorFunctions.class";

export enum VueMemberType {
    Prop = 'prop',
    // Computed = 'computed',
    Method = 'method',
}

enum PredictedType {
    String = 'String',
    Object = 'Object'
}

export interface VariableCandidate {
    name: string;
    memberType: VueMemberType;
    predictedType: PredictedType;
}

export class VueFunctions {
    static getTagName(componentName: string): string {
        return componentName.replace(/([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }

    static getComponentNameFromComponentPath(componentPath: string): string {
        const componentPathParts = componentPath.split('/');

        return componentPathParts[ componentPathParts.length - 1 ].replace('.vue', '');
    }

    static async addImport(componentPath: string): Promise<void> {
        const scriptTagEndPosition = EditorFunctions.getPositionOfMatch(/<script>\n/g, true);
        const componentName = VueFunctions.getComponentNameFromComponentPath(componentPath);

        if (scriptTagEndPosition) {
            await EditorFunctions.insertText(`import ${componentName} from './${componentPath}';\n`, scriptTagEndPosition);
            await VueFunctions.addToComponents(componentName);
            await VueFunctions.addToTemplate(componentName);
            
        }
    }

    static checkForVariables(newComponentHTML: string): VariableCandidate[] {
        const dataBindingPattern = /:[a-zA-Z-]+="([a-zA-Z]+)(\.[a-zA-Z]+)?"/gm;
        const simpleHandlerPattern = /@[a-zA-Z-]+="([[a-zA-Z]+)"/gm;
        // const arrowFuncHandlerPattern = /@[a-zA-Z-]+="[a-zA-Z()]+ => ((.|\n)*?)"/gm;

        const result: VariableCandidate[] = [];
        let match;

        // check for possible props or computed's
        while(match = dataBindingPattern.exec(newComponentHTML)) {
            result.push({
                name: match[1],
                memberType: VueMemberType.Prop,
                predictedType: match[2] ? PredictedType.Object : PredictedType.String
            });
        }

        // check for possible methods
        while(match = simpleHandlerPattern.exec(newComponentHTML)) {
            result.push({
                name: match[1],
                memberType: VueMemberType.Method,
                predictedType: match[2] ? PredictedType.Object : PredictedType.String
            });
        }

        return result;
    }

    static createVariableObjectString(variables: VariableCandidate[], memberType: VueMemberType): string {
        let prefix = '';
        let content = '';

        switch(memberType) {
            case VueMemberType.Prop:
                prefix = 'props';
                content = variables.filter(variable => variable.memberType === memberType).reduce((text, variable) => {
                    return text + `\t\t${variable.name}: ${variable.predictedType},\n`;
                }, '');
                break;

            case VueMemberType.Method:
                prefix = 'methods';
                content = variables.filter(variable => variable.memberType === memberType).reduce((text, variable) => {
                    return text + `\t\t${variable.name}(): void {},\n\n`;
                }, '');
                break;
        }

        return content ? `\t${prefix}: {${content}\t},\n\n` : '';
    }

    private static async addToComponents(componentName: string): Promise<void> {
        const componentsPosition = EditorFunctions.getPositionOfMatch(/components: ?{\n?/gm, true);
        const indent: string = (EditorFunctions.getIndentString() ?? '');

        if (componentsPosition) {
            await EditorFunctions.insertText(`${indent}${indent}${componentName},\n`, componentsPosition);
        } else {
            // there is no components object yet
            let insertComponentsPosition = EditorFunctions.getPositionOfMatch(/name: ?['"].+['"],\n/gm, true); // look for name declaration to insert behind

            if (!insertComponentsPosition) {
                insertComponentsPosition = EditorFunctions.getPositionOfMatch(/props: ?{\n?/gm); // look for props declaration to insert before
            }

            if (insertComponentsPosition) {
                await EditorFunctions.insertText(`\n${indent}components: {\n${indent}${indent}${componentName}\n${indent}},\n\n`, insertComponentsPosition);
            }
        }
    }

    private static async addToTemplate(componentName: string): Promise<void> {
        const tagName = VueFunctions.getTagName(componentName);
        await EditorFunctions.insertText(`<${tagName} />\n`);
    }

}
