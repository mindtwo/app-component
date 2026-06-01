import type { InjectionKey } from 'vue';
import type {
    AppComponentBridge,
    AppComponentHtmlElement,
    ComponentHooks,
    NavigationApi,
} from '@mindtwo/app-component';

export type AppComponentInjection = {
    name: string;
    bridge: AppComponentBridge;
    element: AppComponentHtmlElement | null;
};

export const HOOKS_KEY = 'hooks' as unknown as InjectionKey<ComponentHooks>;
export const GET_ROOT_KEY = '$getRoot' as unknown as InjectionKey<() => ShadowRoot | HTMLElement | undefined>;
export const APP_COMPONENT_KEY = '$appComponent' as unknown as InjectionKey<AppComponentInjection>;
export const NAVIGATION_KEY = '$navigation' as unknown as InjectionKey<NavigationApi | null>;
