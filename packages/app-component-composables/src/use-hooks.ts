import { inject } from 'vue';
import type { ComponentHooks } from '@mindtwo/app-component';
import { HOOKS_KEY } from './injection-keys';

/**
 * Access the `ComponentHooks` instance for the surrounding app-component.
 * Must be called from a Vue component mounted via `AppComponent.create()`.
 */
export function useHooks(): ComponentHooks {
    const hooks = inject(HOOKS_KEY);
    if (!hooks) {
        throw new Error(
            '[app-component] useHooks() called outside of an app-component context. ' +
                'Ensure the Vue component is mounted via AppComponent.create().'
        );
    }
    return hooks;
}
