# **release-notes-generator**

Customizable release-notes-generator plugin for [semantic-release](https://github.com/semantic-release/semantic-release) based on [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

[![npm](https://img.shields.io/npm/v/@semantic-release/release-notes-generator.svg)](https://www.npmjs.com/package/@semantic-release/release-notes-generator)
[![npm](https://img.shields.io/npm/dt/@semantic-release/release-notes-generator.svg)](https://www.npmjs.com/package/@semantic-release/release-notes-generator)
[![Greenkeeper badge](https://badges.greenkeeper.io/semantic-release/release-notes-generator.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/semantic-release/release-notes-generator.svg)](https://github.com/semantic-release/release-notes-generator/blob/master/LICENSE)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Travis](https://img.shields.io/travis/semantic-release/release-notes-generator.svg)](https://travis-ci.org/semantic-release/release-notes-generator)
[![Codecov](https://img.shields.io/codecov/c/github/semantic-release/release-notes-generator.svg)](https://codecov.io/gh/semantic-release/release-notes-generator)

## Options

By default `release-notes-generator` uses the `angular` format described in [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md).

Additionnal options can be set within the plugin definition in `package.json` to use a different commit format and to customize it:

```json
{
  "release": {
    "generateNotes": {
      "preset": "angular",
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
      },
      "writerOpts": {
        "commitsSort": ["subject", "scope"],
      }
    }
  }
}
```

| Option       | Description                                                                                                                                                                                                                                                                                        | Default   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `preset`     | [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset (Possible values: `angular`, `atom`, `codemirror`, `ember`, `eslint`, `express`, `jquery`, `jscs`, `jshint`).                                                                                    | `angular` |
| `config`     | NPM package name of a custom [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset.                                                                                                                                                                    | -         |
| `parserOpts` | Additional [conventional-commits-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#options) options that will extends ones loaded by `preset` or `config`. See [Writer options](#writer-options).                        | -         |
| `writerOpts` | Additional [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions) options that will extends ones loaded by `preset` or `config`. See [Parser options](#parser-options). | -         |

**NOTE:** `options.config` will be overwritten by the values of preset. You should use either `preset` or `config`, but not both. Individual properties of `parserOpts` and `writerOpts` will overwrite ones loaded with `preset` or `config`.

### Parser Options

Allow to overwrite specific [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions) options. This is convenient to use a [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset with some customizations without having to create a new module.

The following example uses [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md) but will consider a commit to be a breaking change if it's body contains `BREAKING CHANGE`, `BREAKING CHANGES` or `BREAKING`. By default the [preset](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/index.js#L14) checks only for `BREAKING CHANGE` and `BREAKING CHANGES`.

```json
{
  "release": {
    "generateNotes": {
      "preset": "angular",
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
      }
    }
  }
}
```

### Writer Options

Allow to overwrite specific [conventional-commits-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#options) options. This is convenient to use a [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset with some customizations without having to create a new module.


The following example uses [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md) but will sort the commits in the changelog by `subject` then `scope`. By default the [preset](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/index.js#L90) sort the commits in the changelog by `scope` then `subject`.

```json
{
  "release": {
    "generateNotes": {
      "preset": "angular",
      "writerOpts": {
        "commitsSort": ["subject", "scope"],
      }
    }
  }
}
```
