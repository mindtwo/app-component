import { PluginOptions } from 'app-component-plugin';

export const normalizeOptions = (options: any): PluginOptions => {
    return {
        enforce: options.enforce || 'post',
        basePath: options.basePath || '',
        ...options,
    };
};
