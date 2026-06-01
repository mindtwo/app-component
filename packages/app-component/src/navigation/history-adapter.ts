import { ref, shallowReadonly } from 'vue';
import { parseUrl } from './parse-url';
import type {
    NavigationAction,
    NavigationAdapter,
    NavigationAdapterContext,
    ParsedUrl,
} from './types';

export interface HistoryAdapterOptions {
    /** Initial URL. Defaults to `window.location.href`. */
    initialUrl?: string;
}

/**
 * Adapter that owns the URL via the browser's History API.
 *
 * - `push(url)` calls `history.pushState(...)`.
 * - `replace(url)` calls `history.replaceState(...)`.
 * - A `popstate` listener keeps `currentUrl` in sync with browser back/forward.
 */
export function createHistoryNavigationAdapter(
    options: HistoryAdapterOptions = {}
): NavigationAdapter {
    const initial =
        options.initialUrl ??
        (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');

    const currentUrl = ref<ParsedUrl>(parseUrl(initial));
    let ctx: NavigationAdapterContext | undefined;
    let popstateHandler: (() => void) | undefined;

    const apply = (url: string, action: NavigationAction): void => {
        const parsed = parseUrl(url);
        currentUrl.value = parsed;
        ctx?.emit({ url: parsed.href, parsed, action });
    };

    return {
        currentUrl: shallowReadonly(currentUrl),

        push(url) {
            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', url);
            }
            apply(url, 'push');
        },

        replace(url) {
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', url);
            }
            apply(url, 'replace');
        },

        setUrl(url, action = 'push') {
            if (typeof window !== 'undefined') {
                if (action === 'replace') {
                    window.history.replaceState({}, '', url);
                } else if (action === 'push') {
                    window.history.pushState({}, '', url);
                }
            }
            apply(url, action);
        },

        install(context) {
            ctx = context;
            if (typeof window === 'undefined') return;

            popstateHandler = () => apply(window.location.href, 'pop');
            window.addEventListener('popstate', popstateHandler);
        },

        dispose() {
            if (popstateHandler && typeof window !== 'undefined') {
                window.removeEventListener('popstate', popstateHandler);
            }
            popstateHandler = undefined;
            ctx = undefined;
        },
    };
}
