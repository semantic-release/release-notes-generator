# **sr-release-notes-generator**

Customizable release-notes-generator plugin for [semantic-release](https://github.com/semantic-release/semantic-release) based on [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

[![npm](https://img.shields.io/npm/v/sr-release-notes-generator.svg)](https://www.npmjs.com/package/sr-release-notes-generator)
[![npm](https://img.shields.io/npm/dt/sr-release-notes-generator.svg)](https://www.npmjs.com/package/sr-release-notes-generator)
[![Greenkeeper badge](https://badges.greenkeeper.io/vanduynslagerp/sr-release-notes-generator.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/vanduynslagerp/sr-release-notes-generator.svg)](https://github.com/vanduynslagerp/sr-release-notes-generator/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Travis](https://img.shields.io/travis/vanduynslagerp/sr-release-notes-generator.svg)](https://travis-ci.org/vanduynslagerp/sr-release-notes-generator)
[![Codecov](https://img.shields.io/codecov/c/github/vanduynslagerp/sr-release-notes-generator.svg)](https://codecov.io/gh/vanduynslagerp/sr-release-notes-generator)

## Install
```bash
npm install --save-dev semantic-release sr-release-notes-generator
```

Set the `generateNotes` plugin for `semantic-release` in `package.json`. See [semantic-release plugins](https://github.com/semantic-release/semantic-release#plugins).
```json
{
  "release": {
    "generateNotes": {
      "path": "sr-release-notes-generator",
      "preset": "angular"
    }
  }
}
```

## Options

| Option   | Description                                                                                                   | Default |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `preset` | [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset (Possible values: `angular`, `atom`, `codemirror`, `ember`, `eslint`, `express`, `jquery`, `jscs`, `jshint`) | `angular` |
| `config` | NPM package name of a custom [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset                                                                  | -        |

**NOTE:** `options.config` will be overwritten by the values of preset. You should use either `preset` or `config`, but not both.
