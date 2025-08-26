/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { AppComponentPlugin } from './index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import AppComponentPlugin from 'app-component-plugin/vite'
 *
 * export default defineConfig({
 *   plugins: [AppComponentPlugin()],
 * })
 * ```
 */
const vite = AppComponentPlugin.vite as typeof AppComponentPlugin.vite
export default vite
export { vite as 'module.exports' }
