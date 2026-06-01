import { ref, shallowReadonly } from 'vue';
import { parseUrl } from './parse-url';
import type {
    NavigationAction,
    NavigationAdapter,
    NavigationAdapterContext,
    ParsedUrl,
} from './types';

export interface EventAdapterOptions {
    /** Initial URL. Defaults to `window.location.href`. */
    initialUrl?: string;
}

/**
 * Adapter for host-driven URL ownership.
 *
 * - The Vue side reads `currentUrl` and may call `push(url)` / `replace(url)`.
 * - `push` / `replace` do NOT touch `window.history` — they only fire the
 *   `navigate` hook so the host can decide what to do.
 * - The host updates the component by calling `bridge.navigate(url)`, which
 *   reaches `setUrl(url)` here and updates the reactive ref without firing
 *   the hook (the host already knows about the change).
 */
export function createEventNavigationAdapter(
    options: EventAdapterOptions = {}
): NavigationAdapter {
    const initial =
        options.initialUrl ??
        (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');

    const currentUrl = ref<ParsedUrl>(parseUrl(initial));
    let ctx: NavigationAdapterContext | undefined;

    const emit = (url: string, action: NavigationAction): void => {
        ctx?.emit({ url: parseUrl(url).href, parsed: parseUrl(url), action });
    };

    return {
        currentUrl: shallowReadonly(currentUrl),

        push(url) {
            emit(url, 'push');
        },

        replace(url) {
            emit(url, 'replace');
        },

        setUrl(url, action = 'sync') {
            currentUrl.value = parseUrl(url);
            if (action !== 'sync') {
                emit(url, action);
            }
        },

        install(context) {
            ctx = context;
        },

        dispose() {
            ctx = undefined;
        },
    };
}
