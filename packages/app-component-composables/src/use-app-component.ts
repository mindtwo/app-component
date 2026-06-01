import { inject } from 'vue';
import { APP_COMPONENT_KEY, type AppComponentInjection } from './injection-keys';

/**
 * Access metadata about the surrounding app-component: its name, the bridge
 * instance (for imperative mount/unmount/event control), and the underlying
 * custom HTML element.
 */
export function useAppComponent(): AppComponentInjection {
    const ctx = inject(APP_COMPONENT_KEY);
    if (!ctx) {
        throw new Error(
            '[app-component] useAppComponent() called outside of an app-component context.'
        );
    }
    return ctx;
}
