import {promisify} from 'util';
import test from 'ava';
import escape from 'escape-string-regexp';
import releaseNotesGenerator from '..';

const cwd = process.cwd();
const repositoryUrl = 'https://github.com/owner/repo';
const lastRelease = {gitTag: 'v1.0.0'};
const nextRelease = {gitTag: 'v2.0.0', version: '2.0.0'};

test('Use "conventional-changelog-angular" by default', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator({}, {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits});

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))')));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://github.com/owner/repo/commit/222))'))
  );
});

test('Accept a "preset" option', async t => {
  const commits = [
    {hash: '111', message: 'Fix: First fix (fixes #123)'},
    {hash: '222', message: 'Update: Second feature (fixes #456)'},
  ];
  const changelog = await releaseNotesGenerator(
    {preset: 'eslint'},
    {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)'
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)'
      )
    )
  );
});

test('Accept a "config" option', async t => {
  const commits = [
    {hash: '111', message: 'Fix: First fix (fixes #123)'},
    {hash: '222', message: 'Update: Second feature (fixes #456)'},
  ];
  const changelog = await releaseNotesGenerator(
    {config: 'conventional-changelog-eslint'},
    {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)'
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)'
      )
    )
  );
});

test('Accept a "parseOpts" and "writerOpts" objects as option', async t => {
  const commits = [
    {hash: '111', message: '%%Fix%% First fix (keyword #123)'},
    {hash: '222', message: '%%Update%% Second feature (keyword JIRA-456)'},
  ];
  const changelog = await releaseNotesGenerator(
    {
      parserOpts: {
        headerPattern: /^%%(.*?)%% (.*)$/,
        headerCorrespondence: ['tag', 'message'],
        referenceActions: ['keyword'],
        issuePrefixes: ['#', 'JIRA-'],
      },
      writerOpts: (await promisify(require('conventional-changelog-eslint'))()).writerOpts,
    },
    {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* First fix (keyword #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)'
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* Second feature (keyword JIRA-456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)'
      )
    )
  );
});

test('Accept a partial "parseOpts" and "writerOpts" objects as option', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): 2 First fix (fixes #123)'},
    {hash: '222', message: 'fix(scope2): 1 Second fix (fixes #456)'},
  ];
  const changelog = await releaseNotesGenerator(
    {
      preset: 'angular',
      parserOpts: {headerPattern: /^(\w*)(?:\((.*)\)): (.*)$/},
      writerOpts: {commitsSort: ['subject', 'scope']},
    },
    {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope2:\*\* 1 Second fix[\S\s]*\* \*\*scope1:\*\* 2 First fix/);
});

test('Use "gitHead" from "lastRelease" and "nextRelease" if "gitTag" is not defined', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {
      cwd,
      options: {repositoryUrl},
      lastRelease: {gitHead: 'abc'},
      nextRelease: {gitHead: 'def', version: '2.0.0'},
      commits,
    }
  );

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/abc...def)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))')));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://github.com/owner/repo/commit/222))'))
  );
});

test('Accept a custom repository URL', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'http://domain.com:90/owner/repo'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))')));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))'))
  );
});

test('Accept a custom repository URL with git format', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'git@domain.com:owner/repo.git'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))')));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))'))
  );
});

test('Accept a custom repository URL with git+http format', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'git+http://domain.com:90/owner/repo'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))')));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))'))
  );
});

test('Accept a custom repository URL with git+https format', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix\n\nresolve #10'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'git+https://domain.com:90/owner/repo'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* **scope1:** First fix ([111](https://domain.com:90/owner/repo/commit/111)), closes [#10](https://domain.com:90/owner/repo/issues/10)'
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://domain.com:90/owner/repo/commit/222))'))
  );
});

test('Accept a Bitbucket repository URL', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix\n\nResolves #10'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'git+https://bitbucket.org/owner/repo'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://bitbucket.org/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* **scope1:** First fix ([111](https://bitbucket.org/owner/repo/commits/111)), closes [#10](https://bitbucket.org/owner/repo/issue/10)'
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://bitbucket.org/owner/repo/commits/222))'))
  );
});

test('Accept a Gitlab repository URL', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix\n\nclosed #10'},
    {hash: '222', message: 'feat(scope2): Second feature'},
  ];
  const changelog = await releaseNotesGenerator(
    {},
    {cwd, options: {repositoryUrl: 'git+https://gitlab.com/owner/repo'}, lastRelease, nextRelease, commits}
  );

  t.regex(changelog, new RegExp(escape('(https://gitlab.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        '* **scope1:** First fix ([111](https://gitlab.com/owner/repo/commit/111)), closes [#10](https://gitlab.com/owner/repo/issues/10)'
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape('* **scope2:** Second feature ([222](https://gitlab.com/owner/repo/commit/222))'))
  );
});

test('Ignore malformatted commits and include valid ones', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'Feature => Invalid message'},
  ];
  const changelog = await releaseNotesGenerator({}, {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits});

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope1:\*\* First fix/);
  t.notRegex(changelog, /### Features/);
  t.notRegex(changelog, /Feature => Invalid message/);
});

test('Exclude commits if they have a matching revert commits', async t => {
  const commits = [
    {hash: '111', message: 'fix(scope1): First fix'},
    {hash: '222', message: 'feat(scope2): First feature'},
    {hash: '333', message: 'revert: feat(scope2): First feature\n\nThis reverts commit 222.\n'},
  ];
  const changelog = await releaseNotesGenerator({}, {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits});

  t.regex(changelog, new RegExp(escape('(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)')));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape('* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))')));
  t.notRegex(changelog, /### Features/);
  t.notRegex(changelog, /Second feature/);
});

test('Throw error if "preset" doesn`t exist', async t => {
  const commits = [
    {hash: '111', message: 'Fix: First fix (fixes #123)'},
    {hash: '222', message: 'Update: Second feature (fixes #456)'},
  ];
  const error = await t.throws(
    releaseNotesGenerator(
      {preset: 'unknown-preset'},
      {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
    )
  );

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "config" doesn`t exist', async t => {
  const commits = [
    {hash: '111', message: 'Fix: First fix (fixes #123)'},
    {hash: '222', message: 'Update: Second feature (fixes #456)'},
  ];
  const error = await t.throws(
    releaseNotesGenerator(
      {config: 'unknown-config'},
      {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
    )
  );

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('ReThrow error from "conventional-changelog"', async t => {
  const commits = [
    {hash: '111', message: 'Fix: First fix (fixes #123)'},
    {hash: '222', message: 'Update: Second feature (fixes #456)'},
  ];
  const error = await t.throws(
    releaseNotesGenerator(
      {
        writerOpts: {
          transform() {
            throw new Error('Test error');
          },
        },
      },
      {cwd, options: {repositoryUrl}, lastRelease, nextRelease, commits}
    )
  );

  t.is(error.message, 'Test error');
});
