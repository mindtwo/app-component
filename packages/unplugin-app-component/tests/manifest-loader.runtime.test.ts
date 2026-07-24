import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const TEMPLATE_PATH = resolve(
    __dirname,
    '../src/util/manifest-loader.template.js'
);

interface Loader {
    manifest: Record<string, any> | undefined;
    scripts: any[];
    stylesheets: any[];
    resolveChunks: (entry: any, seen?: Set<string>) => any[];
    preloadScript: (script: any) => void;
    loadScript: (script: any) => Promise<any>;
    load: () => Promise<void>;
    isLoaded: boolean;
}

interface FakeElement {
    tagName: string;
    id?: string;
    rel?: string;
    href?: string;
    src?: string;
    type?: string;
    crossOrigin?: string;
    onload?: () => void;
    onerror?: (err?: unknown) => void;
}

interface Harness {
    loader: Loader;
    /** Every element appended to the DOM, in order. */
    appended: FakeElement[];
}

function loadTemplate(): Harness {
    // Mirror the placeholder substitution performed by getManifestLoaderContent so
    // bare-identifier placeholders (e.g. __BASE_PATH__) are valid JS in the vm.
    // basePath has no trailing slash so `${baseUrl}/${chunk}` yields a single slash.
    const source = readFileSync(TEMPLATE_PATH, 'utf8')
        .replace('__DEBUG_MANIFEST_LOADER__', 'false')
        .replaceAll('__MANIFEST_URL__', JSON.stringify('manifest.json'))
        .replaceAll('__BASE_PATH__', JSON.stringify('http://localhost'))
        .replaceAll('__APP_COMPONENT_NAME__', 'AppComponent')
        .replaceAll('__APP_COMPONENT_LOADER_NAME__', 'AppComponentLoader')
        .replaceAll('__SCRIPT_LOADER__', '');

    const byId = new Map<string, FakeElement>();
    const appended: FakeElement[] = [];

    const fakeDocument = {
        readyState: 'loading',
        head: {
            appendChild: (el: FakeElement) => {
                appended.push(el);
                if (el.id) byId.set(el.id, el);
                // Scripts resolve asynchronously via onload; fire it on the next tick
                // so `await loadScript(entry)` settles.
                if (el.tagName === 'SCRIPT' && el.onload) {
                    queueMicrotask(() => el.onload && el.onload());
                }
            },
        },
        getElementById: (id: string) => byId.get(id) ?? null,
        createElement: (tagName: string) => ({ tagName: tagName.toUpperCase() }),
        addEventListener: () => {},
        dispatchEvent: () => {},
    };
    const fakeWindow: Record<string, any> = {
        location: { origin: 'http://localhost', href: 'http://localhost/' },
    };

    const context = vm.createContext({
        window: fakeWindow,
        document: fakeDocument,
        console,
        fetch: () => Promise.reject(new Error('fetch not used in this test')),
        URL,
        CustomEvent: class {},
        queueMicrotask,
    });

    vm.runInContext(source, context);

    return {
        loader: fakeWindow['AppComponentLoader'] as Loader,
        appended,
    };
}

describe('manifest-loader runtime: resolveChunks', () => {
    let loader: Loader;

    beforeEach(() => {
        loader = loadTemplate().loader;
        loader.stylesheets = [];
    });

    it('resolves a flat Vite manifest into dependency-ordered chunks', () => {
        loader.manifest = {
            '_module-player-loader.js': {
                file: 'module-player-loader.js',
                src: '_module-player-loader.js',
            },
            '_ui-D7ywF_TU.js': {
                file: 'assets/ui-D7ywF_TU.js',
                name: 'ui',
                imports: ['_vue-CpOgIh3X.js'],
            },
            '_vue-CpOgIh3X.js': {
                file: 'assets/vue-CpOgIh3X.js',
                name: 'vue',
            },
            '_widgets-Fl_oeGcB.js': {
                file: 'assets/widgets-Fl_oeGcB.js',
                name: 'widgets',
                imports: ['_vue-CpOgIh3X.js'],
            },
            'src/main.js': {
                file: 'app-learning-module-player-DcyyDSvl.js',
                name: 'app-learning-module-player',
                src: 'src/main.js',
                isEntry: true,
                imports: [
                    '_vue-CpOgIh3X.js',
                    '_widgets-Fl_oeGcB.js',
                    '_ui-D7ywF_TU.js',
                ],
                css: ['assets/app-learning-module-player-DJLXdR8L.css'],
            },
        };

        const entry = loader.manifest['src/main.js'];
        const chunks = loader.resolveChunks(entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/vue-CpOgIh3X.js',
            'assets/widgets-Fl_oeGcB.js',
            'assets/ui-D7ywF_TU.js',
        ]);
    });

    it('dedupes shared dependencies via the seen set', () => {
        loader.manifest = {
            _shared: { file: 'assets/shared.js' },
            _a: { file: 'assets/a.js', imports: ['_shared'] },
            _b: { file: 'assets/b.js', imports: ['_shared'] },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_a', '_b'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/shared.js',
            'assets/a.js',
            'assets/b.js',
        ]);
    });

    it('follows transitive imports depth-first', () => {
        loader.manifest = {
            _deep: { file: 'assets/deep.js' },
            _mid: { file: 'assets/mid.js', imports: ['_deep'] },
            _top: { file: 'assets/top.js', imports: ['_mid'] },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_top'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual([
            'assets/deep.js',
            'assets/mid.js',
            'assets/top.js',
        ]);
    });

    it('collects css from transitive chunks into stylesheets', () => {
        loader.manifest = {
            _withCss: {
                file: 'assets/with-css.js',
                css: ['assets/with-css.css'],
            },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_withCss'],
            },
        };

        loader.resolveChunks(loader.manifest.entry);

        expect(loader.stylesheets).toEqual([
            { src: 'assets/with-css.css', file: 'assets/with-css.css' },
        ]);
    });

    it('skips unknown manifest keys without throwing', () => {
        loader.manifest = {
            _known: { file: 'assets/known.js' },
            entry: {
                file: 'assets/entry.js',
                isEntry: true,
                imports: ['_known', '_missing'],
            },
        };

        const chunks = loader.resolveChunks(loader.manifest.entry);

        expect(chunks.map((c) => c.file)).toEqual(['assets/known.js']);
    });

    it('returns an empty array when entry has no imports', () => {
        loader.manifest = {
            entry: { file: 'assets/entry.js', isEntry: true },
        };

        expect(loader.resolveChunks(loader.manifest.entry)).toEqual([]);
    });
});

describe('manifest-loader runtime: load ordering', () => {
    let harness: Harness;
    let loader: Loader;

    beforeEach(() => {
        harness = loadTemplate();
        loader = harness.loader;
        loader.stylesheets = [];
    });

    // Regression guard for the `__exportAll is not a function` crash: dependency
    // chunks (including rolldown's self-referential runtime-helper chunk) must be
    // preloaded — never executed as their own `<script type="module">` root. Only
    // the entry may run as a module script so native ESM resolves the graph from a
    // single root.
    it('preloads dependency chunks and only script-loads the entry', async () => {
        loader.manifest = {
            '_rolldown-runtime-abc.js': {
                file: 'assets/rolldown-runtime-abc.js',
                name: 'rolldown-runtime',
                // The runtime chunk back-imports its consumer — the very cycle
                // that crashed when each chunk was executed as a module root.
                imports: ['_ui-def.js'],
            },
            '_ui-def.js': {
                file: 'assets/ui-def.js',
                name: 'ui',
                imports: ['_rolldown-runtime-abc.js'],
            },
            'src/main.js': {
                file: 'assets/entry-xyz.js',
                name: 'entry',
                src: 'src/main.js',
                isEntry: true,
                imports: ['_ui-def.js'],
            },
        };
        loader.scripts = [loader.manifest['src/main.js']];

        await loader.load();

        const links = harness.appended.filter((el) => el.tagName === 'LINK');
        const scripts = harness.appended.filter((el) => el.tagName === 'SCRIPT');

        // Every dependency chunk is a modulepreload link, fetched not executed.
        expect(links.map((l) => l.rel)).toEqual(['modulepreload', 'modulepreload']);
        expect(links.map((l) => l.href)).toEqual([
            'http://localhost/assets/rolldown-runtime-abc.js',
            'http://localhost/assets/ui-def.js',
        ]);
        // Module scripts are fetched in CORS mode; the preload must match to be reused.
        expect(links.every((l) => l.crossOrigin === 'anonymous')).toBe(true);

        // Exactly one executing module script: the entry.
        expect(scripts).toHaveLength(1);
        expect(scripts[0].type).toBe('module');
        expect(scripts[0].src).toBe('http://localhost/assets/entry-xyz.js');
    });

    it('does not fetch a chunk twice when it is both preloaded and re-encountered', async () => {
        loader.manifest = {
            '_shared.js': { file: 'assets/shared.js', name: 'shared' },
            'src/main.js': {
                file: 'assets/entry.js',
                src: 'src/main.js',
                isEntry: true,
                imports: ['_shared.js'],
            },
        };
        loader.scripts = [loader.manifest['src/main.js']];

        await loader.load();
        // isAssetLoaded dedupe: preloading the same chunk again is a no-op.
        loader.preloadScript(loader.manifest['_shared.js']);

        const sharedLinks = harness.appended.filter(
            (el) => el.tagName === 'LINK' && el.href === 'http://localhost/assets/shared.js'
        );
        expect(sharedLinks).toHaveLength(1);
    });
});
