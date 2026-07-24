(function manifestLoader(debug = false) {
    const logger = debug
        ? {
              prefix: '__APP_COMPONENT_LOADER_NAME__' ?? 'ManifestLoader',
              log: function (level, ...args) {
                  console[level](`[${this.prefix}]`, ...args);
              },
              warn: function (...args) {
                  this.log('warn', ...args);
              },
              error: function (...args) {
                  this.log('error', ...args);
              },
              info: function (...args) {
                  this.log('info', ...args);
              },
          }
        : {
              warn: () => {},
              error: (...args) => {
                  console.error(...args);
              },
              info: () => {},
          };

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
        const component = window['__APP_COMPONENT_NAME__'];

        if (component && component.element && component.element.root) {
            return component.element.root();
        }

        return document.head; // Fallback to document head if no root found
    }

    /**
     * Get the base URL for the app component.
     * This function checks if the base path is defined in the window object,
     * and resolves it to an absolute URL.
     * @returns {string} - The base URL for the app component.
     */
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

    /**
     * Create a random ID with an optional prefix and random part length.
     *
     * @param {*} prefix
     * @param {number} [randomPartLength=6]
     * @return {*}
     */
    function createRandomId(prefix, randomPartLength = 6) {
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 2 + randomPartLength);

        return [prefix || 'id', randomPart].join('-');
    }

    // Helper object to manage the manifest loading state and callbacks
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
         * Check if the asset is already loaded.
         *
         * @param {object} asset
         * @returns {boolean} - true if the asset is loaded, false otherwise.
         */
        isAssetLoaded: function (asset) {
            if (!asset.id) {
                return false;
            }

            // Check if we can find the element by ID
            const element = document.getElementById(asset.id);
            return element !== null;
        },
        /**
         * Load a script from the passed url
         *
         * @param {string} scriptUrl
         * @returns
         */
        loadScript: async function (script) {
            // Normalize string inputs (e.g. manifest-key strings from `entry.imports`)
            // into asset objects so we can safely attach an `id` for dedupe tracking.
            if (typeof script === 'string') {
                script = { src: script };
            }

            if (this.isAssetLoaded(script)) {
                logger.info(`Script already loaded: ${script.file || script.src}`);
                return;
            }

            const baseUrl = getBaseUrl();

            const scriptUrl = script.file || script.src;
            const src = resolveUrl(
                scriptUrl.startsWith('/') ? scriptUrl : `${baseUrl}/${scriptUrl}`
            );

            // Create a random ID for the script element
            const scriptId = createRandomId('script');
            script.id = scriptId;

            // If a custom script loader was provided at build time, delegate.
            const scriptLoaderModule = '__SCRIPT_LOADER__';
            if (scriptLoaderModule) {
                try {
                    const mod = await import(/* @vite-ignore */ scriptLoaderModule);
                    const loaderFn = mod.default || mod.loadScript;
                    if (typeof loaderFn === 'function') {
                        await loaderFn({ src, id: scriptId });
                        this._callHooks('entryLoaded', 'script', script);
                        logger.info(`Script loaded via custom loader: ${scriptUrl}`);
                        return scriptUrl;
                    }
                    logger.warn(
                        `Custom script loader "${scriptLoaderModule}" did not export a function; falling back to default loader.`
                    );
                } catch (err) {
                    logger.error(
                        `Custom script loader "${scriptLoaderModule}" failed; falling back to default loader.`,
                        err
                    );
                }
            }

            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.id = scriptId;
                s.src = src;
                s.type = 'module';
                s.async = true;
                s.onload = () => {
                    // Call the entryLoading hook for scripts
                    this._callHooks('entryLoaded', 'script', script);

                    // Resolve with the script URL
                    resolve(scriptUrl);

                    logger.info(`Script loaded: ${scriptUrl}`);
                };
                s.onerror = reject;
                document.head.appendChild(s);
            });
        },
        /**
         * Preload a dependency chunk without executing it.
         *
         * Dependency chunks must NOT be evaluated as their own `<script type="module">`
         * roots: rolldown emits a self-referential runtime-helper chunk, and promoting
         * every dependency to a graph root trips its circular import so a bundler helper
         * (e.g. `__exportAll`) is called before it is defined. Instead we only execute the
         * entry (see `load`/`reload`) and let native ESM resolve the dependency graph from
         * that single root. This `<link rel="modulepreload">` just fetches each chunk in
         * parallel so it is warm in the module cache by the time the entry imports it.
         *
         * @param {object|string} script
         */
        preloadScript: function (script) {
            if (typeof script === 'string') {
                script = { src: script };
            }

            if (this.isAssetLoaded(script)) {
                logger.info(`Script already preloaded: ${script.file || script.src}`);
                return;
            }

            const baseUrl = getBaseUrl();
            const scriptUrl = script.file || script.src;
            const href = resolveUrl(
                scriptUrl.startsWith('/') ? scriptUrl : `${baseUrl}/${scriptUrl}`
            );

            const linkId = createRandomId('modulepreload');
            script.id = linkId;

            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'modulepreload';
            link.href = href;
            // Module scripts are fetched in CORS mode; match it so the preload is reused
            // instead of triggering a second network request when the entry imports it.
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);

            logger.info(`Script preloaded: ${scriptUrl}`);
        },
        /**
         * Load a stylesheet for given linkHref
         *
         * @param {*} stylesheet
         * @returns
         */
        loadStylesheet: function (stylesheet) {
            if (typeof stylesheet === 'string') {
                stylesheet = { src: stylesheet };
            }

            if (this.isAssetLoaded(stylesheet)) {
                logger.info(`Stylesheet already loaded: ${stylesheet.file || stylesheet.src}`);
                return;
            }

            // Get the root element for the app component
            const root = getComponentRoot();

            if (!root) {
                logger.warn('No component root found, cannot load stylesheet');

                return;
            }

            const baseUrl = getBaseUrl();
            const styleUrl = stylesheet.file || stylesheet.src;
            const linkHref = resolveUrl(
                styleUrl.startsWith('/') ? styleUrl : `${baseUrl}/${styleUrl}`
            );

            // Generate a random ID for the link element
            const linkId = createRandomId('style');
            stylesheet.id = linkId;

            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = linkHref;
                link.onload = () => {
                    // Call the entryLoaded hook for stylesheets
                    this._callHooks('entryLoaded', 'style', stylesheet);

                    // Resolve with the stylesheet URL
                    resolve(linkHref);

                    logger.info(`Stylesheet loaded: ${linkHref}`);
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
                        this.stylesheets.push({
                            src: cssFile,
                            file: cssFile,
                        });
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
                logger.warn('Manifest is already loaded, no need to load again.');
                return;
            }

            const baseUrl = getBaseUrl();
            const manifestFullUrl = resolveUrl(
                manifestUrl.startsWith('/') ? manifestUrl : `${baseUrl}/${manifestUrl}`
            );

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

                logger.info(`Manifest loaded from ${manifestFullUrl}`);

                // parse content
                this.parseManifest(manifest);

                return manifest;
            } catch (error) {
                throw error;
            }
        },
        /**
         * Walk an entry's `imports` graph and return a de-duplicated, dependency-ordered
         * list of manifest chunk objects. Strings in `imports` are manifest keys, so
         * each one is resolved against `this.manifest` before recursing.
         */
        resolveChunks: function (entry, seen) {
            seen = seen || new Set();
            const chunks = [];
            const imports = (entry && entry.imports) || [];

            for (const key of imports) {
                if (typeof key !== 'string' || seen.has(key)) continue;
                seen.add(key);

                const chunk = this.manifest && this.manifest[key];
                if (!chunk) {
                    logger.warn(`Import "${key}" not found in manifest, skipping`);
                    continue;
                }

                // Depth-first: load dependencies before the chunk that needs them.
                chunks.push(...this.resolveChunks(chunk, seen));
                chunks.push(chunk);

                // Stylesheets that ride along with a chunk
                const cssFiles = chunk.css || [];
                if (Array.isArray(cssFiles)) {
                    cssFiles.forEach((cssFile) => {
                        this.stylesheets.push({ src: cssFile, file: cssFile });
                    });
                }
            }

            return chunks;
        },
        reload: async function () {
            if (!this.manifest) {
                throw new Error('Manifest is not loaded, cannot refresh');
            }

            // Load all scripts and stylesheets again
            for (const entry of this.scripts) {
                const chunks = this.resolveChunks(entry);
                for (const chunk of chunks) {
                    // Preload (fetch) deps only — never execute them as module roots.
                    this.preloadScript(chunk);
                }

                // Only the entry runs as `<script type="module">`; native ESM pulls in
                // the preloaded dependency chunks and resolves their import graph
                // (including rolldown's runtime-helper chunk) in the correct order.
                await this.loadScript(entry);
            }

            for (const stylesheet of this.stylesheets) {
                await this.loadStylesheet(stylesheet);
            }

            logger.info('All scripts and stylesheets reloaded successfully');
        },
        load: async function () {
            if (this.isLoaded) {
                logger.warn('Manifest is already loaded, no need to load again.');
                // Already loaded, no need to load again
                return;
            }

            if (!this.manifest || !this.scripts.length) {
                throw new Error('Manifest is not loaded, cannot proceed with loading');
            }

            // Load all scripts
            try {
                for (const entry of this.scripts) {
                    const chunks = this.resolveChunks(entry);
                    for (const chunk of chunks) {
                        // Preload (fetch) deps only — never execute them as module roots.
                        this.preloadScript(chunk);
                    }

                    // Only the entry runs as `<script type="module">`; native ESM pulls in
                    // the preloaded dependency chunks and resolves their import graph
                    // (including rolldown's runtime-helper chunk) in the correct order.
                    await this.loadScript(entry);
                }
            } catch (error) {}

            // Load stylesheets
            try {
                for (const stylesheet of this.stylesheets) {
                    await this.loadStylesheet(stylesheet);
                }
            } catch (error) {}

            logger.info('All scripts and stylesheets loaded successfully');

            this.loaded();
        },
    };

    const loadComponentFromManifest = async () => {
        const manifestUrl = __MANIFEST_URL__;
        const basePath = __BASE_PATH__;

        const appComponentName = '__APP_COMPONENT_NAME__';

        // Loader instance
        const appLoader = window['__APP_COMPONENT_LOADER_NAME__'];

        /**
         * Load the manifest and its entries, then load scripts and stylesheets.
         * This function is called when the window is ready.
         */
        async function loadFromManifest() {
            // Call the loadManifest method on the loader
            await appLoader.loadManifest(manifestUrl);

            await appLoader.load();
        }

        loadFromManifest()
            .then(() => {
                // Optionally, you can dispatch a custom event after loading
                const event = new CustomEvent('manifest-loaded', {
                    detail: { manifestUrl, basePath, appComponentName },
                });
                document.dispatchEvent(event);
            })
            .catch((err) => {
                // Silent error handling
                logger.error(`Error loading manifest from ${manifestUrl}:`, err);
            });
    };

    // Expose a helper object to manage the loading state and callbacks
    window['__APP_COMPONENT_LOADER_NAME__'] = loader;

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
})('__DEBUG_MANIFEST_LOADER__' === 'true');
