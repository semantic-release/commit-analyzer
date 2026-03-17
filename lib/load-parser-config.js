import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import importFrom from "import-from-esm";
import conventionalChangelogAngular from "conventional-changelog-angular";

import debugFactory from "debug";
const debug = debugFactory(
  "semantic-release:commit-analyser:lib:load-parser-config"
);

/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 *
 * @param {Object} pluginConfig The plugin configuration.
 * @param {Object} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {String} pluginConfig.config Requireable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts Additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} context The semantic-release context.
 * @param {String} context.cwd The current working directory.
 *
 * @return {Promise<Object>} a `Promise` that resolve to the `conventional-changelog-parser` options.
 */
export default async (
  { preset, config, parserOpts, presetConfig },
  { cwd }
) => {
  let loadedConfig;
  const __dirname = dirname(fileURLToPath(import.meta.url));

  if (preset) {
    debug("Loading preset: %s", preset);

    const presetPackage = `conventional-changelog-${preset.toLowerCase()}`;
    debug("Using preset package: %s", presetPackage);

    loadedConfig = await (
      (await importFrom.silent(__dirname, presetPackage)) ||
      (await importFrom(cwd, presetPackage))
    )(presetConfig);
  } else if (config) {
    debug("No preset defined, loading config instead: %s", config);
    loadedConfig = await (
      (await importFrom.silent(__dirname, config)) ||
      (await importFrom(cwd, config))
    )();
  } else {
    debug(
      "No preset or config provided, using conventional-changelog-angular as default"
    );
    loadedConfig = await conventionalChangelogAngular();
  }

  debug("Loaded parser config: ", JSON.stringify(loadedConfig, null, 2));
  debug("Applying parser options: ", parserOpts);

  // Most modern conventional changelog presets (including conventionalcommits) export parserOpts.
  // Some older ones (like conventional-changelog-angular) export parser.
  const mergedConfig = {
    ...(loadedConfig.parserOpts || loadedConfig.parser),
    ...parserOpts,
  };
  debug("Merged parser config: ", JSON.stringify(mergedConfig, null, 2));
  // Merge the loaded parser config with the provided parserOpts
  return mergedConfig;
};
