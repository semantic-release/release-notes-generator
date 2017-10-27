const {callbackify} = require('util');
const url = require('url');
const getStream = require('get-stream');
const intoStream = require('into-stream');
const hostedGitInfo = require('hosted-git-info');
const conventionalCommitsParser = require('conventional-commits-parser').sync;
const conventionalChangelogWriter = require('conventional-changelog-writer');
const loadChangelogConfig = require('./load/changelog-config');

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
 * @param {Object>} options.lastRelease last release with `gitHead` corresponding to the commit hash used to make the last release
 * @param {Object>} options.nextRelease next release with `gitHead` corresponding to the commit hash used to make the  release and the release `version`
 */
async function releaseNotesGenerator(
  pluginConfig,
  {pkg, commits, lastRelease: {gitHead: previousTag}, nextRelease: {gitHead: currentTag, version}}
) {
  const {parserOpts, writerOpts} = await loadChangelogConfig(pluginConfig);
  commits = commits.map(rawCommit =>
    Object.assign(rawCommit, conventionalCommitsParser(rawCommit.message, parserOpts))
  );
  const {default: protocol, domain: host, project: repository, user: owner} = hostedGitInfo.fromUrl(pkg.repository.url);
  const context = {
    version,
    host: url.format({protocol, host}),
    owner,
    repository,
    previousTag,
    currentTag,
    linkCompare: currentTag && previousTag,
    packageData: pkg,
  };

  return getStream(intoStream.obj(commits).pipe(conventionalChangelogWriter(context, writerOpts)));
}

module.exports = callbackify(releaseNotesGenerator);
