import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
  js.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['src/scripts/**/*.js', 'src/pages/**/*.astro', 'src/layouts/**/*.astro', 'src/components/**/*.astro'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['tests/**/*.mjs', 'astro.config.mjs', 'src/lib/**/*.js', 'src/data/**/*.js'],
    languageOptions: { globals: globals.node }
  }
];
