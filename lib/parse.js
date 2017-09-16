const SemanticReleaseError = require('@semantic-release/error');
const parser = require('conventional-commits-parser').sync;

/**
 * Parse a raw commit.
 *
 * @method parse
 * @param {[type]} rawCommit the raw commit message.
 * @param {[type]} config the parser configuration.
 * @return {Commit} the parsed commit.
 * @throws {SemanticReleaseError} if the commit cannot be parsed.
 */
module.exports = (rawCommit, config) => {
  try {
    return parser(rawCommit, config);
  } catch (err) {
    throw new SemanticReleaseError(`Error in conventional-changelog-parser: ${err.message}`, err.code);
  }
};
