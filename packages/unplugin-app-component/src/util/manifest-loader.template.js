const load = async () => {
    const manifestUrl = __MANIFEST_URL__;
    const basePath = __BASE_PATH__;

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

    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => resolve(src);
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function loadStylesheet(href) {
        const root = AppLearningCourseOverview.element.root() || document.head;

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve(href);
            link.onerror = reject;
            root.appendChild(link);
        });
    }

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

            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.indexOf('application/json') === -1) {
                throw new Error(`Expected JSON manifest, but got: ${contentType}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async function loadFromManifest() {
        const manifest = await fetchManifest();
        const baseUrl = getBaseUrl();

        // Load all entry points from manifest
        const entries = Object.values(manifest).filter((entry) => entry.isEntry);
        if (entries.length === 0) throw new Error('No entry points found in manifest');

        for (const entry of entries) {
            // Load CSS files first
            const cssFiles = entry.css || [];
            for (const cssFile of cssFiles) {
                const cssUrl = resolveUrl(
                    cssFile.startsWith('/') ? cssFile : `${baseUrl}/${cssFile}`
                );
                await loadStylesheet(cssUrl);
            }

            // Load JavaScript chunks
            const chunks = entry.imports || [];
            for (const chunk of chunks) {
                const chunkUrl = resolveUrl(chunk.startsWith('/') ? chunk : `${baseUrl}/${chunk}`);
                await loadScript(chunkUrl);
            }

            // Load main entry script
            const entryUrl = resolveUrl(
                entry.file.startsWith('/') ? entry.file : `${baseUrl}/${entry.file}`
            );
            await loadScript(entryUrl);
        }

        // Load additional stylesheets if specified
        const stylesheets = Object.values(manifest).filter(
            (entry) => entry.src && entry.src.endsWith('.css')
        );
        for (const stylesheet of stylesheets) {
            const cssUrl = resolveUrl(
                stylesheet.src.startsWith('/') ? stylesheet.file : `${baseUrl}/${stylesheet.file}`
            );
            await loadStylesheet(cssUrl);
        }
    }

    loadFromManifest()
        .then(() => {
            // Optionally, you can dispatch a custom event after loading
            const event = new CustomEvent('manifest-loaded', {
                detail: { manifestUrl, basePath },
            });
            document.dispatchEvent(event);

            console.log(`Manifest loaded successfully from ${manifestUrl}`);
        })
        .catch(() => {
            // Silent error handling
        });
};

function winLoad(callback) {
    if (document.readyState === 'complete') {
        callback();
    } else {
        document.addEventListener('load', callback);
    }
}

winLoad(async function () {
    await load();
});
