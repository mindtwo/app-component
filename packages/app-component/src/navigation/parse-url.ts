import type { ParsedUrl } from './types';

/**
 * Resolve a relative or absolute URL against the current document and return
 * a structured view of it. SSR-safe: if `window` is undefined and the input
 * is relative, falls back to treating the input as if it were absolute under
 * `http://localhost/` so consumers always get a well-formed `ParsedUrl`.
 */
export function parseUrl(href: string): ParsedUrl {
    const base =
        typeof window !== 'undefined' && window.location
            ? window.location.href
            : 'http://localhost/';

    const url = new URL(href, base);

    return {
        href: url.href,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        searchParams: url.searchParams,
    };
}
