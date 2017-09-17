import test from 'ava';
import SemanticReleaseError from '@semantic-release/error';
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

test('Throw "SemanticReleaseError" if "releaseRules" reference invalid commit type', t => {
  const error = t.throws(
    () => loadReleaseRules({releaseRules: [{tag: 'Update', release: 'invalid'}]}),
    /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );

  t.is(error.code, 'EINVALIDRELEASE');
  t.true(error instanceof SemanticReleaseError);
});

test('Throw "SemanticReleaseError" if "releaseRules" is not an Array or a String', t => {
  const error = t.throws(
    () => loadReleaseRules({releaseRules: {}}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});

test('Throw "SemanticReleaseError" if "releaseRules" option reference a requierable module that is not an Array or a String', t => {
  const error = t.throws(
    () => loadReleaseRules({releaseRules: './test/fixtures/release-rules-invalid'}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});
