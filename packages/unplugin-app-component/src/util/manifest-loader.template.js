/**
 * Get the URL of a path, resolving relative paths against the current location.
 *
 * @param {string|undefined} path
 * @return {string}
 */
function resolveUrl(path) {
    // If path is already absolute URL, return as is
    try {
        new URL(path);
        return path;
    } catch (e) {
        // Handle relative paths
        if (path?.startsWith('/')) {
            return window.location.origin + path;
        } else {
            return new URL(path, window.location.href).href;
        }
    }
}

/**
 * Get the root element for the app component.
 * To inject scripts and styles into the correct place in the DOM.
 */
function getComponentRoot() {
    const component = window[__APP_COMPONENT_NAME__];
    if (component && component.element && component.element.root) {
        return component.element.root();
    }

    return document.head; // Fallback to document head if no root found
}

function getBaseUrl() {
    const basePath = __BASE_PATH__;

    if (basePath.startsWith('window.') && window[basePath.slice(7)]) {
        const resolvedPath = window[basePath.slice(7)];

        if (typeof resolvedPath === 'string') {
            return resolveUrl(resolvedPath);
        }

        if (typeof resolvedPath === 'function') {
            return resolveUrl(resolvedPath());
        }
    }

    return resolveUrl(basePath);
}

const loader = {
    hooks: {},
    isLoaded: false,
    manifest: undefined,
    scripts: [],
    stylesheets: [],
    _registerHook: function (hookName, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Hook callback must be a function');
        }

        if (!this.hooks[hookName]) {
            this.hooks[hookName] = [];
        }

        this.hooks[hookName].push(callback);
    },
    /**
     * Call a hook with the provided name and arguments.
     */
    _callHooks: function (hookName, ...args) {
        if (this.hooks[hookName]) {
            this.hooks[hookName].forEach((callback) => callback(...args));
        }
    },
    /**
     * Unload the component and clear the state.
     */
    removeHooks: function () {
        // Clear all hooks
        this.hooks = {};
    },
    /**
     * Unload the component and clear the state.
     */
    unload: function () {
        this._callHooks('unload');

        // Clear state
        this.removeHooks();
        this.isLoaded = false;
    },
    /**
     * Call the 'load' hook when the manifest loading is completed.
     */
    loaded: function () {
        // Call the 'load' hook
        this._callHooks('load');

        this.isLoaded = true;
    },
    /**
     * Register a callback to be called when the manifest loading is completed.
     *
     * @param {Function} callback - The callback function to call when the manifest is loaded.
     * @throws {Error}
     */
    onLoad: function (callback) {
        this._registerHook('load', callback);
    },
    /**
     * Register a callback to be called when an entry is loaded
     *
     * @param {Function} callback - The callback function to call when the manifest is loaded.
     * @throws {Error}
     */
    onEntryLoading: function (callback) {
        this._registerHook('entryLoading', callback);
    },
    /**
     * Register a callback to be called when an entry of the manifest is loaded.
     *
     * @param {Function} callback - The callback function to call when a part is loaded.
     * @throws {Error}
     */
    onEntryLoaded: function (callback) {
        this._registerHook('entryLoaded', callback);
    },
    /**
     * Load a script from the passed url
     *
     * @param {string} scriptUrl
     * @returns
     */
    loadScript: function (script) {
        const baseUrl = getBaseUrl();

        const scriptUrl = typeof script === 'string' ? script : script.file || script.src;
        const src = resolveUrl(scriptUrl.startsWith('/') ? scriptUrl : `${baseUrl}/${scriptUrl}`);

        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => {
                // Call the entryLoading hook for scripts
                this._callHooks('entryLoaded', 'script', script);

                // Resolve with the script URL
                resolve(scriptUrl);
            };
            s.onerror = reject;
            document.head.appendChild(s);
        });
    },
    /**
     * Load a stylesheet for given linkHref
     *
     * @param {*} linkHref
     * @param {*} stylesheet
     * @param {*} target
     * @returns
     */
    loadStylesheet: function (linkHref, stylesheet) {
        // Get the root element for the app component
        const root = getComponentRoot();

        if (!root) {
            console.warn('No component root found');

            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = linkHref;
            link.onload = () => {
                // Call the entryLoaded hook for stylesheets
                callLoaderHook('entryLoaded', 'style', stylesheet);

                // Resolve with the stylesheet URL
                resolve(linkHref);
            };
            link.onerror = reject;
            root.appendChild(link);
        });
    },
    /**
     * Split the manifest in entries and stylesheets
     *
     * @param {*} manifest
     */
    parseManifest: function (manifest) {
        const assets = Object.values(manifest);
        if (assets.length === 0) throw new Error('No entry points found in manifest');

        //
        for (const asset of assets) {
            // If entry is a css file, add it to the stylesheets array
            if (asset.file.endsWith('.css')) {
                this.stylesheets.push(asset);
                continue;
            }

            // Chunks and scripts may also have associated CSS files
            const cssFiles = asset.css || [];
            if (Array.isArray(cssFiles) && cssFiles.length > 0) {
                // If entry has CSS files, add them to the stylesheets array
                cssFiles.forEach((cssFile) => {
                    this.stylesheets.push(cssFile);
                });
            }

            // check if asset isEntry
            if (asset.isEntry) {
                this.scripts.push(asset);
            }
        }
    },
    /**
     * Load the manifest
     */
    loadManifest: async function (manifestUrl) {
        if (!manifestUrl) {
            throw new Error('Manifest URL is required to load the manifest');
        }
        if (this.isLoaded) {
            console.warn('Manifest is already loaded, no need to load again.');
            return;
        }

        try {
            // Fetch the manifest from the specified URL
            const response = await fetch(manifestFullUrl, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'omit',
                method: 'GET',
                cache: 'no-cache',
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch manifest: ${response.status} ${response.statusText}`
                );
            }

            // Check if the response is JSON
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.indexOf('application/json') === -1) {
                throw new Error(`Expected JSON manifest, but got: ${contentType}`);
            }

            const manifest = await response.json();

            // Add manifest content to this object
            this.manifest = manifest;

            // parse content
            this.parseManifest(manifest);

            return manifest;
        } catch (error) {
            throw error;
        }
    },
};

const loadComponentFromManifest = async () => {
    const manifestUrl = __MANIFEST_URL__;
    const basePath = __BASE_PATH__;

    const appComponentName = '__APP_COMPONENT_NAME__';

    // Loader instance
    const _loader = window['__APP_COMPONENT_LOADER_NAME__'];

    /**
     * Fetch the manifest from the specified URL and return its content.
     * @returns {Promise<any>} - A promise that resolves with the manifest content.
     */
    async function fetchManifest() {
        const baseUrl = getBaseUrl();
        const manifestFullUrl = resolveUrl(
            manifestUrl.startsWith('/') ? manifestUrl : `${baseUrl}/${manifestUrl}`
        );

        // Call the loadManifest method on the loader
        const manifest = await _loader.loadManifest(manifestFullUrl);

        return manifest;
    }

    /**
     * Load scripts from the manifest entries.
     *
     * @param {*} manifest - The manifest entries to load.
     * @returns {Promise<void>}
     */
    async function loadScripts() {
        if (!_loader.scripts?.length) {
            throw new Error('No entry points found in manifest');
        }

        for (const entry of _loader.scripts) {
            // Load JavaScript chunks
            const chunks = entry.imports || [];
            for (const chunk of chunks) {
                await __loader.loadScript(chunk);
            }

            // Load main entry script
            await __loader.loadScript(entry);
        }
    }

    /**
     * Load stylesheets from the manifest entries.
     *
     * @param {*} manifest
     * @return {*}
     */
    async function loadStylesheets() {
        // If no stylesheets are found, return early
        if (!_loader.stylesheets?.length === 0) {
            return;
        }

        // Load stylesheets
        for (const stylesheet of _loader.stylesheets) {
            await _loader.loadStylesheet(stylesheet);
        }
    }

    /**
     * Load the manifest and its entries, then load scripts and stylesheets.
     * This function is called when the window is ready.
     */
    async function loadFromManifest() {
        await fetchManifest();

        try {
            // Load scripts from manifest
            await loadScripts();
        } catch (error) {
            // Fail silently if scripts cannot be loaded
        }

        try {
            // Load stylesheets from manifest
            await loadStylesheets();
        } catch (_error) {
            // fail silently if stylesheets cannot be loaded
        }
    }

    loadFromManifest()
        .then(() => {
            // Call the loaded method on the app component loader
            _loader.loaded();

            // Optionally, you can dispatch a custom event after loading
            const event = new CustomEvent('manifest-loaded', {
                detail: { manifestUrl, basePath, appComponentName },
            });
            document.dispatchEvent(event);
        })
        .catch((err) => {
            // Silent error handling
            console.error(`Error loading manifest from ${manifestUrl}:`, err);
        });
};

/**
 * Helper function to load the component when the window is ready.
 *
 * @param {*} callback
 */
function winLoad(callback) {
    if (document.readyState === 'complete') {
        callback();
    } else {
        document.addEventListener('load', callback);
    }
}

winLoad(async function () {
    await loadComponentFromManifest();
});

// Expose a helper object to manage the loading state and callbacks
window['__APP_COMPONENT_LOADER_NAME__'] = loader;
