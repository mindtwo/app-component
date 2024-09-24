import { Component } from 'vue';

import AttributeList from './lib/AttributeList';
import pascalCase from 'just-pascal-case';
import kebabCase from 'just-kebab-case';
import { AppComponent } from './AppComponent';

export class AppComponentElement extends HTMLElement {

    private name: string;

    private _app: AppComponent;

    constructor(name: string, component: Component) {
        super();

        this.name = name;

        this._app = AppComponent.create(name, component);
    }

    /**
     * Init our app view, equal to mount
     */
    connectedCallback() {

        // disable init start
        const wrapper = document.createElement('div');
        wrapper.setAttribute('id', this.app.wrapperId);

        this.appendChild(wrapper);

        // create wrapper div
        const { props } = this.getAttributes();

        // add props to app
        this.app.setProps(props);

        if (this.isAutoMount) {
            // TODO maybe if app component is added to window object we can auto mount
            this.app.mount(props);
        }
    }

    disconnectedCallback() {
        this.app.unmount();

        this.app.destroy();
    }

    /**
     * Get props and attributes for component
     *
     * @returns {Object}
     */
    getAttributes() {
        const props: { [key: string]: any } = {};
        const attrs: { [key: string]: any } = {};

        for (const attr of Array.from(this.attributes)) {
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

    get componentName() {
        return pascalCase(this.name) as string;
    }

    get elementName() {
        return kebabCase(this.name);
    }
}
