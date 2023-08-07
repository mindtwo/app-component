import pascalCase from 'just-pascal-case';
import { EventDispatcher } from './lib/Events';

import { App, Component, Plugin, createApp } from 'vue';

export class AppComponent {

    name: string;
    component: Component;

    eventbus: any;

    private vueApp: App | undefined;

    private components: Map<string, Component> = new Map();
    private provides: Map<string, any> = new Map();
    private plugins: { plugin: Plugin, options: any[] }[] = [];

    /**
     * Create global app helper
     *
     * @param {string} name - helper name
     * @param {Component} component - helper name
     */
    constructor(name: string, component: Component) {
        this.name = name;
        this.component = component;

        // app components eventBus
        this.eventbus = null;
    }

    /**
     * Mount our Course Builder Vue App
     *
     * @param {Object} props
     */
    mount(props = {}) {
        EventDispatcher.dispatch('beforemount', this);

        this.vueApp = createApp(this.component, props);

        // register components
        if (this.components.size) {
            for (const [name, component] of this.components.entries()) {
                this.vueApp.component(name, component);
            }
        }

        // register plugins
        if (this.plugins.length) {
            for (const { plugin, options } of this.plugins) {
                this.vueApp.use(plugin, options);
            }
        }

        // register components
        if (this.provides.size) {
            for (const [key, value] of this.provides.entries()) {
                this.vueApp.provide(key, value);
            }
        }

        this.vueApp.mount(this.wrapper);

        EventDispatcher.dispatch('mounted', this);
    }

    /**
     * Unmount component by clearing its wrapper
     */
    unmount() {
        if (!this.wrapper) {
            return;
        }

        this.wrapper.innerHTML = '';
    }

    /**
     * Register components, that are used by vue
     *
     * @param {Map<string, Component>} components
     */
    registerComponents(components: Map<string, Component>) {
        components.forEach((component, name) => {
            this.registerComponent(name, component);
        });


        return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Array} plugins
     */
    registerPlugins(plugins: { plugin: Plugin, options: any[] }[]) {
        plugins.forEach(({ plugin, options }) => {
            this.registerPlugin(plugin, options);
        });

        return this;
    }

    /**
     *
     * @param name - name of component
     * @param component - component
     * @returns this
     */
    registerComponent(name: string, component: Component): this {
        this.components.set(name, component);

        return this;
    }

    /**
     * Register global injection inside app
     *
     * @param {string} key
     * @param {any} value
     */
    registerProvide(key: string, value: any): this {
        this.provides.set(key, value);

        return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Plugin} plugin
     * @param {any} options
     */
    registerPlugin(plugin: Plugin, options: any[]): this {
        this.plugins.push({
            plugin,
            options,
        });

        return this;
    }

    /**
     * Register EventBus
     *
     * @param {Object} eventbus
     */
    registerEventbus(eventbus: any): this {
        this.eventbus = eventbus;

        return this;
    }

    /**
     * @returns {string}
     */
    get wrapperId() {
        return `${this.name}-app`;
    }

    /**
     * Helper to get the mounted wrapper element
     *
     * @returns {Element}
     */
    get wrapper(): HTMLElement | null {
        return document.querySelector<HTMLElement>(`#${this.wrapperId}`);
    }

    /**
     *
     * @param {string} name
     * @param {*} component
     * @returns {this}
     */
    static make(name: string, component: Component) {
        const pascalName = pascalCase(name) as string;

        const appComponent = new this(name, component);

        (window as any)[pascalName] = appComponent;
        return appComponent;
    }
}
