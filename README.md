# **sr-release-notes-generator**

Customizable release-notes-generator plugin for [semantic-release](https://github.com/semantic-release/semantic-release) based on [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

[![npm](https://img.shields.io/npm/v/sr-release-notes-generator.svg)](https://www.npmjs.com/package/sr-release-notes-generator)
[![npm](https://img.shields.io/npm/dt/sr-release-notes-generator.svg)](https://www.npmjs.com/package/sr-release-notes-generator)
[![Greenkeeper badge](https://badges.greenkeeper.io/vanduynslagerp/sr-release-notes-generator.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/vanduynslagerp/sr-release-notes-generator.svg)](https://github.com/vanduynslagerp/sr-release-notes-generator/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Travis](https://img.shields.io/travis/vanduynslagerp/sr-release-notes-generator.svg)](https://travis-ci.org/vanduynslagerp/sr-release-notes-generator)
[![Code Climate](https://img.shields.io/codeclimate/github/vanduynslagerp/karma-postcss-preprocessor.svg)](https://codeclimate.com/github/vanduynslagerp/karma-postcss-preprocessor)
[![Codecov](https://img.shields.io/codecov/c/github/vanduynslagerp/sr-release-notes-generator.svg)](https://codecov.io/gh/vanduynslagerp/sr-release-notes-generator)

## Install
```bash
npm install --save-dev semantic-release sr-release-notes-generator
```

Set the `generateNotes` plugin for `semantic-release` in `package.json`. See [semantic-release plugins](https://github.com/semantic-release/semantic-release#plugins).
```json
{
  "release": {
    "generateNotes": "sr-release-notes-generator"
  }
}
```

## Options

By default `sr-release-notes-generator` uses the `angular` format described in [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md).

Additionnal options can be set within the plugin definition in `package.json` to use a different commit format and to customize it:

```json
{
  "release": {
    "generateNotes": {
      "path": "sr-release-notes-generator",
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
      "path": "sr-release-notes-generator",
      "preset": "angular",
      "writerOpts": {
        "commitsSort": ["subject", "scope"],
      }
    }
  }
}
```
