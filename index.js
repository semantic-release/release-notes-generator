const url = require('url');
const {find} = require('lodash');
const getStream = require('get-stream');
const intoStream = require('into-stream');
const gitUrlParse = require('git-url-parse');
const conventionalCommitsParser = require('conventional-commits-parser').sync;
const conventionalChangelogWriter = require('conventional-changelog-writer');
const debug = require('debug')('semantic-release:release-notes-generator');
const loadChangelogConfig = require('./lib/load-changelog-config');
const HOSTS_CONFIG = require('./lib/hosts-config');

/**
 * Generate the changelog for all the commits since the last release.
 *
 * @param {Object} [pluginConfig={}] semantic-release configuration
 * @param {string} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {string} pluginConfig.config requierable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} pluginConfig.writerOpts additional `conventional-changelog-writer` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} options semantic-release options
 * @param {Array<Object>} options.commits array of commits, each containing `hash` and `message`
 * @param {Object>} options.lastRelease last release with `gitHead` corresponding to the commit hash used to make the last release and `gitTag` corresponding to the git tag associated with `gitHead`
 * @param {Object>} options.nextRelease next release with `gitHead` corresponding to the commit hash used to make the  release, the release `version` and `gitTag` corresponding to the git tag associated with `gitHead`
 * @param {Object} options.options.repositoryUrl git repository URL
 */
async function releaseNotesGenerator(pluginConfig, {commits, lastRelease, nextRelease, options: {repositoryUrl}}) {
  const {parserOpts, writerOpts} = await loadChangelogConfig(pluginConfig);

  const {resource: hostname, port, name: repository, owner, protocols} = gitUrlParse(repositoryUrl);
  const protocol = protocols.includes('https') ? 'https' : protocols.includes('http') ? 'http' : 'https';

  const {issue, commit, referenceActions, issuePrefixes} =
    find(HOSTS_CONFIG, conf => conf.hostname === hostname) || HOSTS_CONFIG.default;
  const parsedCommits = commits.map(rawCommit => ({
    ...rawCommit,
    ...conventionalCommitsParser(rawCommit.message, {...parserOpts, referenceActions, issuePrefixes}),
  }));

  const previousTag = lastRelease.gitTag || lastRelease.gitHead;
  const currentTag = nextRelease.gitTag || nextRelease.gitHead;
  const context = {
    version: nextRelease.version,
    host: url.format({protocol, hostname, port}),
    owner,
    repository,
    previousTag,
    currentTag,
    linkCompare: currentTag && previousTag,
    issue,
    commit,
  };

  debug('version: %o', nextRelease.version);
  debug('host: %o', hostname);
  debug('owner: %o', owner);
  debug('repository: %o', repository);
  debug('previousTag: %o', previousTag);
  debug('currentTag: %o', currentTag);

  return getStream(intoStream.obj(parsedCommits).pipe(conventionalChangelogWriter(context, writerOpts)));
}

module.exports = releaseNotesGenerator;
