const url = require('url');
const {find} = require('lodash');
const getStream = require('get-stream');
const intoStream = require('into-stream');
const gitUrlParse = require('git-url-parse');
const parser = require('conventional-commits-parser').sync;
const writer = require('conventional-changelog-writer');
const filter = require('conventional-commits-filter');
const debug = require('debug')('semantic-release:release-notes-generator');
const loadChangelogConfig = require('./lib/load-changelog-config');
const HOSTS_CONFIG = require('./lib/hosts-config');

/**
 * Generate the changelog for all the commits in `options.commits`.
 *
 * @param {Object} [pluginConfig={}] semantic-release configuration.
 * @param {String} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint').
 * @param {String} pluginConfig.config requierable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} pluginConfig.writerOpts additional `conventional-changelog-writer` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} options semantic-release options.
 * @param {Array<Object>} options.commits array of commits, each containing `hash` and `message`.
 * @param {Object} options.lastRelease last release with `gitHead` corresponding to the commit hash used to make the last release and `gitTag` corresponding to the git tag associated with `gitHead`.
 * @param {Object} options.nextRelease next release with `gitHead` corresponding to the commit hash used to make the  release, the release `version` and `gitTag` corresponding to the git tag associated with `gitHead`.
 * @param {Object} options.options.repositoryUrl git repository URL.
 *
 * @returns {String} the changelog for all the commits in `options.commits`.
 */
async function releaseNotesGenerator(pluginConfig, {commits, lastRelease, nextRelease, options: {repositoryUrl}}) {
  const {parserOpts, writerOpts} = await loadChangelogConfig(pluginConfig);

  const {resource: hostname, port, name: repository, owner, protocols} = gitUrlParse(repositoryUrl);
  const protocol = protocols.includes('https') ? 'https' : protocols.includes('http') ? 'http' : 'https';

  const {issue, commit, referenceActions, issuePrefixes} =
    find(HOSTS_CONFIG, conf => conf.hostname === hostname) || HOSTS_CONFIG.default;
  const parsedCommits = filter(
    commits.map(rawCommit => ({
      ...rawCommit,
      ...parser(rawCommit.message, {referenceActions, issuePrefixes, ...parserOpts}),
    }))
  );
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

  return getStream(intoStream.obj(parsedCommits).pipe(writer(context, writerOpts)));
}

module.exports = releaseNotesGenerator;
