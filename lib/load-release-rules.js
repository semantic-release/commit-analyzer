const importFrom = require('import-from');
const RELEASE_TYPES = require('./default-release-types');

/**
 * Load and validate the `releaseRules` rules.
 *
 * If `releaseRules` parameter is a `string` then load it as an external module with `require`.
 * Verifies that the loaded/parameter `releaseRules` is an `Array` and each element has a valid `release` attribute.
 *
 * @param {string|Array} releaseRules a string to load an external module or an `Array` of rules.
 * @return {Array} the loaded and validated `releaseRules`.
 */
module.exports = ({releaseRules}) => {
  let loadedReleaseRules;

  if (releaseRules) {
    loadedReleaseRules =
      typeof releaseRules === 'string'
        ? importFrom.silent(__dirname, releaseRules) || importFrom(process.cwd(), releaseRules)
        : releaseRules;

    if (!Array.isArray(loadedReleaseRules)) {
      throw new TypeError('Error in commit-analyzer configuration: "releaseRules" must be an array of rules');
    }

    loadedReleaseRules.forEach(rule => {
      if (!rule || !rule.release) {
        throw new Error('Error in commit-analyzer configuration: rules must be an object with a "release" property');
      } else if (RELEASE_TYPES.indexOf(rule.release) === -1) {
        throw new Error(
          `Error in commit-analyzer configuration: "${
            rule.release
          }" is not a valid release type. Valid values are: ${JSON.stringify(RELEASE_TYPES)}`
        );
      }
    });
  }
  return loadedReleaseRules;
};
