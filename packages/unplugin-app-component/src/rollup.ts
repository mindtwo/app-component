/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { AppComponentPlugin } from './index'

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import AppComponentPlugin from 'app-component-plugin/rollup'
 *
 * export default {
 *   plugins: [AppComponentPlugin()],
 * }
 * ```
 */
const rollup = AppComponentPlugin.rollup as typeof AppComponentPlugin.rollup
export default rollup
export { rollup as 'module.exports' }
