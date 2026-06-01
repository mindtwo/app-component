import { Hookable, HookCallback, createDebugger } from 'hookable';
import { type Logger, createLogger } from './logger';
import type { NavigationEvent } from '../navigation/types';

/**
 * Map of built-in hook names. Consumers can extend this interface via TypeScript
 * declaration merging to add their own hook names with full type-safety:
 *
 * @example
 * declare module '@mindtwo/app-component' {
 *     interface ComponentHookMap {
 *         'analytics:track': (event: string) => void;
 *     }
 * }
 */
export interface ComponentHookMap {
    init: unknown;
    ready: unknown;
    initialized: unknown;
    connected: unknown;
    disconnected: unknown;
    creating: unknown;
    created: unknown;
    mounting: unknown;
    mounted: unknown;
    unmounting: unknown;
    unmounted: unknown;
    loaded: unknown;
    navigate: NavigationEvent;
}

export type ComponentHookName = keyof ComponentHookMap;

/**
 * Names of built-in hooks. Augmented entries from `ComponentHookMap` are accepted
 * by `on/off/emit` thanks to the `(string & {})` fallback in their signatures,
 * but only entries listed here suppress the "invalid hook name" warning.
 *
 * If you augment `ComponentHookMap`, the warning is informational only — the
 * callback still runs.
 */
const KNOWN_HOOKS = new Set<string>([
    'init',
    'ready',
    'initialized',
    'connected',
    'disconnected',
    'creating',
    'created',
    'mounting',
    'mounted',
    'unmounting',
    'unmounted',
    'loaded',
    'navigate',
]);

function isValidComponentHook(hookName: string): boolean {
    return KNOWN_HOOKS.has(hookName);
}

// `string & {}` keeps autocomplete for the known keys while still accepting
// arbitrary strings — useful for hooks added via module augmentation.
type AnyHookName = ComponentHookName | (string & {});

/**
 * ComponentHooks is a class that extends Hookable to manage component-specific hooks.
 *
 * @export
 * @class ComponentHooks
 * @extends {Hookable}
 */
export class ComponentHooks extends Hookable {
    private _logger: Logger;

    private hookableName?: string;

    private _externalHooks: { [key: string]: HookCallback } = {};

    constructor(hookableName?: string, debug: boolean = false) {
        super();

        this._logger = createLogger();

        this.hookableName = hookableName;
        if (debug) {
            createDebugger(this, {
                tag: this.hookableName || 'ComponentHooks',
            });
        }
    }

    /**
     * Register a hook callback for a specific hook name.
     *
     * @param {AnyHookName} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to register.
     * @param {boolean} [once=false] - If true, the callback will be called only once.
     * @return {void}
     */
    public on(hookName: AnyHookName, callback: HookCallback, once?: boolean): void {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(`Invalid hook name: ${hookName}. The callback may not be called.`);
        }

        const formattedHookName = this.formatHookName(hookName);

        if (once) {
            this.hookOnce(formattedHookName, callback);
            return;
        }

        this.hook(formattedHookName, callback);

        if (!isValidComponentHook(hookName)) {
            this._externalHooks[hookName] = callback;
        }
    }

    /**
     * Remove a hook callback for a specific hook name.
     *
     * @param {AnyHookName} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to remove.
     * @return {void}
     */
    public off(hookName: AnyHookName, callback: HookCallback): void {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(`Invalid hook name: ${hookName}. The callback may not be removed.`);
        }

        hookName = this.formatHookName(hookName);

        this.removeHook(hookName, callback);
    }

    /**
     * Emit a hook with the specified name and arguments.
     *
     * @param {AnyHookName} hookName - The name of the hook to emit.
     * @param {...unknown[]} args - The arguments to pass to the hook callbacks.
     * @return {Promise<any>}
     */
    public async emit(hookName: AnyHookName, ...args: unknown[]): Promise<unknown> {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(`Invalid hook name: ${hookName}. The hook may not be called.`);
        }

        hookName = this.formatHookName(hookName);
        this._logger.debug(`Emitting hook: ${hookName}`, ...args);
        const result = await this.callHook(hookName, ...args);

        return result;
    }

    /**
     * Alias for emit method to trigger a hook.
     *
     * @param {AnyHookName} hookName - The name of the hook to trigger.
     * @param {...unknown[]} args - The arguments to pass to the hook callbacks.
     * @return {Promise<any>}
     */
    public async trigger(
        hookName: AnyHookName,
        ...args: unknown[]
    ): Promise<unknown> {
        return await this.emit(hookName, ...args);
    }

    public removeExternalHooks(): void {
        this.removeHooks(this._externalHooks);
        this._externalHooks = {};
    }

    private formatHookName(hookName: AnyHookName): string {
        if (!this.hookableName) {
            return hookName;
        }

        if (hookName.startsWith(`${this.hookableName}:`)) {
            return hookName;
        }

        return `${this.hookableName}:${hookName}`;
    }
}
