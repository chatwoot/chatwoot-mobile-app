module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          '^@/', // Ignora paths que começam com @/
          '\\.(ttf|png|jpg|jpeg|gif|svg|webp)$', // Ignora arquivos de assets
          '^i18n$', // Ignora o módulo i18n
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  ],
};
