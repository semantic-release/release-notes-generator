import test from "ava";
import importFrom from "import-from-esm";
import sinon from "sinon";

import conventionalChangelogAngular from "conventional-changelog-angular";
import conventionalChangelogConventionalcommits from "conventional-changelog-conventionalcommits";
import loadChangelogConfig from "../lib/load-changelog-config.js";

const cwd = process.cwd();

/**
 * assertion to compare loaded writerOpts with the expected writerOpts from a preset
 *
 * @param {Object} t AVA assertion library.
 * @param {Object} loadedWriterOpts
 * @param {Object} expectedWriterOpts
 */
function assertWriterOptsMatch(t, loadedWriterOpts, expectedWriterOpts) {
  const { transform: loadedTransform, ...loadedWriterOptsWithoutTransform } = loadedWriterOpts;
  const { transform: expectedTransform, ...expectedWriterOptsWithoutTransform } = expectedWriterOpts;

  for (const key of Object.keys(loadedWriterOptsWithoutTransform)) {
    if (typeof loadedWriterOptsWithoutTransform[key] === "function") {
      t.is(loadedWriterOptsWithoutTransform[key].toString(), expectedWriterOptsWithoutTransform[key].toString());
    } else {
      t.deepEqual(loadedWriterOptsWithoutTransform[key], expectedWriterOptsWithoutTransform[key]);
    }
  }
  t.is(loadedTransform.toString(), expectedTransform.toString());
}

/**
 * AVA macro to verify that `loadChangelogConfig` return a config object with parserOpts and writerOpts.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {String} preset the `conventional-changelog` preset to test.
 * @param {Object} pluginOptions The plugin configuration.
 */
async function loadPreset(t, preset, pluginOptions) {
  const changelogConfig = await loadChangelogConfig({ ...pluginOptions, preset }, { cwd });

  t.truthy(changelogConfig.parserOpts.headerPattern);
  t.truthy(changelogConfig.writerOpts.groupBy);
}

loadPreset.title = (providedTitle, preset) => `${providedTitle} Load "${preset}" preset`.trim();

/**
 * AVA macro to verify that `loadChangelogConfig` return a config object with parserOpts and writerOpts.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {String} config the `conventional-changelog` config to test.
 * @param {Object} pluginOptions The plugin configuration.
 */
async function loadConfig(t, config, pluginOptions) {
  const changelogConfig = await loadChangelogConfig(
    { ...pluginOptions, config: `conventional-changelog-${config}` },
    { cwd }
  );

  t.truthy(changelogConfig.parserOpts.headerPattern);
  t.truthy(changelogConfig.writerOpts.groupBy);
}

loadConfig.title = (providedTitle, config) => `${providedTitle} Load "${config}" config`.trim();

test('Load "conventional-changelog-conventionalcommits" by default', async (t) => {
  const changelogConfig = await loadChangelogConfig({}, { cwd });
  const conventionalcommitsChangelogConfig = await conventionalChangelogConventionalcommits();

  t.deepEqual(changelogConfig.parserOpts, conventionalcommitsChangelogConfig.parser);
  assertWriterOptsMatch(t, changelogConfig.writerOpts, conventionalcommitsChangelogConfig.writer);
});

test('Accept a "parserOpts" object as option', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const changelogConfig = await loadChangelogConfig({ parserOpts: customParserOptions }, { cwd });
  const conventionalcommitsChangelogConfig = await conventionalChangelogConventionalcommits();

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.deepEqual(changelogConfig.parserOpts.noteKeywords, conventionalcommitsChangelogConfig.parser.noteKeywords);
  assertWriterOptsMatch(t, changelogConfig.writerOpts, conventionalcommitsChangelogConfig.writer);
});

test('Accept a "writerOpts" object as option', async (t) => {
  const customWriterOptions = { commitGroupsSort: "title", commitsSort: ["scope", "subject"] };
  const changelogConfig = await loadChangelogConfig({ writerOpts: customWriterOptions }, { cwd });
  const conventionalcommitsChangelogConfig = await conventionalChangelogConventionalcommits();

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.deepEqual(changelogConfig.writerOpts.noteGroupsSort, conventionalcommitsChangelogConfig.writer.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, conventionalcommitsChangelogConfig.parser);
});

test('Accept a partial "parserOpts" object as option that overwrite a preset', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const changelogConfig = await loadChangelogConfig({ parserOpts: customParserOptions, preset: "angular" }, { cwd });
  const angularChangelogConfig = await conventionalChangelogAngular();

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  assertWriterOptsMatch(t, changelogConfig.writerOpts, angularChangelogConfig.writer);
});

test('Accept a "writerOpts" object as option that overwrite a preset', async (t) => {
  const customWriterOptions = { commitGroupsSort: "title", commitsSort: ["scope", "subject"] };
  const changelogConfig = await loadChangelogConfig({ writerOpts: customWriterOptions, preset: "angular" }, { cwd });
  const angularChangelogConfig = await conventionalChangelogAngular();

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.truthy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parser);
});

test('Accept a partial "parserOpts" object as option that overwrite a config', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ["tag", "shortDesc"],
  };
  const changelogConfig = await loadChangelogConfig(
    {
      parserOpts: customParserOptions,
      config: "conventional-changelog-angular",
    },
    { cwd }
  );
  const angularChangelogConfig = await conventionalChangelogAngular();

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  assertWriterOptsMatch(t, changelogConfig.writerOpts, angularChangelogConfig.writer);
});

test('Accept a "writerOpts" object as option that overwrite a config', async (t) => {
  const customWriterOptions = { commitGroupsSort: "title", commitsSort: ["scope", "subject"] };
  const changelogConfig = await loadChangelogConfig(
    {
      writerOpts: customWriterOptions,
      config: "conventional-changelog-angular",
    },
    { cwd }
  );
  const angularChangelogConfig = await conventionalChangelogAngular();

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.truthy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parser);
});

test(loadPreset, "angular");
test(loadConfig, "angular");
test(loadPreset, "conventionalcommits", { presetConfig: {} });
test(loadConfig, "conventionalcommits", { presetConfig: {} });

test('Throw error if "config" doesn`t exist', async (t) => {
  await t.throwsAsync(loadChangelogConfig({ config: "unknown-config" }, { cwd }), { code: "MODULE_NOT_FOUND" });
});

test('Throw error if "preset" doesn`t exist', async (t) => {
  await t.throwsAsync(loadChangelogConfig({ preset: "unknown-preset" }, { cwd }), { code: "MODULE_NOT_FOUND" });
});

test.serial("Load preset and config correctly when importFrom.silent fails", async (t) => {
  sinon.stub(importFrom, "silent").returns(undefined);

  await loadPreset(t, "angular");
  await loadConfig(t, "angular");

  sinon.restore();
});
