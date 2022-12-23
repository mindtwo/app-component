module.exports = {
    extends: ['semistandard'],
    env: {
        browser: true,
    },
    rules: {
        indent: ['error', 4],
        'comma-dangle': [
            'error',
            {
                arrays: 'only-multiline',
                objects: 'only-multiline',
                imports: 'never',
                exports: 'only-multiline',
                functions: 'never',
            },
        ],
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always',
            },
        ],
    },
};
