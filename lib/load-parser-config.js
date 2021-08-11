import {promisify} from 'util';
import lodash from 'lodash';
import importFrom, {silent} from 'import-from';
import conventionalChangelogAngular from 'conventional-changelog-angular';

const {isPlainObject} = lodash;

/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 *
 * @param {Object} pluginConfig The plugin configuration.
 * @param {Object} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {String} pluginConfig.config Requierable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts Additionnal `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} context The semantic-release context.
 * @param {String} context.cwd The current working directory.
 * @return {Promise<Object>} a `Promise` that resolve to the `conventional-changelog-parser` options.
 */
export default async ({preset, config, parserOpts, presetConfig}, {cwd}) => {
  let loadedConfig;

  if (preset) {
    const presetPackage = `conventional-changelog-${preset.toLowerCase()}`;
    loadedConfig = silent(__dirname, presetPackage) || importFrom(cwd, presetPackage);
  } else if (config) {
    loadedConfig = silent(__dirname, config) || importFrom(cwd, config);
  } else {
    loadedConfig = conventionalChangelogAngular;
  }

  loadedConfig = await (typeof loadedConfig === 'function'
    ? isPlainObject(presetConfig)
      ? loadedConfig(presetConfig)
      : promisify(loadedConfig)()
    : loadedConfig);

  return {...loadedConfig.parserOpts, ...parserOpts};
};
