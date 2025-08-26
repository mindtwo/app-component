import pascalCase from 'just-pascal-case';
import { Component } from 'vue';

import { createLogger } from './lib/logger';
import { ComponentHooks } from './lib/hooks';
import AppComponentBridge, { WindowWithAppComponentBridge } from './AppComponentBridge';
import AppComponentHtmlElement from './AppComponentHtmlElement';
import {
    AppComponentOptions,
    AppComponentOptionsPartial,
    createAppComponentOptions,
} from './types/app-component-options';

class AppComponent {
    private name: string;

    // Constructor implementation
    private constructor(options: AppComponentOptions, hooks: ComponentHooks) {
        // Create a logger instance
        const _logger = createLogger(options.debug, options.name || 'AppComponent');

        // Convert the name to PascalCase and kebab-case
        this.name = pascalCase(options.name);

        // Skip if the custom element already exists
        if (window.customElements.get(options.elementName)) {
            _logger.warn(`Custom element ${options.elementName} already exists.`);
            return;
        }

        // Create the bridge instance
        const bridge = new AppComponentBridge(this.name, options.component, hooks, options.style);

        // Register the component in the global window object
        const w = window as WindowWithAppComponentBridge;

        if (!w[this.name]) {
            _logger.debug(`Registering app component: ${this.name}`);
            w[this.name] = bridge;
        }

        // Define the custom element if it doesn't exist
        if (!window.customElements.get(options.elementName)) {
            // useShadowRoot option
            const useShadowRoot = options.shadowRoot;
            const name = this.name;

            // Create the custom HTML element
            const elementClass = class extends AppComponentHtmlElement {
                constructor() {
                    super(name, useShadowRoot, hooks);

                    bridge.setElement(this);
                }
            };

            window.customElements.define(options.elementName, elementClass);
        }
    }

    /**
     * Get the bridge for the app component.
     *
     * @returns {AppComponentBridge}
     * @throws {Error} If the bridge is not found.
     */
    protected bridge(): AppComponentBridge {
        const w = window as WindowWithAppComponentBridge;
        if (!w[this.name]) {
            throw new Error(`App component bridge not found for: ${this.name}`);
        }
        return w[this.name];
    }

    // Overload signatures
    /**
     * Create an app component instance.
     * @static
     * @param {string} name - The name of the component.
     * @param {Component} component - The Vue component to use.
     * @return {*}  {Promise<void>}
     * @memberof AppComponent
     */
    static async create(name: string, component: Component): Promise<void>;

    /**
     * Create an app component instance with options.
     * @static
     * @param {AppComponentOptionsPartial} options - The options for the component.
     * @return {*}  {Promise<void>}
     * @memberof AppComponent
     */
    static async create(options: AppComponentOptionsPartial): Promise<void>;

    static async create(
        nameOrOptions: string | AppComponentOptionsPartial,
        maybeComponent?: Component
    ): Promise<void> {
        let options = undefined;

        if (typeof nameOrOptions === 'string') {
            // Create options from name and component
            options = createAppComponentOptions({
                name: nameOrOptions,
                component: maybeComponent as Component,
            });
        } else {
            // Use the provided options directly
            options = createAppComponentOptions(nameOrOptions);
        }

        // Create a logger instance
        createLogger(options.debug, options.name || 'AppComponent');

        const hooks = AppComponent.getHooksInstance(
            options.name as string,
            options.debug,
            options.globalHooks
        );

        if (options.hooks) {
            // Add hooks from options
            for (const [hookName, callback] of Object.entries(options.hooks)) {
                hooks.on(hookName, callback);
            }
        }

        // Init hooks
        await hooks.emit('init', options);

        // Create the AppComponent instance
        const appComponent = new AppComponent(options, hooks);
        const componentBridge = appComponent.bridge();

        await hooks.emit('ready', componentBridge);

        // Create the Vue app
        await componentBridge.create();

        // If the component is set to auto-mount, create and mount it
        if (componentBridge.isAutoMount) {
            // Mount the Vue app
            await componentBridge.mount();
        }

        // TODO: return something?
    }

    protected static getHooksInstance(
        name: string,
        debug: boolean = false,
        global: boolean = false
    ): ComponentHooks {
        if (global) {
            // If global, return the global hooks instance
            const w = window as WindowWithAppComponentBridge;
            if (!w.__appComponentGlobalHooks) {
                w.__appComponentGlobalHooks = new ComponentHooks(name, debug);
            }

            return w.__appComponentGlobalHooks;
        }

        return new ComponentHooks(name, debug);
    }
}

export { AppComponent };
