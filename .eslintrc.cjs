module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'off', // Desabilitar warnings de fast refresh
    'no-unused-vars': 'off',
    'no-console': 'off', // Desabilitar warnings de console
    'no-undef': 'off', // Desabilitar warnings de variáveis não definidas
    'no-mixed-spaces-and-tabs': 'error',
    'no-redeclare': 'error',
  },
  globals: {
    React: 'readonly',
    NodeJS: 'readonly',
    EventListener: 'readonly',
    ImportMeta: 'readonly',
    require: 'readonly',
    __dirname: 'readonly',
  },
}
