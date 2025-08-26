import { createUnplugin, type UnpluginInstance } from 'unplugin';
import type { PluginOptions } from 'app-component-plugin';
import {
    defineAppComponentTrasform,
    defineAppComponentTrasformInclude,
} from './macros/defineAppComponent';
import { normalizeOptions } from './types/options';
import { createManifestLoader } from './util/create-manifest-loader';

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppComponentPlugin: UnpluginInstance<PluginOptions | undefined, false> =
    createUnplugin((rawOptions = {}) => {
        const options = normalizeOptions(rawOptions);

        const name = 'unplugin-app-component';

        let templateContent: string | undefined = undefined;

        return {
            name,
            enforce: options.enforce,

            transformInclude: defineAppComponentTrasformInclude,

            transform: defineAppComponentTrasform,

            async buildStart() {
                const templatePath = path.resolve(
                    __dirname,
                    '../src/util',
                    'manifest-loader.template.js'
                );
                templateContent = await readFile(templatePath, 'utf-8');

                // store or emit it later
                // this.logger.info(`[unplugin] Loaded JS template:\n${templateContent}`);
            },

            generateBundle(_bundleOptions: any, _bundle: any) {
                createManifestLoader(this, options, templateContent ?? '');
            },
        };
    });
