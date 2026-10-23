import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import AppComponentBridge from '../src/AppComponentBridge';
import { ComponentHooks } from '../src/lib/hooks';
import type AppComponentHtmlElement from '../src/AppComponentHtmlElement';

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

const CourseView = defineComponent({
    props: { course: { type: String, default: '' } },
    setup: (props) => () => h('span', props.course),
});

function makeBridge(hooks = new ComponentHooks()) {
    const wrapper = document.createElement('div');
    const bridge = new AppComponentBridge('Test', CourseView, hooks);
    bridge.setElement(fakeElement(wrapper));

    return { bridge, wrapper, hooks };
}

describe('create()', () => {
    it('runs once when called concurrently', async () => {
        const { bridge, hooks } = makeBridge();
        const created = vi.fn();
        hooks.on('created', created);

        await Promise.all([bridge.create(), bridge.create()]);

        expect(created).toHaveBeenCalledTimes(1);
        expect(bridge.created()).toBe(true);
    });

    it('resolves a concurrent call only after the created hook finished', async () => {
        const { bridge, hooks } = makeBridge();
        let createdFinished = false;
        hooks.on('created', async () => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            createdFinished = true;
        });

        const first = bridge.create();
        await bridge.create();

        expect(createdFinished).toBe(true);
        await first;
    });
});

describe('mount()', () => {
    it('ignores a second mount while mounted and keeps the first props', async () => {
        const { bridge, wrapper, hooks } = makeBridge();
        const mounting = vi.fn();
        hooks.on('mounting', mounting);

        await bridge.create();
        await bridge.mount({ course: 'course-a' });
        await bridge.mount({ course: 'course-b' });

        expect(wrapper.textContent).toBe('course-a');
        expect(mounting).toHaveBeenCalledTimes(1);
    });

    it('ignores a mount that starts while another is still in flight', async () => {
        const { bridge, wrapper } = makeBridge();

        await bridge.create();
        await Promise.all([bridge.mount({ course: 'course-a' }), bridge.mount({ course: 'course-b' })]);

        expect(wrapper.textContent).toBe('course-a');
    });

    it('mounts again with new props after unmount', async () => {
        const { bridge, wrapper } = makeBridge();

        await bridge.create();
        await bridge.mount({ course: 'course-a' });
        await bridge.unmount();

        await bridge.create();
        await bridge.mount({ course: 'course-b' });

        expect(wrapper.textContent).toBe('course-b');
    });
});

describe('unmount()', () => {
    it('waits for an in-flight create so no app is left behind', async () => {
        const { bridge, hooks } = makeBridge();
        hooks.on('creating', () => new Promise((resolve) => setTimeout(resolve, 5)));

        const creating = bridge.create();
        await bridge.unmount();
        await creating;

        expect(bridge.created()).toBe(false);
    });

    it('removes every external callback, not only the last one per name', async () => {
        const { bridge, hooks } = makeBridge();
        const first = vi.fn();
        const second = vi.fn();
        const once = vi.fn();

        bridge.on('player:closing', first);
        bridge.on('player:closing', second);
        bridge.on('player:closing', once, true);

        await bridge.create();
        await bridge.mount();
        await bridge.unmount();
        await hooks.emit('player:closing');

        expect(first).not.toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
        expect(once).not.toHaveBeenCalled();
    });

    it('removes external callbacks when the hooks are namespaced', async () => {
        const { bridge, hooks } = makeBridge(new ComponentHooks('player'));
        const callback = vi.fn();

        bridge.on('closing', callback);

        await bridge.create();
        await bridge.unmount();
        await hooks.emit('closing');

        expect(callback).not.toHaveBeenCalled();
    });

    it('keeps lifecycle callbacks registered', async () => {
        const { bridge } = makeBridge();
        const mounted = vi.fn();

        bridge.on('mounted', mounted);

        await bridge.create();
        await bridge.mount();
        await bridge.unmount();
        await bridge.create();
        await bridge.mount();

        expect(mounted).toHaveBeenCalledTimes(2);
    });
});

describe('on()', () => {
    it('returns a function that removes the callback', async () => {
        const { bridge, hooks } = makeBridge();
        const callback = vi.fn();

        const off = bridge.on('progress:passed', callback);
        off();
        await hooks.emit('progress:passed');

        expect(callback).not.toHaveBeenCalled();
    });
});
