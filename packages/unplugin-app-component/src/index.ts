import { createUnplugin, type UnpluginInstance } from 'unplugin';
import type { Options } from 'app-component-plugin';
import {
    defineAppComponentTrasform,
    defineAppComponentTrasformInclude,
} from './macros/defineAppComponent';

export const AppComponentPlugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
    (rawOptions = {}) => {
        const options = rawOptions as Options;

        const name = 'unplugin-app-component';
        return {
            name,
            enforce: options.enforce,

            transformInclude: defineAppComponentTrasformInclude,

            transform: defineAppComponentTrasform,
        };
    }
);
