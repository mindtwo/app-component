import { inject } from 'vue';
import { GET_ROOT_KEY } from './injection-keys';

/**
 * Returns a getter for the app-component's effective root node. When the
 * component was created with `shadowRoot: true`, this resolves to the
 * `ShadowRoot`; otherwise it falls back to the document root.
 *
 * @example
 * const getRoot = useAppComponentRoot();
 * onMounted(() => getRoot()?.appendChild(myStyleEl));
 */
export function useAppComponentRoot(): () => ShadowRoot | HTMLElement | undefined {
    const getRoot = inject(GET_ROOT_KEY);
    if (!getRoot) {
        throw new Error(
            '[app-component] useAppComponentRoot() called outside of an app-component context.'
        );
    }
    return getRoot;
}
