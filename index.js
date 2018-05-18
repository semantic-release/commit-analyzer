const parser = require('conventional-commits-parser').sync;
const debug = require('debug')('semantic-release:commit-analyzer');
const loadParserConfig = require('./lib/load-parser-config');
const loadReleaseRules = require('./lib/load-release-rules');
const analyzeCommit = require('./lib/analyze-commit');
const compareReleaseTypes = require('./lib/compare-release-types');
const RELEASE_TYPES = require('./lib/default-release-types');
const DEFAULT_RELEASE_RULES = require('./lib/default-release-rules');
const parseSquashMerge = require('./lib/squash-merge-parser.js');
/**
 * Determine the type of release to create based on a list of commits.
 *
 * @param {Object} [pluginConfig={}] semantic-release configuration
 * @param {String} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {String} pluginConfig.config requierable npm package with a custom conventional-changelog preset
 * @param {String|Array} pluginConfig.releaseRules a string to load an external module or an `Array` of rules.
 * @param {Object} pluginConfig.parserOpts additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} options semantic-release options
 * @param {Array} options.commits array of commits
 *
 * @returns {String|null} the type of release to create based on the list of commits or `null` if no release has to be done.
 */
async function commitAnalyzer(pluginConfig, {commits, logger}) {
  const releaseRules = loadReleaseRules(pluginConfig);
  const config = await loadParserConfig(pluginConfig);
  let releaseType = null;

  const unsquashedCommits = commits.reduce((commits, commit) => {
    const unsquashed = parseSquashMerge(commit);
    if (unsquashed) {
      commits.push(...unsquashed);
    } else {
      commits.push(commit);
    }
    return commits;
  }, []);

  unsquashedCommits.every(rawCommit => {
    const commit = parser(rawCommit.message, config);
    const squashed = rawCommit.squash ? 'squashed ' : '';
    logger.log(`Analyzing ${squashed}commit: %s`, rawCommit.message);
    let commitReleaseType;

    // Determine release type based on custom releaseRules
    if (releaseRules) {
      debug('Analyzing with custom rules');
      commitReleaseType = analyzeCommit(releaseRules, commit);
      if (commitReleaseType) {
        logger.log('The release type for the commit is %s', commitReleaseType);
      }
    }
    // If no custom releaseRules or none matched the commit, try with default releaseRules
    if (!commitReleaseType) {
      debug('Analyzing with default rules');
      commitReleaseType = analyzeCommit(DEFAULT_RELEASE_RULES, commit);
      if (commitReleaseType) {
        logger.log('The release type for the commit is %s', commitReleaseType);
      } else {
        logger.log('The commit should not trigger a release');
      }
    }
    // Set releaseType if commit's release type is higher
    if (commitReleaseType && compareReleaseTypes(releaseType, commitReleaseType)) {
      releaseType = commitReleaseType;
    }

    // Break loop if releaseType is the highest
    if (releaseType === RELEASE_TYPES[0]) {
      return false;
    }
    return true;
  });
  logger.log('Analysis of %s commits complete: %s release', unsquashedCommits.length, releaseType || 'no');

  return releaseType;
}

module.exports = commitAnalyzer;
