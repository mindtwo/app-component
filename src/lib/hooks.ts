import { Hookable, HookCallback, createDebugger } from 'hookable';
import { type Logger, createLogger } from './logger';

// TODO make extensible
export type ComponentHookName =
    | 'init'
    | 'connected'
    | 'ready'
    | 'disconnected'
    | 'initialized'
    | 'creating'
    | 'created'
    | 'mounting'
    | 'mounted'
    | 'disconnected'
    | 'unmounting'
    | 'unmounted';
// TODO - later
// | 'navigate'
// | 'loaded'

function isValidComponentHook(hookName: string): hookName is ComponentHookName {
    return [
        'mounting',
        'creating',
        'created',
        'connected',
        'disconnected',
        'ready',
        'initialized',
        'init',
        'mounted',
        'unmounting',
        'unmounted',
        // 'loaded',
        // 'navigate',
    ].includes(hookName);
}

/**
 * ComponentHooks is a class that extends Hookable to manage component-specific hooks.
 *
 * @export
 * @class ComponentHooks
 * @extends {Hookable}
 */
export class ComponentHooks extends Hookable {
    private _logger: Logger;

    private componentName?: string;

    constructor(componentName?: string, debug: boolean = false) {
        super();

        this._logger = createLogger();

        this.componentName = componentName;
        if (debug) {
            createDebugger(this, {
                tag: this.componentName || 'ComponentHooks',
            });
        }
    }

    /**
     * Register a hook callback for a specific hook name.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to register.
     * @param {boolean} [once=false] - If true, the callback will be called only once.
     * @return {void}
     */
    public on(
        hookName: ComponentHookName | string,
        callback: HookCallback,
        once?: boolean
    ): void {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(
                `Invalid hook name: ${hookName}. The callback may not be called.`
            );
        }

        if (once) {
            this.hookOnce(hookName, callback);
            return;
        }

        this.hook(hookName, callback);
    }

    /**
     * Remove a hook callback for a specific hook name.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook.
     * @param {HookCallback} callback - The callback function to remove.
     * @return {void}
     */
    public off(
        hookName: ComponentHookName | string,
        callback: HookCallback
    ): void {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(
                `Invalid hook name: ${hookName}. The callback may not be removed.`
            );
        }

        this.removeHook(hookName, callback);
    }

    /**
     * Remove all hooks for a specific hook name.
     *
     * @return {void}
     */
    public clear(): void {
        this.removeAllHooks();
    }

    /**
     * Emit a hook with the specified name and arguments.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook to emit.
     * @param {...unknown[]} args - The arguments to pass to the hook callbacks.
     * @return {Promise<any>}
     */
    public async emit(
        hookName: ComponentHookName | string,
        ...args: unknown[]
    ): Promise<unknown> {
        if (!isValidComponentHook(hookName)) {
            this._logger.warn(
                `Invalid hook name: ${hookName}. The hook may not be called.`
            );
        }

        const result = await this.callHook(hookName, ...args);

        return result;
    }

    /**
     * Alias for emit method to trigger a hook.
     *
     * @param {ComponentHookName | string} hookName - The name of the hook to trigger.
     * @param {...unknown[]} args - The arguments to pass to the hook callbacks.
     * @return {Promise<any>}
     */
    public async trigger(
        hookName: ComponentHookName | string,
        ...args: unknown[]
    ): Promise<unknown> {
        return await this.emit(hookName, ...args);
    }
}
