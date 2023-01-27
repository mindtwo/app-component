import pascalCase from 'just-pascal-case';
import { EventDispatcher } from './lib/events';

import { createApp } from 'vue';

export class AppComponent {
    /**
     * Create global app helper
     *
     * @param {string} name - helper name
     * @param {*} component - helper name
     */
    constructor(name, component) {
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
        if (this.components && Object.keys(this.components).length) {
            Object.entries(this.components).forEach(([name, component]) => {
                this.vueApp.component(name, component);
            });
        }

        // register plugins
        if (this.plugins?.length) {
            this.plugins.forEach((obj) => {
                this.vueApp.use(obj.plugin, obj.options);
            });
        }

        // register components
        if (this.provides && Object.keys(this.provides).length) {
            Object.entries(this.provides).forEach(([key, value]) => {
                this.vueApp.provide(key, value);
            });
        }

        this.vueApp.mount(this.wrapper);

        EventDispatcher.dispatch('mounted', this);
    }

    /**
     * Unmount component by clearing its wrapper
     */
    unmount() {
        this.wrapper.innerHTML = '';
    }

    /**
     * Register components, that are used by vue
     *
     * @param {Object} components
     */
    registerComponents(components) {
        this.components = components;

        return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Array} plugins
     */
    registerPlugins(plugins) {
        if (!this.plugins) {
            this.plugins = [];
        }

        this.plugins.push(...plugins);

        return this;
    }

    /**
     * Register EventBus
     *
     * @param {Object} eventbus
     */
    registerEventbus(eventbus) {
        this.eventbus = eventbus;

        return this;
    }

    /**
     * Register global injection inside app
     *
     * @param {string} key
     * @param {Object} value
     */
    registerProvide(key, value) {
        if (!this.provides) {
            this.provides = {};
        }

        this.provides[key] = value;

        return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Object} plugin
     * @param {Object} options
     */
    registerPlugin(plugin, options) {
        if (!this.plugins) {
            this.plugins = [];
        }

        this.plugins.push({
            plugin,
            options,
        });

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
    get wrapper() {
        return document.querySelector(`#${this.wrapperId}`);
    }

    /**
     *
     * @param {string} name
     * @param {*} component
     * @returns {this}
     */
    static make(name, component) {
        const pascalName = pascalCase(name);

        const appComponent = new this(name, component);

        window[pascalName] = appComponent;
        return appComponent;
    }
}
