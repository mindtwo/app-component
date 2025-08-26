const loadComponentFromManifest = async () => {
    const manifestUrl = __MANIFEST_URL__;
    const basePath = __BASE_PATH__;

    const appComponentName = '__APP_COMPONENT_NAME__';

    /**
     * Get the URL of a path, resolving relative paths against the current location.
     *
     * @param {*} path
     * @return {*}
     */
    function resolveUrl(path) {
        // If path is already absolute URL, return as is
        try {
            new URL(path);
            return path;
        } catch (e) {
            // Handle relative paths
            if (path.startsWith('/')) {
                return window.location.origin + path;
            } else {
                return new URL(path, window.location.href).href;
            }
        }
    }

    /**
     * Call a hook with the provided name and arguments.
     * This function is used to call hooks registered in the window object.
     * @param {string} hookName - The name of the hook to call.
     * @param {...*} args - The arguments to pass to the hook.
     */
    function callLoaderHook(hookName, ...args) {
        if (!window['__APP_COMPONENT_LOADER_NAME__']) {
            return;
        }

        // Call the hook
        window['__APP_COMPONENT_LOADER_NAME__']._callHooks(hookName, ...args);
    }

    /**
     * Get the root element for the app component.
     * To inject scripts and styles into the correct place in the DOM.
     */
    function getComponentRoot() {
        const component = window[appComponentName];
        if (component && component.element && component.element.root) {
            return component.element.root();
        }

        return document.head; // Fallback to document head if no root found
    }

    function getBaseUrl() {
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

    /** * Load a script dynamically and return a promise that resolves when the script is loaded.
     * @param {string|object} script - The source URL of the script to load or manifest entry object.
     * @returns {Promise<string>} - A promise that resolves with the script URL when loaded.
     */
    async function loadScript(script) {
        const baseUrl = getBaseUrl();

        const scriptUrl = typeof script === 'string' ? script : script.file || script.src;
        const src = resolveUrl(scriptUrl.startsWith('/') ? scriptUrl : `${baseUrl}/${scriptUrl}`);

        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => {
                // Call the entryLoading hook for scripts
                callLoaderHook('entryLoaded', 'script', script);

                // Resolve with the script URL
                resolve(src);
            };
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    /** * Load a stylesheet dynamically and return a promise that resolves when the stylesheet is loaded.
     * @param {string|object} stylesheet - The source URL of the script to load or manifest entry object.
     * @returns {Promise<string>} - A promise that resolves with the stylesheet URL when loaded.
     */
    async function loadStylesheet(stylesheet) {
        const baseUrl = getBaseUrl();

        // Get the root element for the app component
        const root = getComponentRoot();

        const href = resolveUrl(
            stylesheet.src.startsWith('/') ? stylesheet.file : `${baseUrl}/${stylesheet.file}`
        );

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                // Call the entryLoaded hook for stylesheets
                callLoaderHook('entryLoaded', 'style', stylesheet);

                // Resolve with the stylesheet URL
                resolve(href);
            };
            link.onerror = reject;
            root.appendChild(link);
        });
    }

    /**
     * Fetch the manifest from the specified URL and return its content.
     * @returns {Promise<any>} - A promise that resolves with the manifest content.
     */
    async function fetchManifest() {
        const baseUrl = getBaseUrl();
        const manifestFullUrl = resolveUrl(
            manifestUrl.startsWith('/') ? manifestUrl : `${baseUrl}/${manifestUrl}`
        );

        try {
            const response = await fetch(manifestFullUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
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

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Load scripts from the manifest entries.
     *
     * @param {*} manifest - The manifest entries to load.
     * @returns {Promise<void>}
     */
    async function loadScripts(manifest) {
        const entries = Object.values(manifest).filter((entry) => entry.isEntry);
        if (entries.length === 0) throw new Error('No entry points found in manifest');

        for (const entry of entries) {
            // Load JavaScript chunks
            const chunks = entry.imports || [];
            for (const chunk of chunks) {
                // const chunkUrl = resolveUrl(chunk.startsWith('/') ? chunk : `${baseUrl}/${chunk}`);
                await loadScript(chunk);
            }

            // Load main entry script
            await loadScript(entry);
        }
    }

    /**
     * Load stylesheets from the manifest entries.
     *
     * @param {*} manifest
     * @return {*}
     */
    async function loadStylesheetsFromManifest(manifest) {
        // Load additional stylesheets if specified
        const stylesheets = Object.values(manifest).reduce((acc, entry) => {
            // If entry is a css file, add it to the stylesheets array
            if (entry.file.endsWith('.css')) {
                acc.push(entry);
                return acc;
            }

            // Chunks and scripts may also have associated CSS files
            const cssFiles = entry.css || [];
            if (Array.isArray(cssFiles) && cssFiles.length > 0) {
                // If entry has CSS files, add them to the stylesheets array
                cssFiles.forEach((cssFile) => {
                    acc.push({
                        src: cssFile,
                        file: cssFile,
                    });
                });
            }

            return acc;
        }, []);

        // If no stylesheets are found, return early
        if (stylesheets.length === 0) {
            return;
        }

        // Load stylesheets
        for (const stylesheet of stylesheets) {
            await loadStylesheet(stylesheet);
        }
    }

    /**
     * Load the manifest and its entries, then load scripts and stylesheets.
     * This function is called when the window is ready.
     */
    async function loadFromManifest() {
        const manifest = await fetchManifest();

        try {
            // Load scripts from manifest
            await loadScripts(manifest);
        } catch (error) {
            // Fail silently if scripts cannot be loaded
        }

        try {
            // Load stylesheets from manifest
            await loadStylesheetsFromManifest(manifest);
        } catch (_error) {
            // fail silently if stylesheets cannot be loaded
        }
    }

    loadFromManifest()
        .then(() => {
            // Call the loaded method on the app component loader
            window['AppLearningCourseOverviewLoader'].loaded();

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
window['__APP_COMPONENT_LOADER_NAME__'] = {
    hooks: {},
    isLoaded: false,
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
     * Call the 'load' hook when the manifest loading is completed.
     */
    loaded: async function () {
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
};
