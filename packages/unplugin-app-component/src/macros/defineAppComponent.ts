/**
 * This file is part of the unplugin-app-component package.
 *
 * @export
 * @param {string} code
 * @param {string} id
 * @return {*}  {string}
 */
export function defineAppComponentTrasform(code: string, id: string): string {
    // Replace defineAppComponent with AppComponent.create

    // Add AppComponent to the import statements if not already present
    if (!code.includes('import { AppComponent } from')) {
        code = `import { AppComponent } from '@mindtwo/app-component';\n${code}`;
    }

    // Replace the defineAppComponent call with AppComponent.create
    code = code.replace(/defineAppComponent\(([^)]+)\)/g, (match, args) => {
        return `AppComponent.create(${args})`;
    });

    return code;
}

/**
 * This function determines whether the file should be transformed by the plugin.
 *
 * @export
 * @param {string} id
 * @return {*}  {boolean}
 */
export function defineAppComponentTrasformInclude(id: string): boolean {
    // Include files that match certain patterns
    return id.endsWith('.js') || id.endsWith('.ts');
}
