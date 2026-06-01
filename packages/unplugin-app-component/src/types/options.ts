import { PluginOptions } from 'app-component-plugin';

/**
 * Custom script-loading hook for the manifest loader. Implementations should
 * inject the script into the page (for example, via `nuxt-scripts`' `useScript`
 * or a CSP-aware loader) and resolve once it has loaded.
 */
export type ScriptLoader = (script: { src: string; id?: string }) => Promise<void>;

export const normalizeOptions = (options: any): PluginOptions => {
    return {
        enforce: options.enforce || 'post',
        basePath: options.basePath || '',
        ...options,
    };
};
