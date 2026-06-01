import type { ScriptLoader } from '@mindtwo/unplugin-app-component';

interface NuxtScriptsModule {
    useScript: (
        input: { src: string; key?: string },
        opts?: { trigger?: string }
    ) => { onLoaded: (cb: () => void) => void };
}

/**
 * Default export consumed by the manifest loader runtime. It dynamically
 * imports `useScript` from `nuxt-scripts` so projects without nuxt-scripts
 * installed don't pay the bundle cost. The host application must have
 * `nuxt-scripts` (or its underlying `@unhead/vue` context) available at
 * runtime — typically inside a Nuxt app.
 *
 * @example // build-time
 * AppComponentPlugin({
 *     manifestLoader: true,
 *     scriptLoader: '@mindtwo/app-component-nuxt-scripts',
 * })
 */
const loader: ScriptLoader = async ({ src, id }: { src: string; id?: string }) => {
    // @ts-expect-error nuxt-scripts is an optional peer-of-peer; consumers provide it.
    const mod = (await import('nuxt-scripts')) as NuxtScriptsModule;

    if (typeof mod.useScript !== 'function') {
        throw new Error(
            '[app-component-nuxt-scripts] `useScript` is not exported from "nuxt-scripts". ' +
                'Ensure nuxt-scripts is installed and the app runs inside a Nuxt or @unhead/vue context.'
        );
    }

    await new Promise<void>((resolve) => {
        const script = mod.useScript({ src, key: id }, { trigger: 'client' });
        script.onLoaded(() => resolve());
    });
};

export default loader;
