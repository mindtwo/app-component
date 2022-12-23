import pascalCase from 'just-pascal-case';
import { EventDispatcher } from './lib/events';

import { createApp } from 'vue';
import { LocalStore } from './lib/local-store';

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

        this.auth = new LocalStore('auth');
    }

    /**
     * Log user in via an apps provider using app url using credentials as body
     *
     * @param {Object} credentials
     */
    async login(appUrl, credentials) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const response = await fetch(`${appUrl}`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers,
        });

        const json = response.json();

        for (const [key, value] of Object.entries(json)) {
            this.auth[key] = value;
        }

        return json;
    }

    /**
     * Set auth data for current user (we are already logged in via an apps provider)
     *
     * @param {Object} tokenData
     */
    setTokenData(tokenData) {
        for (const [key, value] of Object.entries(tokenData)) {
            this.auth[key] = value;
        }
    }

    /**
     * Mount our Course Builder Vue App
     *
     * @param {Object} props
     */
    mount(props = {}) {
        EventDispatcher.dispatch('beforemount', this.name);

        this.vueApp = createApp(this.component, props);
        // register components
        if (this.components && Object.keys(this.components).length) {
            Object.entries(this.components).forEach(([name, component]) => {
                this.vueApp.component(name, component);
            });
        }

        // register plugins
        if (this.plugins && Object.keys(this.plugins).length) {
            Object.entries(this.plugins).forEach(([plugin, options]) => {
                this.vueApp.use(plugin, options);
            });
        }

        this.vueApp.mount(this.wrapper);

        EventDispatcher.dispatch('mounted', this.name);
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
     * @param {Object} plugins
     */
    registerPlugins(plugins) {
        this.plugins = plugins;

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
