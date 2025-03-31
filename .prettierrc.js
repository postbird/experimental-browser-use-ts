// https://prettier.io/docs/en/configuration.html
export default {
  printWidth: 120,
  endOfLine: 'auto',
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-packagejson'],
};
