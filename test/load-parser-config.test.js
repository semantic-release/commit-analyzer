import test from "ava";
import loadParserConfig from "../lib/load-parser-config.js";

const cwd = process.cwd();

/**
 * AVA macro to verify that `loadParserConfig` return a parserOpts object.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {[type]} preset the `conventional-changelog` preset to test.
 * @param {Object} pluginOptions The plugin configuration.
 */
async function loadPreset(t, preset, pluginOptions) {
  t.truthy((await loadParserConfig({ ...pluginOptions, preset }, { cwd })).headerPattern);
}

loadPreset.title = (providedTitle, preset) => `${providedTitle} Load "${preset}" preset`.trim();

/**
 * AVA macro to verify that `loadParserConfig` return a parserOpts object.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {[type]} config the `conventional-changelog` config to test.
 * @param {Object} pluginOptions The plugin configuration.
 */
async function loadConfig(t, config, pluginOptions) {
  t.truthy(
    (await loadParserConfig({ ...pluginOptions, config: `conventional-changelog-${config}` }, { cwd })).headerPattern
  );
}

loadConfig.title = (providedTitle, config) => `${providedTitle} Load "${config}" config`.trim();

test('Load "conventional-changelog-angular" by default', async (t) => {
  t.deepEqual(
    await loadParserConfig({}, { cwd }),
    (await (await import("conventional-changelog-angular")).default()).parserOpts
  );
});

test('Accept a "parserOpts" object as option', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<type>.*?)## (?<subject>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const parserOptions = await loadParserConfig({ parserOpts: customParserOptions }, { cwd });

  t.is(customParserOptions.headerPattern, parserOptions.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, parserOptions.headerCorrespondence);
});

test('Accept a partial "parserOpts" object as option that overlaod a preset', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<type>.*?)## (?<subject>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const parserOptions = await loadParserConfig({ parserOpts: customParserOptions, preset: "angular" }, { cwd });

  t.is(customParserOptions.headerPattern, parserOptions.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, parserOptions.headerCorrespondence);
  t.truthy(parserOptions.noteKeywords);
});

test('Accept a partial "parserOpts" object as option that overlaod a config', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<type>.*?)## (?<subject>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const parserOptions = await loadParserConfig(
    { parserOpts: customParserOptions, config: "conventional-changelog-angular" },
    { cwd }
  );

  t.is(customParserOptions.headerPattern, parserOptions.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, parserOptions.headerCorrespondence);
  t.truthy(parserOptions.noteKeywords);
});

test(loadPreset, "angular");
test(loadConfig, "angular");
test(loadPreset, "atom");
test(loadConfig, "atom");
test(loadPreset, "ember");
test(loadConfig, "ember");
test(loadPreset, "eslint");
test(loadConfig, "eslint");
test(loadPreset, "express");
test(loadConfig, "express");
test(loadPreset, "jshint");
test(loadConfig, "jshint");
test(loadPreset, "conventionalcommits", { presetConfig: {} });
test(loadConfig, "conventionalcommits", { presetConfig: {} });

test('Throw error if "config" doesn`t exist', async (t) => {
  await t.throwsAsync(loadParserConfig({ config: "unknown-config" }, { cwd }), { code: "MODULE_NOT_FOUND" });
});

test('Throw error if "preset" doesn`t exist', async (t) => {
  await t.throwsAsync(loadParserConfig({ preset: "unknown-preset" }, { cwd }), { code: "MODULE_NOT_FOUND" });
});
