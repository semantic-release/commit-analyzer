const importCwd = require('import-cwd');
const pify = require('pify');
const {mergeWith} = require('lodash');
const SemanticReleaseError = require('@semantic-release/error');
const conventionalChangelogAngular = require('conventional-changelog-angular');

/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 *
 * @param {Object} preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {string} config requierable npm package with a custom conventional-changelog preset
 * @param {Object} parserOpts additionnal `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @return {Promise<Object>} a `Promise` that resolve to the `conventional-changelog-parser` options.
 */
module.exports = async ({preset, config, parserOpts}) => {
  let loadedConfig = {};

  if (preset) {
    try {
      loadedConfig = importCwd(`conventional-changelog-${preset.toLowerCase()}`);
    } catch (err) {
      throw new SemanticReleaseError(`Preset: "${preset}" does not exist: ${err.message}`, err.code);
    }
  } else if (config) {
    try {
      loadedConfig = importCwd(config);
    } catch (err) {
      throw new SemanticReleaseError(`Config: "${config}" does not exist: ${err.message}`, err.code);
    }
  } else if (!parserOpts) {
    loadedConfig = conventionalChangelogAngular;
  }

  if (typeof loadedConfig === 'function') {
    loadedConfig = await pify(loadedConfig)();
  } else {
    loadedConfig = await loadedConfig;
  }
  return mergeWith(
    {},
    loadedConfig.parserOpts,
    parserOpts,
    (value, source) => (Array.isArray(value) ? source : undefined)
  );
};
