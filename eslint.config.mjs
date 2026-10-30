import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import pluginCypress from 'eslint-plugin-cypress'

export default defineConfig([
  { ignores: ['cypress/screenshots/', 'cypress/videos/', 'cypress/downloads/'] },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['cypress/**/*.ts'],
    extends: [pluginCypress.configs.recommended],
  },
])
