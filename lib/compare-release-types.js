const RELEASE_TYPES = require('./default-release-types');

/**
 * Test if a release type is of higher level than a given one.
 *
 * @param {String} currentReleaseType the current release type.
 * @param {String|False} releaseType the release type to compare with.
 * @return {Boolean} true when `releaseType` is higher than `currentReleaseType`, or if `currentReleaseType` is falsy, or if `releaseType`is `false`
 */
module.exports = (currentReleaseType, releaseType) =>
  !currentReleaseType ||
  releaseType === false ||
  RELEASE_TYPES.indexOf(releaseType) < RELEASE_TYPES.indexOf(currentReleaseType);
