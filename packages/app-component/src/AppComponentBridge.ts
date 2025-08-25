import { App, Component, createApp } from 'vue';
import { type Logger, createLogger } from './lib/logger';
import AppComponentHtmlElement from './AppComponentHtmlElement';
import { ComponentHooks } from './lib/hooks';

export type WindowWithAppComponentBridge = Window &
    typeof globalThis & {
        [key: string]: AppComponentBridge;
    };

/**
 * AppComponent.ts
 *
 * This class handles the main communication and lifecycle management.
 * It provides methods to create, mount, and destroy the app component.
 * It is registered as a global window object.
 *
 * @export
 * @class AppComponentBridge
 */
export default class AppComponentBridge {
    private _logger: Logger;

    // Name of the component/window key
    private name: string;

    // Hooks for the component
    private hooks: ComponentHooks;

    // Root component of the app
    private rootComponent: Component;

    // Vue App instance
    private vueApp: App | null = null;

    // HTML element associated with the component
    private element: AppComponentHtmlElement | null = null;

    constructor(name: string, component: Component, hooks: ComponentHooks) {
        this._logger = createLogger();

        // Set properties
        this.name = name;
        this.rootComponent = component;
        this.hooks = hooks;
    }

    public setElement(element: AppComponentHtmlElement): void {
        // Logic to set the HTML element for the component
        this._logger.debug(`Setting element for app component: ${this.name}`);

        this.element = element;
    }

    public get isAutoMount(): boolean {
        // Check if the component is set to auto-mount
        if (!this.element) {
            return false;
        }

        return this.element.autoMount;
    }

    // Lifecycle methods

    /**
     * Create the app component
     *
     * @returns {Promise<void>}
     */
    public async create(): Promise<void> {
        if (!this.element) {
            this._logger.error(
                `Element not set for app component: ${this.name}`
            );
            return;
        }

        // Check if the component is already initialized
        if (!this.element.isInitialized) {
            this.element.createComponentDOM();
        }

        await this.hooks.emit('creating', this);

        // Logic to create the app component
        this._logger.debug(`Creating app component: ${this.name}`);

        // Skip if the Vue app is already created
        if (this.vueApp) {
            this._logger.warn(
                `Vue app already created for component: ${this.name}`
            );
            return;
        }

        // props
        const props = this.element.props ?? {};

        // Assuming we have a Vue component to register
        // This is a placeholder for actual Vue component registration logic
        this.vueApp = createApp(this.rootComponent, props);

        this._logger.debug(`Vue app created for component: ${this.name}`);

        // Provide hooks to the Vue app
        this.vueApp.provide('hooks', this.hooks);
        this.vueApp.provide('$getRoot', () => this.element?.root());

        await this.hooks.emit('created', this, this.vueApp);
    }

    /**
     * Mount the app component
     *
     * @returns {Promise<void>}
     */
    public async mount(): Promise<void> {
        await this.hooks.emit('mounting', this, this.vueApp);

        // Logic to mount the app component
        this._logger.debug(`Mounting app component: ${this.name}`);

        if (!this.element) {
            this._logger.error(
                `Element not set for app component: ${this.name}`
            );
            return;
        }

        if (!this.vueApp) {
            this._logger.error(
                `Vue app not created for component: ${this.name}`
            );
            return;
        }

        // Mount the Vue app to a specific DOM element
        // This should be replaced with the actual mount point in your application
        this.vueApp.mount(this.element.getWrapper());

        this._logger.debug(`App component ${this.name} mounted successfully.`);

        await this.hooks.emit('mounted', this, this.vueApp);
    }

    /**
     * Destroy the app component
     *
     * @returns {Promise<void>}
     */
    public async unmount(): Promise<void> {
        await this.hooks.emit('unmounting', this);
        // Logic to destroy the app component
        this._logger.debug(`Destroying app component: ${this.name}`);
        // const w = window as WindowWithAppComponentBridge;

        // remove the Vue app instance
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }

        // Remove the inner dom of the element
        if (this.element) {
            this.element.unmount();
        }

        // Remove the component from the global window object
        // if (w[this.name]) {
        //     delete w[this.name];
        // }

        await this.hooks.emit('unmounted', this);
    }

    public recreate() {
        if (!this.element) {
            return;
        }

        this.element.createComponentDOM();
        this.create();
    }

    /**
     * Check if the Vue app has been created
     *
     * @returns {boolean}
     */
    public created(): boolean {
        // Check if the Vue app has been created
        return this.vueApp !== null;
    }

    /**
     * Get the name of the component
     *
     * @returns {string}
     */
    public getName(): string {
        return this.name;
    }

    // HOOKS

    /**
     * Register a hook callback for a specific hook name.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to register.
     * @param {boolean} [once=false] - If true, the callback will be called only once.
     * @throws {Error} If the hook name is invalid.
     * @memberof AppComponentBridge
     * @return {void}
     */
    public on(
        hookName: string,
        callback: (data?: any) => void,
        once: boolean = false
    ): void {
        this.hooks.on(hookName, callback, once);
    }

    /**
     * Remove a hook callback for a specific hook name.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to remove.
     * @return {void}
     */
    public off(hookName: string, callback: (data?: any) => void): void {
        this.hooks.off(hookName, callback);
    }

    public emit(hookName: string, data?: any): void {
        this.hooks.emit(hookName, data);
    }

    public trigger(hookName: string, data?: any): void {
        this.hooks.trigger(hookName, data);
    }
}
