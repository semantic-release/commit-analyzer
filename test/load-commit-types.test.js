import test from 'ava';
import SemanticReleaseError from '@semantic-release/error';
import loadCommitTypes from './../lib/load/commit-types';
import testCommitTypes from './fixtures/commit-types';

test('Accept a "commitTypes" option', t => {
  const releaseTypes = loadCommitTypes({commitTypes: testCommitTypes});

  t.deepEqual(releaseTypes, testCommitTypes);
});

test('Accept a "commitTypes" option that reference a requierable module', t => {
  const releaseTypes = loadCommitTypes({commitTypes: './test/fixtures/commit-types'});

  t.deepEqual(releaseTypes, testCommitTypes);
});

test('Return undefined if "commitTypes" not set', t => {
  const releaseTypes = loadCommitTypes({});

  t.is(releaseTypes, undefined);
});

test('Throw "SemanticReleaseError" if "commitTypes" reference invalid commit type', t => {
  const error = t.throws(
    () => loadCommitTypes({commitTypes: [{tag: 'Update', release: 'invalid'}]}),
    /Error in sr-commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );

  t.is(error.code, 'EINVALIDRELEASE');
  t.true(error instanceof SemanticReleaseError);
});

test('Throw "SemanticReleaseError" if "commitTypes" is not an Array or a String', t => {
  const error = t.throws(
    () => loadCommitTypes({commitTypes: {}}, {}),
    /Error in sr-commit-analyzer configuration: "commitTypes" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});

test('Throw "SemanticReleaseError" if "commitTypes" option reference a requierable module that is not an Array or a String', t => {
  const error = t.throws(
    () => loadCommitTypes({commitTypes: './test/fixtures/commit-types-invalid'}),
    /Error in sr-commit-analyzer configuration: "commitTypes" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});
