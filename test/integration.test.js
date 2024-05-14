import path from "node:path";
import test from "ava";
import fs from "fs-extra";
import escape from "escape-string-regexp";
import { temporaryDirectory } from "tempy";
import * as td from "testdouble";
import streamBuffers from "stream-buffers";
import conventionalChangelogEslint from "conventional-changelog-eslint";

const cwd = process.cwd();
const host = "https://github.com";
const owner = "owner";
const repository = "repo";
const repositoryUrl = `${host}/${owner}/${repository}`;
const lastRelease = { gitTag: "v1.0.0" };
const nextRelease = { gitTag: "v2.0.0", version: "2.0.0" };

test.afterEach.always(() => {
  td.reset();
});

test.serial('Use "conventional-changelog-angular" by default', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://github.com/owner/repo/commit/222))"))
  );
});

test.serial("Set conventional-changelog-writer context", async (t) => {
  t.plan(0);
  const cwd = temporaryDirectory();
  const writerDouble = td.func();
  td.when(
    writerDouble({
      version: nextRelease.version,
      host,
      owner,
      repository,
      previousTag: lastRelease.gitTag,
      currentTag: nextRelease.gitTag,
      linkCompare: lastRelease.gitTag,
      issue: "issues",
      commit: "commit",
      packageData: undefined,
      linkReferences: undefined,
    }),
    { ignoreExtraArgs: true }
  ).thenReturn(new streamBuffers.WritableStreamBuffer());
  await td.replaceEsm("../wrappers/conventional-changelog-writer.js", {}, writerDouble);
  const { generateNotes } = await import("../index.js");

  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });
});

test.serial("Set conventional-changelog-writer context with package.json", async (t) => {
  t.plan(0);
  const cwd = temporaryDirectory();
  const packageData = { name: "package", version: "0.0.0" };
  const writerDouble = td.func();
  td.when(
    writerDouble({
      version: nextRelease.version,
      host,
      owner,
      repository,
      previousTag: lastRelease.gitTag,
      currentTag: nextRelease.gitTag,
      linkCompare: lastRelease.gitTag,
      issue: "issues",
      commit: "commit",
      packageData,
      linkReferences: undefined,
    }),
    { ignoreExtraArgs: true }
  ).thenReturn(new streamBuffers.WritableStreamBuffer());
  await td.replaceEsm("../wrappers/conventional-changelog-writer.js", {}, writerDouble);
  const { generateNotes } = await import("../index.js");

  await fs.outputJson(path.resolve(cwd, "package.json"), packageData);

  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });
});

test.serial('Accept a "preset" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "Fix: First fix (fixes #123)" },
    { hash: "222", message: "Update: Second feature (fixes #456)" },
  ];
  const changelog = await generateNotes(
    { preset: "eslint" },
    { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)"
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)"
      )
    )
  );
});

test.serial('Accept a "config" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "Fix: First fix (fixes #123)" },
    { hash: "222", message: "Update: Second feature (fixes #456)" },
  ];
  const changelog = await generateNotes(
    { config: "conventional-changelog-eslint" },
    { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)"
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)"
      )
    )
  );
});

test.serial('Accept a "parseOpts" and "writerOpts" objects as option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "%%Fix%% First fix (keyword #123)" },
    { hash: "222", message: "%%Update%% Second feature (keyword JIRA-456)" },
  ];
  const changelog = await generateNotes(
    {
      parserOpts: {
        headerPattern: /^%%(?<tag>.*?)%% (?<message>.*)$/,
        headerCorrespondence: ["tag", "message"],
        referenceActions: ["keyword"],
        issuePrefixes: ["#", "JIRA-"],
      },
      writerOpts: (await conventionalChangelogEslint()).writer,
    },
    { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Fix/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* First fix (keyword #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)"
      )
    )
  );
  t.regex(changelog, /### Update/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* Second feature (keyword JIRA-456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)"
      )
    )
  );
});

test.serial('Accept a partial "parseOpts" and "writerOpts" objects as option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): 2 First fix (fixes #123)" },
    { hash: "222", message: "fix(scope2): 1 Second fix (fixes #456)" },
  ];
  const changelog = await generateNotes(
    {
      preset: "angular",
      parserOpts: { headerPattern: /^(?<type>\w*)\((?<scope>.*)\): (?<subject>.*)$/ },
      writerOpts: { commitsSort: ["subject", "scope"] },
    },
    { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope2:\*\* 1 Second fix[\S\s]*\* \*\*scope1:\*\* 2 First fix/);
});

test.serial('Accept a partial "presetConfig" object as option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix: First fix" },
    { hash: "222", message: "test: Change test" },
  ];
  const changelog = await generateNotes(
    {
      preset: "conventionalcommits",
      presetConfig: {
        types: [
          { type: "fix", section: "Bug Fixes", hidden: true },
          { type: "test", section: "Test !!", hidden: false },
        ],
      },
    },
    { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
  );

  t.notRegex(changelog, /### Bug Fixes/);
  t.notRegex(changelog, new RegExp(escape("First fix")));
  t.regex(changelog, /### Test !!/);
  t.regex(changelog, new RegExp(escape("* Change test ([222](https://github.com/owner/repo/commit/222))")));
});

test.serial('Use "gitHead" from "lastRelease" and "nextRelease" if "gitTag" is not defined', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    {
      cwd,
      options: { repositoryUrl },
      lastRelease: { gitHead: "abc" },
      nextRelease: { gitHead: "def", version: "2.0.0" },
      commits,
    }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/abc...def)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://github.com/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "http://domain.com:90/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL with git format", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "git@domain.com:owner/repo.git" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL with git format without user", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "domain.com:owner/repo.git" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL with git+http format", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "git+http://domain.com:90/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))"))
  );
});

test.serial('Accept a custom repository URL with ".git" extension', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "https://domain.com:90/owner/repo.git" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope1:** First fix ([111](https://domain.com:90/owner/repo/commit/111))"))
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://domain.com:90/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL with git+https format", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix\n\nresolve #10" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "git+https://domain.com:90/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* **scope1:** First fix ([111](https://domain.com:90/owner/repo/commit/111)), closes [#10](https://domain.com:90/owner/repo/issues/10)"
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://domain.com:90/owner/repo/commit/222))"))
  );
});

test.serial("Accept a custom repository URL with git+ssh format and custom port", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    {
      cwd,
      options: { repositoryUrl: "git+ssh://git@domain.com:2222/owner/repo.git" },
      lastRelease,
      nextRelease,
      commits,
    }
  );

  t.regex(changelog, new RegExp(escape("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))"))
  );
});

test.serial("Accept a Bitbucket repository URL", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://bitbucket.org/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* **scope1:** First fix ([111](https://bitbucket.org/owner/repo/commits/111)), closes [#10](https://bitbucket.org/owner/repo/issue/10)"
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://bitbucket.org/owner/repo/commits/222))"))
  );
});

test.serial("Accept a Gitlab repository URL", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix\n\nclosed #10" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    {},
    { cwd, options: { repositoryUrl: "git+https://gitlab.com/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://gitlab.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* **scope1:** First fix ([111](https://gitlab.com/owner/repo/commit/111)), closes [#10](https://gitlab.com/owner/repo/issues/10)"
      )
    )
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://gitlab.com/owner/repo/commit/222))"))
  );
});

test.serial('Accept a "linkCompare" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    { linkCompare: false },
    { cwd, options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("# 2.0.0")));
  t.notRegex(changelog, new RegExp(escape("(https://bitbucket.org/owner/repo/compare/v1.0.0...v2.0.0)")));
});

test.serial('Accept a "linkReferences" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    { linkReferences: false },
    { cwd, options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix 111, closes #10")));
  t.regex(changelog, /### Features/);
  t.regex(changelog, new RegExp(escape("* **scope2:** Second feature 222")));
});

test.serial('Accept a "host" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    { host: "http://my-host:90" },
    { cwd, options: { repositoryUrl: "https://github.com/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(http://my-host:90/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](http://my-host:90/owner/repo/commit/111))")));
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](http://my-host:90/owner/repo/commit/222))"))
  );
});

test.serial('Accept a "commit" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "feat(scope2): Second feature" },
  ];
  const changelog = await generateNotes(
    { commit: "test-commits" },
    { cwd, options: { repositoryUrl: "https://github.com/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope1:** First fix ([111](https://github.com/owner/repo/test-commits/111))"))
  );
  t.regex(changelog, /### Features/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope2:** Second feature ([222](https://github.com/owner/repo/test-commits/222))"))
  );
});

test.serial('Accept an "issue" option', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [{ hash: "111", message: "fix(scope1): First fix\n\nresolve #10" }];
  const changelog = await generateNotes(
    { issue: "test-issues" },
    { cwd, options: { repositoryUrl: "https://github.com/owner/repo" }, lastRelease, nextRelease, commits }
  );

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(
      escape(
        "* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)"
      )
    )
  );
});

test.serial("Ignore malformatted commits and include valid ones", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "Feature => Invalid message" },
  ];
  const changelog = await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });

  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, /\* \*\*scope1:\*\* First fix/);
  t.notRegex(changelog, /### Features/);
  t.notRegex(changelog, /Feature => Invalid message/);
});

test.serial("Exclude commits if they have a matching revert commits", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "df012f1", message: "revert: feat(scope2): First feature\n\nThis reverts commit df012f2.\n" },
    { hash: "df012f2", message: "feat(scope2): First feature" },
    { hash: "df012f3", message: "fix(scope1): First fix" },
  ];
  const changelog = await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(
    changelog,
    new RegExp(escape("* **scope1:** First fix ([df012f3](https://github.com/owner/repo/commit/df012f3))"))
  );
  t.notRegex(changelog, /### Features/);
  t.notRegex(changelog, /Second feature/);
});

test.serial("Exclude commits with empty message", async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "fix(scope1): First fix" },
    { hash: "222", message: "" },
    { hash: "333", message: "  " },
  ];
  const changelog = await generateNotes({}, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits });

  t.regex(changelog, new RegExp(escape("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)")));
  t.regex(changelog, /### Bug Fixes/);
  t.regex(changelog, new RegExp(escape("* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))")));
  t.notRegex(changelog, /222/);
  t.notRegex(changelog, /333/);
});

test.serial('Throw error if "preset" doesn`t exist', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "Fix: First fix (fixes #123)" },
    { hash: "222", message: "Update: Second feature (fixes #456)" },
  ];
  await t.throwsAsync(
    generateNotes({ preset: "unknown-preset" }, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }),
    { code: "MODULE_NOT_FOUND" }
  );
});

test.serial('Throw error if "config" doesn`t exist', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "Fix: First fix (fixes #123)" },
    { hash: "222", message: "Update: Second feature (fixes #456)" },
  ];
  await t.throwsAsync(
    generateNotes({ config: "unknown-config" }, { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }),
    { code: "MODULE_NOT_FOUND" }
  );
});

test.serial('ReThrow error from "conventional-changelog"', async (t) => {
  const { generateNotes } = await import("../index.js");
  const commits = [
    { hash: "111", message: "Fix: First fix (fixes #123)" },
    { hash: "222", message: "Update: Second feature (fixes #456)" },
  ];

  await t.throwsAsync(
    generateNotes(
      {
        writerOpts: {
          transform() {
            throw new Error("Test error");
          },
        },
      },
      { cwd, options: { repositoryUrl }, lastRelease, nextRelease, commits }
    ),
    { message: "Test error" }
  );
});
