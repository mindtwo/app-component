// src/types/global.d.ts

declare module 'app-component-plugin' {
    export interface AppComponentOptions {
        /**
         * The name of the plugin.
         * This is used for debugging and logging purposes.
         *
         * @type {string}
         * @memberof PluginOptions
         */
        name?: string;
        /**
         * The component to be used.
         * This can be a string representing the component name or an object with component options.
         *
         * @type {(string | object)}
         * @memberof PluginOptions
         */
        component?: any;
        /**
         * Whether to enable shadow DOM encapsulation.
         * If true, the component will be rendered inside a shadow root.
         *
         * @type {boolean}
         * @memberof PluginOptions
         */
        shadowRoot?: boolean;
        /**
         * Whether to enable debug mode.
         * If true, additional debug information will be logged.
         *
         * @type {boolean}
         * @memberof PluginOptions
         */
        debug?: boolean;
        hooks?: Record<string, (...args: any[]) => void>;
    }

    export interface PluginOptions extends AppComponentOptions {
        enforce?: 'pre' | 'post' | undefined;

        /**
         * Whether to add a manifest loader to the component.
         * If set to a string, it will be used as the name of the loader.
         * Else we default to the name of the component.
         *
         * @type {(boolean | string)}
         * @memberof PluginOptions
         */
        manifestLoader?: boolean | string;

        /**
         * Base path for the component.
         * This is used to resolve the component's assets.
         *
         * @type {string}
         * @memberof PluginOptions
         */
        basePath?: string;

        /**
         * URL to fetch the manifest.json from.
         * Defaults to './manifest.json' if not provided.
         *
         * @type {string}
         * @memberof PluginOptions
         */
        manifestUrl?: string;

        /**
         * Module specifier of a custom script loader. When set, the manifest
         * loader will dynamic-import this module and delegate script injection
         * to its default export (a function matching the `ScriptLoader` type
         * exported from this package).
         *
         * Example: `'@mindtwo/app-component-nuxt-scripts'`.
         *
         * @type {string}
         * @memberof PluginOptions
         */
        scriptLoader?: string;
    }

    export const defineAppComponent: (options: PluginOptions) => void;
}
