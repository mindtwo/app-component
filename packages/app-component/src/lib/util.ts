/**
 * Returns the shadow root of an element, or falls back to document.documentElement.
 *
 * @param el - The element whose shadow root to get.
 * @returns The shadow root if available, otherwise document.documentElement.
 */
export function getEffectiveRoot(
    el: Element | null | undefined
): ShadowRoot | HTMLElement {
    if (!el) return document.documentElement;

    // If it's a shadow host and has an attached shadow root
    if (el.shadowRoot) return el.shadowRoot;

    // If it's inside a shadow DOM, find its root node
    const root = el.getRootNode?.();

    if (root instanceof ShadowRoot) return root;

    return document.documentElement;
}
