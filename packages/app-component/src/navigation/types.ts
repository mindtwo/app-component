import type { Ref } from 'vue';

export type NavigationAction = 'push' | 'replace' | 'pop' | 'sync';

export interface ParsedUrl {
    href: string;
    pathname: string;
    search: string;
    hash: string;
    searchParams: URLSearchParams;
}

export interface NavigationEvent {
    url: string;
    parsed: ParsedUrl;
    action: NavigationAction;
}

/**
 * Subset of the adapter the Vue component sees via `useNavigation()`.
 */
export interface NavigationApi {
    /** Reactive current URL — components watch this. */
    currentUrl: Readonly<Ref<ParsedUrl>>;
    /** Navigate by pushing a new entry. */
    push: (url: string) => void;
    /** Replace the current entry. */
    replace: (url: string) => void;
}

export interface NavigationAdapterContext {
    /** Emit the bridge's `navigate` hook. */
    emit: (event: NavigationEvent) => void;
}

/**
 * Full adapter contract used by the bridge. Includes lifecycle and a
 * host-facing setter (`bridge.navigate(url)` delegates here).
 */
export interface NavigationAdapter extends NavigationApi {
    install: (ctx: NavigationAdapterContext) => void;
    dispose: () => void;
    setUrl: (url: string, action?: NavigationAction) => void;
}
