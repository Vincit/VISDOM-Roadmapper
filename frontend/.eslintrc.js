module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    NodeJS: true, // See: https://github.com/Chatie/eslint-config/issues/45
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier', 'jest'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.ts'] }],
    'jsx-a11y/label-has-associated-control': [
      'error',
      { required: { some: ['nesting', 'id'] } },
    ],
    'jsx-a11y/label-has-for': [
      'error',
      { required: { some: ['nesting', 'id'] } },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-param-reassign': [
      'error',
      // ignore 'state' as `redux-toolkit` handles state modifications with `immer`
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'react/no-array-index-key': 'warn',
    'react/jsx-one-expression-per-line': 'off', // conflicts with prettier
    'react/prop-types': 'off', // not needed with TypeScript
    'react/jsx-curly-newline': 'off', // conflicts with prettier
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-props-no-spreading': 'off',
    'consistent-return': 'off',

    'prettier/prettier': ['error', { endOfLine: 'auto' }], // to accomodate CRLF locally

    // see: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // see: https://github.com/typescript-eslint/typescript-eslint/issues/1856
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
