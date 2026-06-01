import kebabCase from 'just-kebab-case';
import { Component } from 'vue';
import { PartialButKeep } from './util';

type HookFn = (...args: unknown[]) => void | Promise<void>;

/**
 * A single stylesheet entry — either a URL (rendered as `<link rel="stylesheet">`)
 * or inline CSS (rendered as `<style>`).
 */
export type StyleSpec = string | { url: string } | { css: string };

export interface AppComponentOptions {
    /**
     * Name of the app component
     */
    name: string;

    /**
     * Vue component to be used as the root component
     */
    component: Component;

    /**
     * Optional hookable name for the component
     * This is used to register the component in the global window object
     * and can be used to access the component instance.
     * If not provided, the name will be used.
     */
    hookableName?: string | boolean;

    /**
     * Element name for the custom HTML element
     * @default kebab-case of the name
     */
    elementName: string;

    /**
     * Debug mode for the component
     * @default false
     */
    debug: boolean;

    /**
     * If true, the component will use a shadow DOM
     * @default false
     */
    shadowRoot: boolean;

    /**
     * If true, the component will use global hooks
     * @default false
     */
    globalHooks?: boolean;

    /**
     * Optional stylesheet(s) for the component. A bare string is treated as a
     * URL (rendered as `<link>`). Use `{ css: '...' }` for inline CSS, or pass
     * an array to combine multiple entries.
     */
    style?: StyleSpec | StyleSpec[];

    /**
     * Optional hooks for the component
     */
    hooks?: {
        [key: string]: { once?: boolean; callback: HookFn } | HookFn;
    };
}

export type AppComponentOptionsPartial = PartialButKeep<AppComponentOptions, 'name' | 'component'>;

/**
 * Create an AppComponentOptions object with default values for optional properties.
 *
 * @param {AppComponentOptionsPartial} options - Partial options to create the AppComponentOptions.
 * @returns {AppComponentOptions} - Complete AppComponentOptions object.
 * @throws {Error} - If required properties are missing.
 */
export function createAppComponentOptions(
    options: AppComponentOptionsPartial
): AppComponentOptions {
    const hookableName =
        options.hookableName !== undefined
            ? typeof options.hookableName === 'string'
                ? options.hookableName
                : kebabCase(options.name)
            : undefined;

    return {
        name: options.name,
        component: options.component,
        elementName: options.elementName || kebabCase(options.name),
        hookableName,
        debug: options.debug || false,
        shadowRoot: options.shadowRoot || false,
        globalHooks: options.globalHooks || false,
        hooks: options.hooks,
        style: options.style || '',
    };
}
