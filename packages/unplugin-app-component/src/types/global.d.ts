// src/types/global.d.ts

declare module 'app-component-plugin' {
    export interface Options {
        enforce?: 'pre' | 'post' | undefined;
        name?: string;
        component?: any;
        shadowRoot?: boolean;
        debug?: boolean;
        hooks?: Record<string, (...args: any[]) => void>;
    }

    export const defineAppComponent: (options: Options) => void;
}
