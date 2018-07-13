import test from 'ava';
import loadChangelogConfig from '../lib/load-changelog-config';

const cwd = process.cwd();

/**
 * AVA macro to verify that `loadChangelogConfig` return a config object with parserOpts and writerOpts.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {[type]} preset the `conventional-changelog` preset to test.
 */
async function loadPreset(t, preset) {
  const changelogConfig = await loadChangelogConfig({preset}, {cwd});

  t.truthy(changelogConfig.parserOpts.headerPattern);
  t.truthy(changelogConfig.writerOpts.groupBy);
}
loadPreset.title = (providedTitle, preset) => `${providedTitle} Load "${preset}" preset`.trim();

/**
 * AVA macro to verify that `loadChangelogConfig` return a config object with parserOpts and writerOpts.
 *
 * @method loadPreset
 * @param {Object} t AVA assertion library.
 * @param {[type]} config the `conventional-changelog` config to test.
 */
async function loadConfig(t, config) {
  const changelogConfig = await loadChangelogConfig({config: `conventional-changelog-${config}`}, {cwd});

  t.truthy(changelogConfig.parserOpts.headerPattern);
  t.truthy(changelogConfig.writerOpts.groupBy);
}
loadConfig.title = (providedTitle, config) => `${providedTitle} Load "${config}" config`.trim();

test('Load "conventional-changelog-angular" by default', async t => {
  const changelogConfig = await loadChangelogConfig({}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "parserOpts" object as option', async t => {
  const customParserOpts = {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'shortDesc']};
  const changelogConfig = await loadChangelogConfig({parserOpts: customParserOpts}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOpts.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOpts.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.falsy(changelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option', async t => {
  const customWriterOpts = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig({writerOpts: customWriterOpts}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOpts.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOpts.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.falsy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
});

test('Accept a partial "parserOpts" object as option that overwrite a preset', async t => {
  const customParserOpts = {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'shortDesc']};
  const changelogConfig = await loadChangelogConfig({parserOpts: customParserOpts, preset: 'angular'}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOpts.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOpts.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option that overwrite a preset', async t => {
  const customWriterOpts = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig({writerOpts: customWriterOpts, preset: 'angular'}, {cwd});
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOpts.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOpts.commitsSort, changelogConfig.writerOpts.commitsSort);
  t.truthy(changelogConfig.writerOpts.noteGroupsSort);
  t.deepEqual(changelogConfig.parserOpts, angularChangelogConfig.parserOpts);
});

test('Accept a partial "parserOpts" object as option that overwrite a config', async t => {
  const customParserOpts = {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'shortDesc']};
  const changelogConfig = await loadChangelogConfig(
    {
      parserOpts: customParserOpts,
      config: 'conventional-changelog-angular',
    },
    {cwd}
  );
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customParserOpts.headerPattern, changelogConfig.parserOpts.headerPattern);
  t.deepEqual(customParserOpts.headerCorrespondence, changelogConfig.parserOpts.headerCorrespondence);
  t.truthy(changelogConfig.parserOpts.noteKeywords);
  t.deepEqual(changelogConfig.writerOpts, angularChangelogConfig.writerOpts);
});

test('Accept a "writerOpts" object as option that overwrite a config', async t => {
  const customWriterOpts = {commitGroupsSort: 'title', commitsSort: ['scope', 'subject']};
  const changelogConfig = await loadChangelogConfig(
    {
      writerOpts: customWriterOpts,
      config: 'conventional-changelog-angular',
    },
    {cwd}
  );
  const angularChangelogConfig = await require('conventional-changelog-angular');

  t.is(customWriterOpts.commitGroupsSort, changelogConfig.writerOpts.commitGroupsSort);
  t.deepEqual(customWriterOpts.commitsSort, changelogConfig.writerOpts.commitsSort);
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

test('Throw error if "config" doesn`t exist', async t => {
  const error = await t.throws(loadChangelogConfig({config: 'unknown-config'}, {cwd}));

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "preset" doesn`t exist', async t => {
  const error = await t.throws(loadChangelogConfig({preset: 'unknown-preset'}, {cwd}));

  t.is(error.code, 'MODULE_NOT_FOUND');
});
