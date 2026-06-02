import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { GET_ROOT_KEY } from '../src/injection-keys';
import {
    DEFAULT_COLOR_ADJUSTMENTS,
    TAILWIND_COLOR_ADJUSTMENTS,
    useColorVariants,
    type UseColorVariantsOptions,
} from '../src/use-color-variants';

type Handle = ReturnType<typeof useColorVariants>;

/**
 * Mount a tiny component that calls `useColorVariants` inside a Vue setup
 * context, with `GET_ROOT_KEY` provided so the composable can find a root.
 */
function mountWithComposable(
    optionsOrColor: UseColorVariantsOptions | string,
    colorName?: string,
): { handle: Handle; host: HTMLElement; unmount: () => void } {
    const host = document.createElement('div');
    document.body.appendChild(host);

    let handle: Handle;
    const app = createApp(
        defineComponent({
            setup() {
                handle = typeof optionsOrColor === 'string'
                    ? useColorVariants(optionsOrColor, colorName!)
                    : useColorVariants(optionsOrColor);
                return () => h('span');
            },
        }),
    );
    app.provide(GET_ROOT_KEY, () => host);
    const mountTarget = document.createElement('div');
    document.body.appendChild(mountTarget);
    app.mount(mountTarget);

    return {
        handle: handle!,
        host,
        unmount: () => {
            app.unmount();
            mountTarget.remove();
            host.remove();
        },
    };
}

function extractVars(host: HTMLElement): Record<string, string> {
    const styleEl = host.querySelector('style');
    if (!styleEl) return {};
    const out: Record<string, string> = {};
    for (const match of styleEl.textContent!.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
        out[match[1]] = match[2].trim();
    }
    return out;
}

const mounted: Array<() => void> = [];
afterEach(() => {
    while (mounted.length) mounted.pop()!();
});

function mountTracked(...args: Parameters<typeof mountWithComposable>) {
    const result = mountWithComposable(...args);
    mounted.push(result.unmount);
    return result;
}

describe('useColorVariants — public API', () => {
    it('exports the documented presets with stable keys', () => {
        expect(Object.keys(DEFAULT_COLOR_ADJUSTMENTS)).toEqual([
            'lighter', 'light', '', 'dark', 'darker', 'contrast',
        ]);
        expect(Object.keys(TAILWIND_COLOR_ADJUSTMENTS)).toEqual([
            '50', '100', '200', '300', '400', '500',
            '600', '700', '800', '900', '950',
        ]);
    });

    it('accepts both options-bag and positional shorthand', () => {
        const a = mountTracked({ color: '#3366ff', colorName: 'primary' });
        const b = mountTracked('#3366ff', 'primary');
        expect(extractVars(a.host)).toEqual(extractVars(b.host));
    });

    it('returns register/unset handles for manual control', () => {
        const { handle } = mountTracked({
            color: '#3366ff', colorName: 'primary', registration: 'manual',
        });
        expect(typeof handle.registerColorProperties).toBe('function');
        expect(typeof handle.unsetColorProperties).toBe('function');
    });
});

describe('useColorVariants — registration lifecycle', () => {
    it('auto registration injects a <style> on mount', () => {
        const { host } = mountTracked({ color: '#3366ff', colorName: 'primary' });
        expect(host.querySelector('style')).not.toBeNull();
    });

    it('manual registration does not auto-inject', () => {
        const { host } = mountTracked({
            color: '#3366ff', colorName: 'primary', registration: 'manual',
        });
        expect(host.querySelector('style')).toBeNull();
    });

    it('auto registration removes the <style> on unmount', () => {
        const { host, unmount } = mountWithComposable({
            color: '#3366ff', colorName: 'primary',
        });
        expect(host.querySelector('style')).not.toBeNull();
        unmount();
        expect(host.querySelector('style')).toBeNull();
    });
});

describe('useColorVariants — variant emission', () => {
    it('namespaces every entry as --{colorName}-{suffix} with empty key collapsing', () => {
        const { host } = mountTracked({ color: '#3366ff', colorName: 'brand' });
        const vars = extractVars(host);
        expect(Object.keys(vars)).toEqual([
            '--brand-lighter', '--brand-light', '--brand',
            '--brand-dark', '--brand-darker', '--brand-contrast',
        ]);
    });

    it("'base' sentinel preserves the input color exactly", () => {
        const { host } = mountTracked({ color: '#3366ff', colorName: 'brand' });
        expect(extractVars(host)['--brand']).toBe('#3366ff');
    });

    it("'contrast' picks black for light bases, white for dark bases", () => {
        const dark = mountTracked({ color: '#111111', colorName: 'x' });
        const light = mountTracked({ color: '#eeeeee', colorName: 'x' });
        expect(extractVars(dark.host)['--x-contrast']).toBe('#ffffff');
        expect(extractVars(light.host)['--x-contrast']).toBe('#000000');
    });

    it('tailwind preset emits the full 50→950 scale (no contrast)', () => {
        const { host } = mountTracked({
            color: '#3366ff', colorName: 'primary', adjustments: 'tailwind',
        });
        const vars = extractVars(host);
        expect(Object.keys(vars)).toEqual([
            '--primary-50', '--primary-100', '--primary-200', '--primary-300',
            '--primary-400', '--primary-500', '--primary-600', '--primary-700',
            '--primary-800', '--primary-900', '--primary-950',
        ]);
        expect(vars['--primary-500']).toBe('#3366ff');
    });
});

describe('useColorVariants — OKLCH baseline (regression lock)', () => {
    /**
     * Snapshot of generated hex values for a fixed input. If the OKLCH math
     * or any preset target changes, this test fails — forcing an explicit
     * decision to update the baseline.
     */
    it('produces a stable tailwind ramp for #3366ff', () => {
        const { host } = mountTracked({
            color: '#3366ff', colorName: 'primary', adjustments: 'tailwind',
        });
        expect(extractVars(host)).toMatchSnapshot();
    });

    it('produces a stable default ramp for #3366ff', () => {
        const { host } = mountTracked({ color: '#3366ff', colorName: 'brand' });
        expect(extractVars(host)).toMatchSnapshot();
    });

    /**
     * Cover the OKLCH hue wheel with representative inputs so chroma/hue
     * preservation across the ramp stays locked, not just blue.
     */
    it.each([
        ['reddish',   '#e63946'],
        ['yellowish', '#f4c430'],
        ['greenish',  '#2a9d8f'],
        ['grayish',   '#8a8d91'],
    ])('produces a stable tailwind ramp for %s (%s)', (_, color) => {
        const { host } = mountTracked({ color, colorName: 'c', adjustments: 'tailwind' });
        expect(extractVars(host)).toMatchSnapshot();
    });
});
