import { type Logger, createLogger } from './lib/logger';
import NAMES from './lib/attribute-list';
import kebabCase from 'just-kebab-case';
import { ComponentHooks } from './lib/hooks';
import {
    type AttributeType,
    isAttributeType,
    parseAttribute,
} from './lib/parse-attribute';

const TYPE_HINT_PREFIX = 'data-type-';

export default class AppComponentHtmlElement extends HTMLElement {
    private _logger: Logger;

    // Options
    private useShadowRoot: boolean = false;
    protected name: string;

    // Hooks
    private _hooks?: ComponentHooks;

    // DOM
    private shadow?: ShadowRoot;
    private wrapper: HTMLElement | null = null;

    // Attributes and props
    autoMount: boolean = false;

    protected _props: { [key: string]: unknown } = {};
    protected _attrs: { [key: string]: string } = {};

    constructor(name: string, useShadowRoot: boolean = false, hooks?: ComponentHooks) {
        super();

        // Create a logger instance
        this._logger = createLogger();
        this._hooks = hooks;

        this.name = name;
        this.useShadowRoot = useShadowRoot;

        // Initialize attributes and props
        this.initAttributesAndProps();

        // Initialize the component DOM
        this.initComponentDOM();

        this._hooks?.emit('initialized', this);
    }

    connectedCallback() {
        this._logger.debug(`AppComponentHtmlElement connected: ${this.name}`);

        this._hooks?.emit('connected', this);
    }

    disconnectedCallback() {
        // Cleanup if necessary
        this._hooks?.emit('disconnected', this);
    }

    getWrapperId(): string {
        const wrapperId = `${this.name}-wrapper`;

        return wrapperId;
    }

    /**
     * Get the wrapper for the app component
     *
     * @returns {HTMLElement}
     */
    getWrapper(): HTMLElement {
        if (!this.wrapper) {
            this._logger.error(`Wrapper not found for app component: ${this.name}`);
            return this;
        }

        return this.wrapper;
    }

    /**
     * Get the root element for the app component
     * @returns {ShadowRoot | HTMLElement}
     */
    root(): ShadowRoot | HTMLElement {
        if (this.shadow) {
            return this.shadow;
        }

        return document.documentElement;
    }

    addChild(child: Node, target: 'root' | 'wrapper' = 'wrapper'): Node {
        // If shadow root is used, append to shadow root
        if (target === 'root' && this.shadow) {
            return this.shadow.appendChild(child);
        }

        if (!this.wrapper) {
            return this.appendChild(child);
        }

        return this.wrapper.appendChild(child);
    }

    get isInitialized(): boolean {
        // Check if the component is initialized
        return (!!this.shadow || !!this.wrapper) && this.innerHTML !== '';
    }

    public clearProps(): void {
        // Clear the props object
        this._props = {};
        this._attrs = {};
        this.autoMount = false;
    }

    public unmount(): void {
        this._logger.debug(`Unmounting app component: ${this.name}`);

        // Remove the wrapper element if it exists
        this.wrapper?.remove();
        this.wrapper = null;
        // Clear the shadow root if it exists
        this.shadow = undefined;

        this.innerHTML = '';
    }

    public createComponentDOM(): HTMLElement | null {
        if (this.wrapper) {
            return this.wrapper;
        }

        // Create a wrapper element for the app component
        this.initComponentDOM();

        if (!this.wrapper) {
            this._logger.error(`Wrapper not initialized for app component: ${this.name}`);
            return null;
        }

        return this.wrapper;
    }

    private initComponentDOM() {
        if (this.isInitialized) {
            return;
        }

        // Create a shadow root if enabled
        if (this.useShadowRoot) {
            this.shadow = this.attachShadow({ mode: 'open' });
        }

        // Create a wrapper element for the app component
        const wrapper = document.createElement('div');

        wrapper.setAttribute('id', this.getWrapperId());
        this.addChild(wrapper, 'root');

        // Save reference to the wrapper element
        this.wrapper = wrapper;

        this._logger.debug(
            `Initialized component DOM for: ${this.name}, useShadowRoot: ${this.useShadowRoot}`
        );
    }

    get attrs(): { [key: string]: string } {
        if (Object.keys(this._attrs).length === 0) {
            this.collectAttrs();
        }

        // Return the collected attributes
        return this._attrs;
    }

    get props(): { [key: string]: unknown } {
        if (Object.keys(this._props).length === 0) {
            this.collectProps();
        }

        // Return the collected props
        return this._props;
    }

    /**
     * Get props and attributes for component
     *
     * @returns {Object}
     */
    private initAttributesAndProps() {
        this.collectProps();
        this.collectAttrs();
    }

    private collectProps(force: boolean = false): void {
        if (Object.keys(this._props).length > 0 && !force) {
            // Props already collected
            return;
        }

        // Pass 1: collect type hints (data-type-{prop}="number|boolean|json|string")
        const typeHints: { [propName: string]: AttributeType } = {};
        for (const attr of Array.from(this.attributes)) {
            const attrName = kebabCase(attr.name);

            if (!attrName.startsWith(TYPE_HINT_PREFIX)) continue;

            const propName = attrName.slice(TYPE_HINT_PREFIX.length);
            if (!propName) continue;

            if (isAttributeType(attr.value)) {
                typeHints[propName] = attr.value;
            } else {
                this._logger.warn(
                    `Ignoring ${attrName}="${attr.value}" — expected one of "string", "number", "boolean", "json".`
                );
            }
        }

        // Pass 2: collect props, applying type hints when present
        for (const attr of Array.from(this.attributes)) {
            const attrName = kebabCase(attr.name);

            if (NAMES.includes(attrName) || attrName.startsWith('data-v-')) {
                // Skip known attribute names
                continue;
            }

            if (attrName.startsWith(TYPE_HINT_PREFIX)) {
                // Type-hint attributes are metadata, not forwarded as props
                continue;
            }

            if (attrName === 'auto-mount') {
                this.autoMount = attr.value === 'true';
                continue;
            }

            const type = typeHints[attrName] ?? 'string';
            this._props[attrName] = parseAttribute(attr.value, type);
        }
    }

    private collectAttrs(force: boolean = false): void {
        if (Object.keys(this._attrs).length > 0 && !force) {
            // Attributes already collected
            return;
        }

        // Collect attributes from the component
        for (const attr of Array.from(this.attributes)) {
            const attrName = kebabCase(attr.name);

            if (NAMES.includes(attrName)) {
                this._attrs[attrName] = attr.value;
            }
        }
    }
}
