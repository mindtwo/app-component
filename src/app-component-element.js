import AttributeList from './lib/attribute-list';
import { EventDispatcher } from './lib/events';
import { AppComponent } from './app-component';

export class AppComponentElement extends HTMLElement {
    constructor(name, component) {
        super();

        this.name = name;
        this.component = component;
        this.app = null;
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

        this.app = AppComponent.make(this.name, this.component);

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
        const props = {};
        const attrs = {};

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
