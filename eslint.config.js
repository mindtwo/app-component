import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                process: 'readonly',
            },
        },
        rules: {
            indent: ['error', 4],
            semi: ['error', 'always'],
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
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                process: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            indent: ['error', 4],
            semi: ['error', 'always'],
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
    },
];
