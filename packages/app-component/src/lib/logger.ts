/* eslint-disable @typescript-eslint/no-explicit-any */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
    private static instance: Logger | null = null;

    private _debug: boolean = false;

    private prefix: string | undefined;

    private constructor(printDebug: boolean, prefix?: string) {
        this._debug = printDebug;
        this.prefix = prefix;

        // Private constructor to prevent instantiation
        if (printDebug) {
            this.log('debug', 'Logger initialized with debug mode enabled');
        }
    }

    public static getInstance(printDebug: boolean, prefix?: string): Logger {
        if (this.instance === null) {
            this.instance = new Logger(printDebug, prefix);
        }
        return this.instance;
    }

    /**
     * Proxies to the appropriate console method
     */
    public log(level: LogLevel, ...data: unknown[]): void {
        const prefix = `[${this.prefix}]`;

        // Always show error logs; skip others if debug is false
        if (!this._debug && level !== 'error') {
            return;
        }

        // Add position to the data
        console.trace(`%c${prefix}`, 'color: blue; font-weight: bold;', ...data);
    }

    /**
     * Log a message with the 'warn' level.
     */
    public warn(...data: any[]): void {
        this.log('warn', ...data);
    }

    /**
     * Log a message with the 'debug' level.
     */
    public debug(...data: any[]): void {
        this.log('debug', ...data);
    }

    /**
     * Log a message with the 'error' level.
     */
    public error(...data: any[]): void {
        this.log('error', ...data);
    }
}

export type { Logger };

/**
 * Create a logger instance with optional debug printing and prefix.
 *
 * @export
 * @param {boolean} [printDebug]
 * @param {string} [prefix]
 * @return {*}  {Logger}
 */
export function createLogger(printDebug?: boolean, prefix?: string): Logger {
    return Logger.getInstance(printDebug || false, prefix);
}
