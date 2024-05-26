import { EditorFunctions } from "./EditorFunctions.class";


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
