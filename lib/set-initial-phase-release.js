const RELEASE_TYPES = require('./default-release-types');

/**
 * Set the release type when in initial development phase.
 * The major version will not be increased.
 *
 * @param {string} releaseType the release type to convert from.
 * @param {Boolean} [isInitialPhase] indicates whether it is still in the initial development phase.
 * @return {string} the converted release type set to a lower type.
 */
module.exports = (releaseType, isInitialPhase = false) =>
  isInitialPhase === true && RELEASE_TYPES.indexOf(releaseType) < 4
    ? RELEASE_TYPES[RELEASE_TYPES.indexOf(releaseType) + 2]
    : releaseType;
