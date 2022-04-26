const importFrom = require('import-from');
const RELEASE_SCOPES = require('./default-release-scopes');

/**
 * Load and validate the `releaseScopes` rules.
 *
 * If `releaseScopes` parameter is a `string` then load it as an external module with `require`.
 * Verifies that the loaded/parameter `releaseScopes` is an `Array` and each element has a valid `release` attribute.
 *
 * @param {Object} pluginConfig The plugin configuration.
 * @param {String|Array} pluginConfig.releaseScopes A `String` to load an external module or an `Array` of rules.
 * @param {Object} context The semantic-release context.
 * @param {String} context.cwd The current working directory.
 *
 * @return {Array} the loaded and validated `releaseScopes`.
 */
module.exports = ({releaseScopes}, {cwd}) => {
  let loadedReleaseScopes;

  if (releaseScopes) {
    loadedReleaseScopes =
      typeof releaseScopes === 'string'
        ? importFrom.silent(__dirname, releaseScopes) || importFrom(cwd, releaseScopes)
        : releaseScopes;

    if (!Array.isArray(loadedReleaseScopes)) {
      throw new TypeError('Error in commit-analyzer configuration: "releaseScopes" must be an array of scopes');
    }
  } else {
    loadedReleaseScopes = RELEASE_SCOPES;
  }

  return loadedReleaseScopes;
};
