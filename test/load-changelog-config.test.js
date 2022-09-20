const test = require('ava');
const loadChangelogConfig = require('../lib/load-changelog-config.js');

const cwd = process.cwd();

/**
 * AVA macro to verify that `loadChangelogConfig` return a config object with parserOpts and writerOpts.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {String} preset the `conventional-changelog` preset to test.
 * @param {Object} pluginOptions The plugin configuration.
 */
async function loadPreset(t, preset, pluginOptions) {
  const changelogConfig = await loadChangelogConfig({...pluginOptions, preset}, {cwd});

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
    {...pluginOptions, config: `conventional-changelog-${config}`},
    {cwd}
  );

  t.truthy(changelogConfig.parserOpts.headerPattern);
  t.truthy(changelogConfig.writerOpts.groupBy);
}

loadConfig.title = (providedTitle, config) => `${providedTitle} Load "${config}" config`.trim();

test('Load "conventional-changelog-angular" by default', async (t) => {
  const changelogConfig = await loadChangelogConfig({}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "parserOpts" object as option', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ['tag', 'shortDesc'],
  };
  const changelogConfig = await loadChangelogConfig({parserOpts: customParserOptions}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.deepEqual(changelogConfig.parserOpts.noteKeywords, angularChangelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option', async (t) => {
  const customWriterOptions = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig({writerOpts: customWriterOptions}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.deepEqual(changelogConfig.writerOpts.noteGroupsSort, angularChangelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
});

test('Accept a partial "parserOpts" object as option that overwrite a preset', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ['tag', 'shortDesc'],
  };
  const changelogConfig = await loadChangelogConfig({parserOpts: customParserOptions, preset: 'angular'}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option that overwrite a preset', async (t) => {
  const customWriterOptions = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig({writerOpts: customWriterOptions, preset: 'angular'}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.truthy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
});

test('Accept a partial "parserOpts" object as option that overwrite a config', async (t) => {
  const customParserOptions = {
    headerPattern: /^##(?<tag>.*?)## (?<shortDesc>.*)$/,
    headerCorrespondence: ['tag', 'shortDesc'],
  };
  const changelogConfig = await loadChangelogConfig(
    {
      parserOpts: customParserOptions,
      config: 'conventional-changelog-angular',
    },
    {cwd}
  );
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOptions.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOptions.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option that overwrite a config', async (t) => {
  const customWriterOptions = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig(
    {
      writerOpts: customWriterOptions,
      config: 'conventional-changelog-angular',
    },
    {cwd}
  );
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOptions.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOptions.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.truthy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
});

test(loadPreset, 'angular');
test(loadConfig, 'angular');
test(loadPreset, 'atom');
test(loadConfig, 'atom');
test(loadPreset, 'ember');
test(loadConfig, 'ember');
test(loadPreset, 'eslint');
test(loadConfig, 'eslint');
test(loadPreset, 'express');
test(loadConfig, 'express');
test(loadPreset, 'jshint');
test(loadConfig, 'jshint');
test(loadPreset, 'conventionalcommits', {presetConfig: {}});
test(loadConfig, 'conventionalcommits', {presetConfig: {}});

test('Throw error if "config" doesn`t exist', async (t) => {
  await t.throwsAsync(loadChangelogConfig({config: 'unknown-config'}, {cwd}), {code: 'MODULE_NOT_FOUND'});
});

test('Throw error if "preset" doesn`t exist', async (t) => {
  await t.throwsAsync(loadChangelogConfig({preset: 'unknown-preset'}, {cwd}), {code: 'MODULE_NOT_FOUND'});
});
