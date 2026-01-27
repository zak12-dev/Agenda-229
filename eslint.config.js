import nuxt from '@nuxt/eslint-config'

export default [
  ...nuxt,
  {
    ignores: ['node_modules', '.nuxt', '.output', 'dist']
  }
]
