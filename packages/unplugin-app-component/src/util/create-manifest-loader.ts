import { PluginOptions } from 'app-component-plugin';

/**
 * Get the filename for the manifest loader based on the provided options.
 *
 * @param {(string | boolean | undefined)} manifestLoader
 * @param {PluginOptions} options
 * @return {*}  {(string | null)}
 */
const resolveManifestLoaderFileName = (
    manifestLoader: string | boolean | undefined,
    options: PluginOptions
): string | null => {
    if (typeof manifestLoader === 'string') {
        return manifestLoader.endsWith('.js') ? manifestLoader : `${manifestLoader}.js`;
    }

    if (manifestLoader === true) {
        return options.name ? `${options.name}-loader.js` : 'manifest-loader.js';
    }

    return null;
};

/**
 * Generate the content for the manifest loader script.
 *
 * @param {string} manifestUrl - The URL to fetch the manifest from.
 * @param {string} [templateContent] - The template content to use.
 * @param {string} [entry] - The entry point for the application (optional).
 * @param {string} basePath - The base path for loading assets.
 * @return {*}  {string}
 */
const getManifestLoaderContent = (
    manifestUrl: string,
    templateContent: string,
    basePath: string = '/'
): string => {
    console.log(`Generating manifest loader with URL: ${manifestUrl} and base path: ${basePath}`);

    return templateContent
        .replace('__MANIFEST_URL__', `"${manifestUrl}"`)
        .replace('__BASE_PATH__', `"${basePath}"`)
        .trim();
};

/**
 * Create a manifest loader file based on the provided options.
 *
 * @param {any} builderContext - The context of the builder.
 * @param {PluginOptions} options - The plugin options.
 * @param {string} [templateContent] - Optional template content to use instead of inline template.
 */
export const createManifestLoader = (
    builderContext: any,
    options: PluginOptions,
    templateContent: string
) => {
    if (!options.manifestLoader) {
        return;
    }

    // Generate the manifest URL
    const manifestUrl = options.manifestUrl || 'manifest.json';

    // Resolve the loader file name
    const loaderFileName = resolveManifestLoaderFileName(options.manifestLoader, options);

    // Create the loader file
    builderContext.emitFile({
        type: 'asset',
        name: 'manifest-loader',
        fileName: loaderFileName,
        source: getManifestLoaderContent(manifestUrl, templateContent, options.basePath),
    });
};
