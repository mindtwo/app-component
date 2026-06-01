import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createHistoryNavigationAdapter,
    createEventNavigationAdapter,
} from '../src/navigation';
import type { NavigationEvent } from '../src/navigation/types';

const makeCtx = () => {
    const emit = vi.fn<(event: NavigationEvent) => void>();
    return { ctx: { emit }, emit };
};

describe('history navigation adapter', () => {
    beforeEach(() => {
        window.history.replaceState({}, '', '/');
    });

    it('push updates currentUrl and history', () => {
        const adapter = createHistoryNavigationAdapter();
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);

        adapter.push('/foo?bar=1');

        expect(window.location.pathname).toBe('/foo');
        expect(adapter.currentUrl.value.pathname).toBe('/foo');
        expect(adapter.currentUrl.value.searchParams.get('bar')).toBe('1');
        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0][0].action).toBe('push');
    });

    it('replace uses history.replaceState (no new entry)', () => {
        const adapter = createHistoryNavigationAdapter();
        const { ctx } = makeCtx();
        adapter.install(ctx);

        const before = window.history.length;
        adapter.replace('/replaced');
        const after = window.history.length;

        expect(after).toBe(before);
        expect(window.location.pathname).toBe('/replaced');
        expect(adapter.currentUrl.value.pathname).toBe('/replaced');
    });

    it('popstate fires the navigate hook with action "pop"', () => {
        const adapter = createHistoryNavigationAdapter();
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);

        window.history.pushState({}, '', '/x');
        window.dispatchEvent(new PopStateEvent('popstate'));

        const lastCall = emit.mock.calls.at(-1)?.[0];
        expect(lastCall?.action).toBe('pop');
        expect(adapter.currentUrl.value.pathname).toBe('/x');
    });

    it('dispose removes the popstate listener', () => {
        const adapter = createHistoryNavigationAdapter();
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);
        adapter.dispose();

        window.history.pushState({}, '', '/y');
        window.dispatchEvent(new PopStateEvent('popstate'));

        // After dispose, popstate must not trigger emit
        expect(emit).not.toHaveBeenCalled();
    });
});

describe('event navigation adapter', () => {
    it('push does not touch window.history but fires hook', () => {
        const adapter = createEventNavigationAdapter({ initialUrl: 'http://localhost/start' });
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);

        const pushSpy = vi.spyOn(window.history, 'pushState');
        adapter.push('/component-route');

        expect(pushSpy).not.toHaveBeenCalled();
        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0][0].action).toBe('push');

        pushSpy.mockRestore();
    });

    it('setUrl with sync action updates currentUrl WITHOUT firing the hook', () => {
        const adapter = createEventNavigationAdapter({ initialUrl: 'http://localhost/start' });
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);

        adapter.setUrl('http://localhost/host-pushed');

        expect(adapter.currentUrl.value.pathname).toBe('/host-pushed');
        expect(emit).not.toHaveBeenCalled();
    });

    it('setUrl with non-sync action updates currentUrl AND fires the hook', () => {
        const adapter = createEventNavigationAdapter({ initialUrl: 'http://localhost/start' });
        const { ctx, emit } = makeCtx();
        adapter.install(ctx);

        adapter.setUrl('http://localhost/host-pushed', 'push');

        expect(adapter.currentUrl.value.pathname).toBe('/host-pushed');
        expect(emit).toHaveBeenCalledTimes(1);
    });
});
