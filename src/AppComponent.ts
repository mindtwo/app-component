import pascalCase from 'just-pascal-case';
import kebabCase from 'just-kebab-case';

import { App, Component, Plugin, createApp } from 'vue';
import { EventHelper, EventType } from './lib/Events';

export class AppComponent {

    name: string;
    component: Component;

    private events: EventHelper = new EventHelper();

    // TODO use hooks and events
    // private hooks = createHooks();

    vueApp: App | undefined;

    private props: { [key: string]: any } = {};

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
    }

    /**
     * Mount our Course Builder Vue App
     */
    mount(props?: { [key: string]: any }) {
        // check if wrapper exists
        if (!this.wrapper) {
            console.error('Wrapper not found', this.wrapperId);
            return;
        }

        // init app
        this.vueApp = createApp(this.component, props);

        // register components
        if (this.components.size) {
            for (const [name, component] of this.components.entries()) {
                this.vueApp.component(name, component);
            }
        }

        // register plugins
        if (this.plugins.length > 0) {
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

        this.vueApp.provide('emitter', this.events);

        // emit beforemount event
        this.events.emit('beforemount', this);

        // mount app
        this.vueApp.mount(this.wrapper);

        // emit mounted event
        this.events.emit('mounted', this);
    }

    /**
     * Unmount component by clearing its wrapper
     */
    unmount() {
        this.events.emit('unmounting', this);

        if (this.wrapper) {
            this.wrapper.innerHTML = '';
        }

        this.events.emit('unmounted', this);
        this.events.removeAllListeners();
    }

    /**
     * Destroy component
     */
    destroy() {
        const w = window as any;
        if (w && w[this.componentName]) {
            delete w[this.componentName];
        }
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

    provide(key: string, value: any): this {
        return this.registerProvide(key, value);
    }

    plugin(plugin: Plugin, options: any[]): this {
        return this.registerPlugin(plugin, options);
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
     * Register event listener
     * @param {EventType} event
     * @param {Function} callback
     * @returns {this}
     */
    addEventListener(event: EventType, callback: Function) {
        this.events.on(event, callback);

        return this;
    }

    /**
     * Alias for addEventListener
     *
     * @param {EventType} event
     * @param {Function} callback
     * @returns {this}
     */
    on(event: EventType, callback: Function) {
        return this.addEventListener(event, callback);
    }

    /**
     * Emit event
     * @param {EventType} event
     * @param args
     * @returns {this}
     */
    emit(event: EventType, ...args: any[]) {
        this.events.emit(event, ...args);

        return this;
    }

    isMounted(): boolean {
        return !!this.vueApp?._instance;
    }

    isCreated(): boolean {
        return !!this.vueApp;
    }

    get componentName() {
        return pascalCase(this.name) as string;
    }

    get elementName() {
        return kebabCase(this.name);
    }

    /**
     * @returns {string}
     */
    get wrapperId() {
        return `${this.elementName}-app`;
    }

    /**
     * Helper to get the mounted wrapper element
     *
     * @returns {Element}
     */
    get wrapper(): HTMLElement | null {
        return document.querySelector<HTMLElement>(`#${this.wrapperId}`);
    }

    setProps(props: { [key: string]: any }) {
        this.props = props;
    }

    static create(name: string, component: Component): AppComponent {
        const pascalName = pascalCase(name) as string;

        const appComponent = new this(name, component);

        (window as any)[pascalName] = appComponent;
        return appComponent;
    }
}
