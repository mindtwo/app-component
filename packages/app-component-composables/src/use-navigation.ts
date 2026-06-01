import { inject } from 'vue';
import type { NavigationApi } from '@mindtwo/app-component';
import { NAVIGATION_KEY } from './injection-keys';

/**
 * Access the navigation adapter registered on the surrounding app-component.
 * Throws if no adapter was passed to `AppComponent.create({ navigation })`.
 *
 * @example
 * const nav = useNavigation();
 * watch(nav.currentUrl, (url) => console.log('went to', url.pathname));
 * nav.push('/new-route');
 */
export function useNavigation(): NavigationApi {
    const nav = inject(NAVIGATION_KEY, null);
    if (!nav) {
        throw new Error(
            '[app-component] useNavigation() called but no navigation adapter was passed to AppComponent.create({ navigation }).'
        );
    }
    return nav;
}
