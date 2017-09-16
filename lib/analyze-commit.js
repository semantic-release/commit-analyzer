const {isMatchWith, isRegExp, omit} = require('lodash');
const RELEASE_TYPES = require('./default/release-types');
const compareReleaseTypes = require('./compare-release-types');

/**
 * Find all the rules matching and return the highest release type of the matching rules.
 *
 * @param {Array} releaseRules the rules to match the commit against.
 * @param {Commit} commit a parsed commit.
 * @return {string} the highest release type of the matching rules or `undefined` if no rule match the commit.
 */
module.exports = (releaseRules, commit) => {
  let releaseType;

  releaseRules
    .filter(
      rule =>
        (!rule.breaking || (commit.notes && commit.notes.length > 0)) &&
        isMatchWith(
          commit,
          omit(rule, ['release', 'breaking']),
          (obj, src) =>
            /^\/.*\/$/.test(src) || isRegExp(src) ? new RegExp(/^\/.*\/$/.exec(src)[1]).test(obj) : undefined
        )
    )
    .every(match => {
      if (match && compareReleaseTypes(releaseType, match.release)) {
        releaseType = match.release;
        if (releaseType === RELEASE_TYPES[0]) {
          return false;
        }
      }
      return true;
    });

  return releaseType;
};
