import test from 'ava';
import pify from 'pify';
import SemanticReleaseError from '@semantic-release/error';
import releaseNotesGenerator from '../lib/index';
import commits from './helpers/commits';

test.serial('Use "conventional-changelog-angular" by default', async t => {
  await commits(['fix(scope1): First fix', 'feat(scope2): Second feature']);
  const changelog = await pify(releaseNotesGenerator)({});

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope1:\*\* First fix/);
  t.regex(changelog, /### Features/);
  t.regex(changelog, /\* \*\*scope2:\*\* Second feature/);
});

test.serial('Accept a preset option', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const changelog = await pify(releaseNotesGenerator)({preset: 'eslint'});

  t.regex(changelog, /### Fix/);
  t.regex(changelog, /\* First fix .*, closes #123/);
  t.regex(changelog, /### Update/);
  t.regex(changelog, /\* Second feature .*, closes #456/);
});

test.serial('Accept a config option', async t => {
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

test.serial('Throw SemanticReleaseError if "preset" doesn`t exist', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({preset: 'unknown-preset'}),
    /Preset: "unknown-preset" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test.serial('Throw SemanticReleaseError if "config" doesn`t exist', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({config: 'unknown-config'}),
    /Config: "unknown-config" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test.serial('Handle error in "conventional-changelog" and wrap in SemanticReleaseError', async t => {
  await commits(['Fix: First fix (fixes #123)', 'Update: Second feature (fixes #456)']);
  const error = await t.throws(
    pify(releaseNotesGenerator)({
      transform() {
        throw new Error();
      },
    }),
    /Error in conventional-changelog/
  );

  t.true(error instanceof SemanticReleaseError);
});
