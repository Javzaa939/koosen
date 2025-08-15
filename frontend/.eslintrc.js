// .eslintrc.js
module.exports = {
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020, // or 'latest'
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: { browser: true, es2021: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'prettier',
    ],
    plugins: ['unused-imports'],
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
        'no-unused-vars': 'warn', // instead of 'error'
        'unused-imports/no-unused-vars': 'warn',
        'unused-imports/no-unused-imports': 'warn',

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
};
