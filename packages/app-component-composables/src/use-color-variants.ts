import { onBeforeUnmount, onMounted } from 'vue';
import { useAppComponentRoot } from './use-app-component-root';

/**
 * Per-variant lightness target in OKLCH L space (0..1), or a sentinel:
 *   - `'base'`     — keep the input color exact at that step
 *   - `'contrast'` — emit black or white, whichever reads better on the base
 */
export type ColorAdjustment = number | 'base' | 'contrast';

export type ColorAdjustments = Record<string, ColorAdjustment>;

/**
 * Five-step lighter → darker ramp around a base color.
 */
export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
    lighter: 0.85,
    light: 0.75,
    '': 'base',
    dark: 0.45,
    darker: 0.3,
    contrast: 'contrast',
};

/**
 * Tailwind-style 50 → 950 scale. `500` keeps the input color exact; the
 * other steps inherit chroma and hue from the base and only retarget
 * lightness, so the ramp tracks the brand color.
 */
export const TAILWIND_COLOR_ADJUSTMENTS: ColorAdjustments = {
    '50': 0.98,
    '100': 0.95,
    '200': 0.9,
    '300': 0.83,
    '400': 0.74,
    '500': 'base',
    '600': 0.55,
    '700': 0.45,
    '800': 0.37,
    '900': 0.29,
    '950': 0.2,
};

export type ColorAdjustmentsPreset = 'default' | 'tailwind';

const PRESETS: Record<ColorAdjustmentsPreset, ColorAdjustments> = {
    default: DEFAULT_COLOR_ADJUSTMENTS,
    tailwind: TAILWIND_COLOR_ADJUSTMENTS,
};

export interface UseColorVariantsOptions {
    color: string;
    colorName: string;
    adjustments?: ColorAdjustmentsPreset | ColorAdjustments;
    /**
     * `'auto'` (default) wires register/unset to the component's mount /
     * unmount lifecycle. `'manual'` leaves it to the caller.
     */
    registration?: 'auto' | 'manual';
}

/**
 * Generate and register CSS color variables derived from a single base color.
 * Each entry in `adjustments` becomes `--{colorName}-{key}` on the surrounding
 * app-component's root (shadow root or document root).
 *
 * `adjustments` accepts a preset name (`'default'` | `'tailwind'`) or a
 * custom `ColorAdjustments` map.
 *
 * @example
 * // options-bag form
 * useColorVariants({ color: '#3366ff', colorName: 'primary', adjustments: 'tailwind' });
 *
 * // positional shorthand
 * useColorVariants('#3366ff', 'primary');
 *
 * // manual lifecycle
 * const { registerColorProperties, unsetColorProperties } =
 *     useColorVariants({ color: '#3366ff', registration: 'manual' });
 */
export function useColorVariants(options: UseColorVariantsOptions): {
    registerColorProperties: () => void;
    unsetColorProperties: () => void;
};
export function useColorVariants(color: string, colorName: string): {
    registerColorProperties: () => void;
    unsetColorProperties: () => void;
};
export function useColorVariants(
    optionsOrColor: UseColorVariantsOptions | string,
    colorNameArg?: string,
) {
    const options: UseColorVariantsOptions = typeof optionsOrColor === 'string'
        ? { color: optionsOrColor, colorName: colorNameArg as string }
        : optionsOrColor;

    const {
        color,
        colorName,
        adjustments: adjustmentsOption = 'default',
        registration = 'auto',
    } = options;

    const adjustments: ColorAdjustments =
        typeof adjustmentsOption === 'string' ? PRESETS[adjustmentsOption] : adjustmentsOption;

    const getRoot = useAppComponentRoot();
    let styleEl: HTMLStyleElement | null = null;

    const buildVariants = (): Map<string, string> => {
        const base = hexToOklch(color);
        const variants = new Map<string, string>();

        for (const [suffix, target] of Object.entries(adjustments)) {
            let hex: string;
            if (target === 'base') {
                hex = color;
            } else if (target === 'contrast') {
                hex = base.l >= 0.6 ? '#000000' : '#ffffff';
            } else {
                hex = oklchToHex({ ...base, l: clamp01(target) });
            }
            const cssName = suffix ? `--${colorName}-${suffix}` : `--${colorName}`;
            variants.set(cssName, hex);
        }

        return variants;
    };

    const registerColorProperties = (): void => {
        unsetColorProperties();

        const root = getRoot();
        if (!root) return;

        const selector = root instanceof ShadowRoot ? ':host' : ':root';
        const body = Array.from(buildVariants())
            .map(([name, value]) => `    ${name}: ${value};`)
            .join('\n');

        styleEl = document.createElement('style');
        styleEl.textContent = `${selector} {\n${body}\n}`;

        if (root.firstChild) {
            root.insertBefore(styleEl, root.firstChild);
        } else {
            root.appendChild(styleEl);
        }
    };

    const unsetColorProperties = (): void => {
        styleEl?.remove();
        styleEl = null;
    };

    if (registration === 'auto') {
        onMounted(registerColorProperties);
        onBeforeUnmount(unsetColorProperties);
    }

    return { registerColorProperties, unsetColorProperties };
}

// --- sRGB ↔ OKLCH (Björn Ottosson, https://bottosson.github.io/posts/oklab/)

interface Oklch {
    l: number;
    c: number;
    h: number;
}

function hexToOklch(hex: string): Oklch {
    const { r, g, b } = hexToRgb(hex);
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);

    const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    return { l: L, c: Math.sqrt(a * a + b2 * b2), h: Math.atan2(b2, a) };
}

function oklchToHex({ l, c, h }: Oklch): string {
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);

    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

    const lr = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

    return rgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace('#', '');
    const full =
        h.length === 3
            ? h
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : h;
    return {
        r: parseInt(full.slice(0, 2), 16) / 255,
        g: parseInt(full.slice(2, 4), 16) / 255,
        b: parseInt(full.slice(4, 6), 16) / 255,
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const toByte = (v: number) =>
        Math.round(clamp01(v) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
    const v = clamp01(c);
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}
