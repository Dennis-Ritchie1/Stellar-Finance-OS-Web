import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist', '**/coverage', '**/node_modules', 'packages/api-client/src/schema.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Money rule: amounts are strings, never parse them as floats.
      'no-restricted-globals': ['error', { name: 'parseFloat', message: 'Use money utils from @finance-os/utils.' }],
      'no-restricted-properties': ['error', { object: 'Number', property: 'parseFloat', message: 'Use money utils from @finance-os/utils.' }],
    },
  },
  {
    files: ['**/*.{js,mjs}', '**/*.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
