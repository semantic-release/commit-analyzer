# **sr-commit-analyzer**

Customizable commit-analyzer plugin for [semantic-release](https://github.com/semantic-release/semantic-release) based on [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

[![npm](https://img.shields.io/npm/v/sr-commit-analyzer.svg)](https://www.npmjs.com/package/sr-commit-analyzer)
[![npm](https://img.shields.io/npm/dt/sr-commit-analyzer.svg)](https://www.npmjs.com/package/sr-commit-analyzer)
[![Greenkeeper badge](https://badges.greenkeeper.io/vanduynslagerp/sr-commit-analyzer.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/vanduynslagerp/sr-commit-analyzer.svg)](https://github.com/vanduynslagerp/sr-commit-analyzer/blob/master/LICENSE)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Travis](https://img.shields.io/travis/vanduynslagerp/sr-commit-analyzer.svg)](https://travis-ci.org/vanduynslagerp/sr-commit-analyzer)
[![Codecov](https://img.shields.io/codecov/c/github/vanduynslagerp/sr-commit-analyzer.svg)](https://codecov.io/gh/vanduynslagerp/sr-commit-analyzer)

## Install
```bash
npm install --save-dev semantic-release sr-commit-analyzer
```

Set the `analyzeCommits` plugin for `semantic-release` in `package.json`. See [semantic-release plugins](https://github.com/semantic-release/semantic-release#plugins).
```json
{
  "release": {
    "analyzeCommits": "sr-commit-analyzer"
  }
}
```

## Options

By default `sr-commit-analyzer` uses the `angular` format described in [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md).

Additionnal options can be set within the plugin definition in `package.json` to use a different commit format and to customize it:

```json
{
  "release": {
    "analyzeCommits": {
      "path": "sr-commit-analyzer",
      "preset": "angular",
      "releaseRules": [
        {"type": "docs", "scope":"README", "release": "patch"},
        {"type": "refactor", "release": "patch"},
        {"type": "style", "release": "patch"}
      ],
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
      }
    }
  }
}
```

| Option         | Description                                                                                                                                                                                                                                                                                        | Default                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `preset`       | [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset (possible values: `angular`, `atom`, `codemirror`, `ember`, `eslint`, `express`, `jquery`, `jscs`, `jshint`).                                                                                    | `angular`                             |
| `config`       | NPM package name of a custom [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset.                                                                                                                                                                    | -                                     |
| `releaseRules` | An external module, a path to a module or an `Array` of rules. See [Release rules](#release-rules).                                                                                                                                                                                                 | See [Release rules](#release-rules)     |
| `parserOpts`   | Additional [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions) options that will extends ones loaded by `preset` or `config`. See [Parser options](#parser-options). | -                                     |

**NOTE:** `config` will be overwritten by the values of `preset`. You should use either `preset` or `config`, but not both. Individual properties of `parserOpts` will overwrite ones loaded with `preset` or `config`.

### Release Rules

#### Rules definition
This is an `Array` of rule objects. A rule object has a `release` property and 1 or more criteria.
```json
{
  "release": {
    "analyzeCommits": {
      "path": "sr-commit-analyzer",
      "preset": "angular",
      "releaseRules": [
        {"type": "docs", "scope": "README", "release": "patch"},
        {"type": "refactor", "scope": "/core-.*/", "release": "minor"},
        {"type": "refactor", "release": "patch"}
      ]
    }
  }
}
```
#### Rules matching

Each commit will be compared with each rule and when it matches, the commit will be associated with the release type in the rule's `release` property. If a commit match multiple rules, the highest release type (`major` > `minor` > `patch`) is associated with the commit.

See [release types](lib/default/release-types.js) for the release types hierarchy.

With the previous example:
*   Commits with `type` 'docs' and `scope` 'README' will be associated with a `patch` release.
*   Commits with `type` 'refactor' and `scope` starting with 'core-' (i.e. 'core-ui', 'core-rules', ...) will be associated with a `minor` release.
*   Other commits with `type` 'refactor' (without `scope` or with a `scope` not matching the regexp `/core-.*/`) will be associated with a `patch` release.

#### Default rules matching

If a commit doesn't match any rule in `releaseRules` it will be evaluated agaisnt the [default release rules](lib/default/release-rules.js).

With the previous example:
*   Commits with a breaking change will be associated with a `minor` release.
*   Commits with `type` 'feat' will be associated with a `minor` release.
*   Commits with `type` 'fix' will be associated with a `patch` release.
*   Commits with `type` 'perf' will be associated with a `patch` release.

#### No rules matching

If a commit doesn't match any rules in `releaseRules` or in [default release rules](lib/default/release-rules.js) then no release type will be associated with the commit.

With the previous example:
*   Commits with `type` 'style' will not be associated with a release type.
*   Commits with `type` 'test' will not be associated with a release type.
*   Commits with `type` 'chore' will not be associated with a release type.

#### Multiple commits

If there is multiple commits that match one or more rules, the one with the highest realease type will determine the global release type.

Considering the following commits:
*   `docs(README): Add more details to the API docs`
*   `feat(API): Add a new method to the public API`

With the previous example the release type determine by the plugin will be `minor`.

#### Specific commit properties

The properties to set in the rules will depends on the commit style choosen. For example [conventional-changelog-angular](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/index.js#L9-L13) use the commit properties `type`, `scope` and `subject` but [conventional-changelog-eslint](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-eslint/index.js#L9-L12) uses `tag` and `message`.

For example with `eslint` preset:
```json
{
  "release": {
    "analyzeCommits": {
      "path": "sr-commit-analyzer",
      "preset": "eslint",
      "releaseRules": [
        {"tag": "Docs", "message":"/README/", "release": "patch"},
        {"type": "New", "release": "patch"}
      ]
    }
  }
}
```
With this configuration:
*   Commits with `tag` 'Docs', that contains 'README' in their header message will be associated with a `patch` release.
*   Commits with `tag` 'New' will be associated with a `patch` release.
*   Commits with `tag` 'Breaking' will be associated with a `major` release (per [default release rules](lib/default/release-rules.js)).
*   Commits with `tag` 'Fix' will be associated with a `patch` release (per [default release rules](lib/default/release-rules.js)).
*   Commits with `tag` 'Update' will be associated with a `minor` release (per [default release rules](lib/default/release-rules.js)).
*   Commits with `tag` 'New' will be associated with a `minor` release (per [default release rules](lib/default/release-rules.js)).
*   All other commits will not be associated with a release type.

#### External package / file

`releaseRules` can also reference a module, either by it's `npm` name or path:
```json
{
  "release": {
    "analyzeCommits": {
      "path": "sr-commit-analyzer",
      "preset": "angular",
      "releaseRules": "./config/release-rules.js"
    }
  }
}
```
```js
// File: config/release-rules.js
module.exports = [
  {type: 'docs', scope: 'README', release: 'patch'},
  {type: 'refactor', scope: /core-.*/, release: 'minor'},
  {type: 'refactor', release: 'patch'},
];
```

### Parser Options

Allow to overwrite specific [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions) options. This is convenient to use a [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset with some customizations without having to create a new module.

The following example uses [Angular convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md) but will consider a commit to be a breaking change if it's body contains `BREAKING CHANGE`, `BREAKING CHANGES` or `BREAKING`. By default the [preset](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/index.js#L14) checks only for `BREAKING CHANGE` and `BREAKING CHANGES`.
```json
{
  "release": {
    "analyzeCommits": {
      "path": "sr-commit-analyzer",
      "preset": "angular",
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
      }
    }
  }
}
```
