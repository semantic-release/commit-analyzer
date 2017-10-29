import test from 'ava';
import loadReleaseRules from './../lib/load/release-rules';
import testReleaseRules from './fixtures/release-rules';

test('Accept a "releaseRules" option', t => {
  const releaseRules = loadReleaseRules({releaseRules: testReleaseRules});

  t.deepEqual(releaseRules, testReleaseRules);
});

test('Accept a "releaseRules" option that reference a requierable module', t => {
  const releaseRules = loadReleaseRules({releaseRules: './test/fixtures/release-rules'});

  t.deepEqual(releaseRules, testReleaseRules);
});

test('Return undefined if "releaseRules" not set', t => {
  const releaseRules = loadReleaseRules({});

  t.is(releaseRules, undefined);
});

test('Throw error if "releaseRules" reference invalid commit type', t => {
  t.throws(
    () => loadReleaseRules({releaseRules: [{tag: 'Update', release: 'invalid'}]}),
    /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );
});

test('Throw error if a rule in "releaseRules" does not have a release type', t => {
  t.throws(
    () => loadReleaseRules({releaseRules: [{tag: 'Update'}]}),
    /Error in commit-analyzer configuration: rules must be an object with a "release" property/
  );
});

test('Throw error if "releaseRules" is not an Array or a String', t => {
  t.throws(
    () => loadReleaseRules({releaseRules: {}}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "releaseRules" option reference a requierable module that is not an Array or a String', t => {
  t.throws(
    () => loadReleaseRules({releaseRules: './test/fixtures/release-rules-invalid'}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "releaseRules" contains an undefined rule', t => {
  t.throws(
    () => loadReleaseRules({releaseRules: [{type: 'feat', release: 'minor'}, undefined]}, {}),
    /Error in commit-analyzer configuration: rules must be an object with a "release" property/
  );
});
