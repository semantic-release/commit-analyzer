import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { isPlainObject } from "lodash-es";
import importFrom from "import-from";
import conventionalChangelogAngular from "conventional-changelog-angular";

/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 *
 * @param {Object} pluginConfig The plugin configuration.
 * @param {Object} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {String} pluginConfig.config Requireable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts Additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} context The semantic-release context.
 * @param {String} context.cwd The current working directory.
 * @return {Promise<Object>} a `Promise` that resolve to the `conventional-changelog-parser` options.
 */
export default async ({ preset, config, parserOpts, presetConfig }, { cwd }) => {
  let loadedConfig;
  const __dirname = dirname(fileURLToPath(import.meta.url));

  if (preset) {
    const presetPackage = `conventional-changelog-${preset.toLowerCase()}`;
    loadedConfig = importFrom.silent(__dirname, presetPackage) || importFrom(cwd, presetPackage);
  } else if (config) {
    loadedConfig = importFrom.silent(__dirname, config) || importFrom(cwd, config);
  } else {
    loadedConfig = conventionalChangelogAngular;
  }

  if(typeof loadedConfig === "function") {
    if(isPlainObject(presetConfig)) {
      loadedConfig = isAsyncFunction(loadedConfig) ? await loadedConfig(presetConfig) : loadedConfig(presetConfig)
    } else {
      loadedConfig = isAsyncFunction(loadedConfig) ? await loadedConfig() : loadedConfig()
    }
  }

  return { ...loadedConfig.parserOpts, ...parserOpts };
};
