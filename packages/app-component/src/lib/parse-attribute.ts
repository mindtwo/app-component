import { createLogger } from './logger';

export type AttributeType = 'string' | 'number' | 'boolean' | 'json';

const VALID_TYPES: AttributeType[] = ['string', 'number', 'boolean', 'json'];

export function isAttributeType(value: string): value is AttributeType {
    return (VALID_TYPES as string[]).includes(value);
}

/**
 * Parse a raw HTML attribute string into the requested type.
 *
 * - `string` returns the raw value.
 * - `boolean` treats `""`, `"true"`, and the attribute name itself as `true`;
 *   `"false"` as `false`.
 * - `number` returns `Number(value)`, falling back to the raw string when `NaN`.
 * - `json` runs `JSON.parse`, falling back to the raw string on parse errors.
 */
export function parseAttribute(value: string, type: AttributeType): unknown {
    const logger = createLogger();

    switch (type) {
        case 'string':
            return value;

        case 'boolean':
            if (value === '' || value === 'true') return true;
            if (value === 'false') return false;
            return Boolean(value);

        case 'number': {
            const n = Number(value);
            if (Number.isNaN(n)) {
                logger.warn(`Attribute value "${value}" is not a valid number, keeping as string.`);
                return value;
            }
            return n;
        }

        case 'json':
            try {
                return JSON.parse(value);
            } catch (err) {
                logger.warn(`Failed to JSON.parse attribute value, keeping as string.`, err);
                return value;
            }
    }
}
