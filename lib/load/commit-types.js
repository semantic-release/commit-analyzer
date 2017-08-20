const importCwd = require('import-cwd');
const SemanticReleaseError = require('@semantic-release/error');
const RELEASE_TYPES = require('../default/release-types');

/**
 * Load and validate the `commitTypes` rules.
 * 
 * If `commitTypes` parameter is a `string` then load it as an external module with `require`.
 * Verifies that the loaded/parameter `commitTypes` is an `Array` and each element has a valid `release` attribute.
 * 
 * @param {string|Array} commitTypes a string to load an external module or an `Array` of rules.
 * @return {Array} the loaded and validated `commitTypes`.
 */
module.exports = ({commitTypes}) => {
  let loadedCommitTypes;

  if (commitTypes) {
    loadedCommitTypes = typeof commitTypes === 'string' ? importCwd(commitTypes) : commitTypes;

    if (!Array.isArray(loadedCommitTypes)) {
      throw new SemanticReleaseError(
        'Error in sr-commit-analyzer configuration: "commitTypes" must be an array of rules',
        'EINVALIDCONFIG'
      );
    }

    loadedCommitTypes.forEach(rule => {
      if (RELEASE_TYPES.indexOf(rule.release) === -1) {
        throw new SemanticReleaseError(
          `Error in sr-commit-analyzer configuration: "${rule.release}" is not a valid release type. Valid values are: ${JSON.stringify(
            RELEASE_TYPES
          )}`,
          'EINVALIDRELEASE'
        );
      }
    });
  }
  return loadedCommitTypes;
};
