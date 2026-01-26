import nextConfig from 'eslint-config-next'

const config = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'dist/**'],
  },
  ...nextConfig,
]

export default config
