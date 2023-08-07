import AttributeList from './lib/AttributeList';
import { EventDispatcher } from './lib/Events';
import { AppComponent } from './AppComponent';
import { Component } from 'vue';

export class AppComponentElement extends HTMLElement {

    name: string;
    component: Component;

    private _app: AppComponent;

    constructor(name: string, component: Component) {
        super();

        this.name = name;
        this.component = component;

        this._app = AppComponent.make(this.name, this.component);
    }

    /**
     * Init our app view, equal to mount
     */
    connectedCallback() {
        // disable init start
        // EventDispatcher.dispatch('init', this.name);

        // create wrapper div
        const wrapper = document.createElement('div');
        wrapper.id = this.wrapperId;

        // add to element DOM
        this.appendChild(wrapper);

        EventDispatcher.dispatch('initialized', this.app);

        if (this.isAutoMount) {
            const { props } = this.getAttributes();
            this.app.mount(props);
        }
    }

    /**
     * Get props and attributes for component
     *
     * @returns {Object}
     */
    getAttributes() {
        const props: { [key: string]: any } = {};
        const attrs: { [key: string]: any } = {};

        for (const attr of this.attributes) {
            if (attr.name === 'auto-mount') {
                continue;
            }

            if (AttributeList.includes(attr.name)) {
                attrs[attr.name] = attr.value;
                continue;
            }

            props[attr.name] = attr.value;
        }

        for (const prop of Object.keys(props)) {
            this.removeAttribute(prop);
        }

        return {
            props,
            attrs,
        };
    }

    get app(): AppComponent {
        return this._app;
    }

    /**
     * Check if the app component mounted
     *
     * @returns {boolean}
     */
    get isAutoMount() {
        return this.hasAttribute('auto-mount');
    }

    /**
     * @returns {string}
     */
    get wrapperId() {
        return `${this.name}-app`;
    }
}
