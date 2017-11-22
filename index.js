const {callbackify} = require('util');
const url = require('url');
const getStream = require('get-stream');
const intoStream = require('into-stream');
const hostedGitInfo = require('hosted-git-info');
const conventionalCommitsParser = require('conventional-commits-parser').sync;
const conventionalChangelogWriter = require('conventional-changelog-writer');
const debug = require('debug')('semantic-release:release-notes-generator');
const loadChangelogConfig = require('./lib/load-changelog-config');

/**
 * Generate the changelog for all the commits since the last release.
 *
 * @param {Object} [pluginConfig={}] semantic-release configuration
 * @param {string} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {string} pluginConfig.config requierable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} pluginConfig.writerOpts additional `conventional-changelog-writer` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} options semantic-release options
 * @param {Object} options.pkg normalized `package.json`
 * @param {Array<Object>} options.commits array of commits, each containing `hash` and `message`
 * @param {Object>} options.lastRelease last release with `gitHead` corresponding to the commit hash used to make the last release and `gitTag` corresponding to the git tag associated with `gitHead`
 * @param {Object>} options.nextRelease next release with `gitHead` corresponding to the commit hash used to make the  release, the release `version` and `gitTag` corresponding to the git tag associated with `gitHead`
 */
async function releaseNotesGenerator(pluginConfig, {pkg, commits, lastRelease, nextRelease}) {
  const {parserOpts, writerOpts} = await loadChangelogConfig(pluginConfig);
  commits = commits.map(rawCommit =>
    Object.assign(rawCommit, conventionalCommitsParser(rawCommit.message, parserOpts))
  );
  const {default: protocol, domain: host, project: repository, user: owner} = hostedGitInfo.fromUrl(pkg.repository.url);
  const previousTag = lastRelease.gitTag || lastRelease.gitHead;
  const currentTag = nextRelease.gitTag || nextRelease.gitHead;
  const context = {
    version: nextRelease.version,
    host: url.format({protocol, host}),
    owner,
    repository,
    previousTag,
    currentTag,
    linkCompare: currentTag && previousTag,
    packageData: pkg,
  };

  debug('version: %o', nextRelease.version);
  debug('host: %o', host);
  debug('owner: %o', owner);
  debug('repository: %o', repository);
  debug('previousTag: %o', previousTag);
  debug('currentTag: %o', currentTag);

  return getStream(intoStream.obj(commits).pipe(conventionalChangelogWriter(context, writerOpts)));
}

module.exports = callbackify(releaseNotesGenerator);
