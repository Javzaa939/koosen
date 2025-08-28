// eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,

    {
        files: ['**/*.{js,jsx}'],

        languageOptions: {
            ecmaVersion: 2020, // or "latest"
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
            },
        },

        linterOptions: {
            reportUnusedDisableDirectives: true,
        },

        plugins: {
            react,
            'unused-imports': unusedImports,
        },

        rules: {
            // General JS warnings
            'no-undef': 'warn',
            'no-empty': 'warn',
            'no-dupe-keys': 'warn',
            'no-inner-declarations': 'warn',

            // React specific
            'react/display-name': 'warn',
            'react/prop-types': 'warn',
            'react/no-unknown-property': 'warn',

            'no-unsafe-optional-chaining': 'warn',
            'no-empty-pattern': 'warn',
            'no-unreachable': 'warn',

            // ESLint plugin: unused-imports
            'no-unused-vars': 'warn',
            'unused-imports/no-unused-vars': 'warn',
            'unused-imports/no-unused-imports': 'off',

            'react/jsx-no-undef': 'warn',
            'react/jsx-no-target-blank': 'warn',
            'react/jsx-key': 'warn',
            'no-prototype-builtins': 'warn',
            'no-redeclare': 'warn',

            'react/no-unescaped-entities': 'warn',
            'no-case-declarations': 'warn',
            'no-irregular-whitespace': 'warn',
            'no-constant-condition': 'warn',
            'no-dupe-else-if': 'warn',
        },

        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    // Prettier: turn off ESLint rules that conflict with Prettier
    {
        files: ['**/*.{js,jsx}'],
        rules: prettier.rules,
    },
];
