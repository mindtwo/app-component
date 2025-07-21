import kebabCase from 'just-kebab-case';
import { Component } from 'vue';
import { PartialButKeep } from './util';

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
     * Optional hooks for the component
     */
    hooks?: {
        [key: string]: (...args: unknown[]) => void;
    };
}

export type AppComponentOptionsPartial = PartialButKeep<
    AppComponentOptions,
    'name' | 'component'
>;

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
    return {
        name: options.name,
        component: options.component,
        elementName: options.elementName || kebabCase(options.name),
        debug: options.debug || false,
        shadowRoot: options.shadowRoot || false,
        globalHooks: options.globalHooks || false,
        hooks: options.hooks,
    };
}
