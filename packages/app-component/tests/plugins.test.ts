import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h, inject, type App, type Plugin } from 'vue';
import AppComponentBridge from '../src/AppComponentBridge';
import { ComponentHooks } from '../src/lib/hooks';
import type AppComponentHtmlElement from '../src/AppComponentHtmlElement';

/**
 * Build a minimal fake element exposing just the surface the bridge touches
 * during create()/mount(), so we can drive the lifecycle without registering a
 * real custom element.
 */
function fakeElement(wrapper: HTMLElement) {
    return {
        isInitialized: true,
        autoMount: false,
        props: {},
        createComponentDOM: () => wrapper,
        root: () => document.documentElement,
        getWrapper: () => wrapper,
        clearProps: () => {},
        unmount: () => {},
    } as unknown as AppComponentHtmlElement;
}

describe('plugins option', () => {
    it('installs each plugin on the app instance before mount', async () => {
        const install = vi.fn<(app: App) => void>();
        const plugin: Plugin = { install };

        const bridge = new AppComponentBridge(
            'Test',
            defineComponent({ render: () => h('div') }),
            new ComponentHooks(),
            undefined,
            [plugin]
        );
        bridge.setElement(fakeElement(document.createElement('div')));

        await bridge.create();

        expect(install).toHaveBeenCalledTimes(1);
        // app.use passes the app as the first argument to install().
        expect(install.mock.calls[0][0]).toBeTruthy();
    });

    it('makes plugin-provided values injectable in the mounted component', async () => {
        const plugin: Plugin = {
            install: (app) => app.provide('token', 'from-plugin'),
        };

        const Child = defineComponent({
            setup: () => {
                const token = inject<string>('token');
                return () => h('span', token);
            },
        });

        const wrapper = document.createElement('div');
        const bridge = new AppComponentBridge(
            'Test',
            Child,
            new ComponentHooks(),
            undefined,
            [plugin]
        );
        bridge.setElement(fakeElement(wrapper));

        await bridge.create();
        await bridge.mount();

        expect(wrapper.textContent).toContain('from-plugin');
    });

    it('supports [plugin, ...options] tuples', async () => {
        const install = vi.fn<(app: App, ...options: unknown[]) => void>();
        const plugin: Plugin = { install };

        const bridge = new AppComponentBridge(
            'Test',
            defineComponent({ render: () => h('div') }),
            new ComponentHooks(),
            undefined,
            [[plugin, { flag: true }, 42]]
        );
        bridge.setElement(fakeElement(document.createElement('div')));

        await bridge.create();

        expect(install).toHaveBeenCalledTimes(1);
        expect(install.mock.calls[0].slice(1)).toEqual([{ flag: true }, 42]);
    });

    it('creates the app without plugins when none are provided', async () => {
        const bridge = new AppComponentBridge(
            'Test',
            defineComponent({ render: () => h('div') }),
            new ComponentHooks()
        );
        bridge.setElement(fakeElement(document.createElement('div')));

        await bridge.create();

        expect(bridge.created()).toBe(true);
    });
});
