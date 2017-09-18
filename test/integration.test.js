import test from 'ava';
import pify from 'pify';
import SemanticReleaseError from '@semantic-release/error';
import releaseNotesGenerator from '../lib/index';
import commits from './helpers/commits';

const cwd = process.cwd();

test.afterEach.always(() => {
  process.chdir(cwd);
});

test.serial('Use "conventional-changelog-angular" by default', async t => {
  await commits(['fix(scope1): First fix', 'feat(scope2): Second feature']);
  const changelog = await pify(releaseNotesGenerator)({});

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope1:\*\* First fix/);
  t.regex(changelog, /### Features/);
  t.regex(changelog, /\* \*\*scope2:\*\* Second feature/);
});

test.serial('Accept a "preset" option', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)({preset: 'eslint'});

  t.regex(changelog, /### Fix/);
  t.regex(changelog, /\* First fix .*, closes #123/);
  t.regex(changelog, /### Update/);
  t.regex(changelog, /\* Second feature .*, closes #456/);
});

test.serial('Accept a "config" option', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)({config: 'conventional-changelog-eslint'});

  t.regex(changelog, /### Fix/);
  t.regex(changelog, /\* First fix .*, closes #123/);
  t.regex(changelog, /### Update/);
  t.regex(changelog, /\* Second feature .*, closes #456/);
});

test.serial('Accept an additionnal argument', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)({preset: 'eslint'}, {});

  t.regex(changelog, /### Fix/);
  t.regex(changelog, /\* First fix .*, closes #123/);
  t.regex(changelog, /### Update/);
  t.regex(changelog, /\* Second feature .*, closes #456/);
});

test.serial('Accept a "parseOpts" and "writerOpts" objects as option', async t => {
  const eslintChangelogConfig = await pify(require('conventional-changelog-eslint'))();

  await commits(['##Fix## First fix (fixes #123)', '##Update## Second feature (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)(
    {
      parserOpts: {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'message']},
      writerOpts: eslintChangelogConfig.writerOpts,
    },
    {}
  );

  t.regex(changelog, /### Fix/);
  t.regex(changelog, /\* First fix .*, closes #123/);
  t.regex(changelog, /### Update/);
  t.regex(changelog, /\* Second feature .*, closes #456/);
});

test.serial('Accept a partial "parseOpts" and "writerOpts" objects as option', async t => {
  await commits(['fix(scope1): 2 First fix (fixes #123)', 'fix(scope2): 1 Second fix (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)(
    {
      preset: 'angular',
      parserOpts: {headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/},
      writerOpts: {commitsSort: ['subject', 'scope']},
    },
    {}
  );

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope2:\*\* 1 Second fix[\S\s]*\* \*\*scope1:\*\* 2 First fix/);
});

test.serial('Throw "SemanticReleaseError" if "preset" doesn`t exist', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({preset: 'unknown-preset'}),
    /Preset: "unknown-preset" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test.serial('Throw "SemanticReleaseError" if "config" doesn`t exist', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({config: 'unknown-config'}),
    /Config: "unknown-config" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test.serial('Handle error in "conventional-changelog" and wrap in "SemanticReleaseError"', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({
      writerOpts: {
        transform() {
          throw new Error();
        },
      },
    }),
    /Error in conventional-changelog/
  );

  t.true(error instanceof SemanticReleaseError);
});

test.serial('Accept an undefined "pluginConfig"', async t => {
  await commits(['fix(scope1): First fix', 'feat(scope2): Second feature']);
  const changelog = await pify(releaseNotesGenerator)(undefined);

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope1:\*\* First fix/);
  t.regex(changelog, /### Features/);
  t.regex(changelog, /\* \*\*scope2:\*\* Second feature/);
});
