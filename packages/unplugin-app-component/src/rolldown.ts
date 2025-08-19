/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { AppComponentPlugin } from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import Starter from 'app-component-plugin/rolldown'
 *
 * export default {
 *   plugins: [AppComponentPlugin()],
 * }
 * ```
 */
const rolldown = AppComponentPlugin.rolldown as typeof AppComponentPlugin.rolldown
export default rolldown
export { rolldown as 'module.exports' }
