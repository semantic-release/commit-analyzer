import test from 'ava';
import pify from 'pify';
import SemanticReleaseError from '@semantic-release/error';
import commitAnalyzer from '../lib/index';

test('Parse with "conventional-changelog-angular" by default', async t => {
  const commits = [{message: 'fix(scope1): First fix'}, {message: 'feat(scope2): Second feature'}];
  const releaseType = await pify(commitAnalyzer)({}, {commits});

  t.is(releaseType, 'minor');
});

test('Accept preset option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await pify(commitAnalyzer)({preset: 'eslint'}, {commits});

  t.is(releaseType, 'minor');
});

test('Accept config option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await pify(commitAnalyzer)({config: 'conventional-changelog-eslint'}, {commits});

  t.is(releaseType, 'minor');
});

test('Accept a parseOpts object as option', async t => {
  const commits = [
    {message: '##BUGFIX## First fix (fixes #123)'},
    {message: '##FEATURE## Second feature (fixes #456)'},
  ];
  const releaseType = await pify(commitAnalyzer)(
    {parserOpts: {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'shortDesc']}},
    {commits}
  );

  t.is(releaseType, 'minor');
});

test('Accept a partial parseOpts object as option', async t => {
  const commits = [{message: '##fix## First fix (fixes #123)'}, {message: '##Update## Second feature (fixes #456)'}];
  const releaseType = await pify(commitAnalyzer)(
    {
      config: 'conventional-changelog-eslint',
      parserOpts: {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['type', 'shortDesc']},
    },
    {commits}
  );

  t.is(releaseType, 'patch');
});

test('Accept a "commitTypes" option that reference a requierable module', async t => {
  const commits = [{message: 'fix(scope1): First fix'}, {message: 'feat(scope2): Second feature'}];
  const releaseType = await pify(commitAnalyzer)({commitTypes: './test/fixtures/commit-types'}, {commits});

  t.is(releaseType, 'minor');
});

test('Return "major" if there is a breaking change, using default commitTypes', async t => {
  const commits = [
    {message: 'Fix: First fix (fixes #123)'},
    {message: 'Update: Second feature (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await pify(commitAnalyzer)({preset: 'eslint'}, {commits});

  t.is(releaseType, 'major');
});

test('Return "patch" if there is only types set to "patch", using default commitTypes', async t => {
  const commits = [{message: 'fix: First fix (fixes #123)'}, {message: 'perf: perf improvement'}];
  const releaseType = await pify(commitAnalyzer)({}, {commits});

  t.is(releaseType, 'patch');
});

test('Allow to use regex in commitTypes configuration', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await pify(commitAnalyzer)(
    {
      preset: 'eslint',
      commitTypes: [{tag: 'Chore', release: 'patch'}, {message: '/README/', release: 'minor'}],
    },
    {commits}
  );

  t.is(releaseType, 'minor');
});

test('Return null if no rule match', async t => {
  const commits = [{message: 'doc: doc update'}, {message: 'chore: Chore'}];
  const releaseType = await pify(commitAnalyzer)({}, {commits});

  t.is(releaseType, null);
});

test('Process rules in order and apply highest match', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await pify(commitAnalyzer)(
    {preset: 'eslint', commitTypes: [{tag: 'Chore', release: 'minor'}, {tag: 'Chore', release: 'patch'}]},
    {commits}
  );

  t.is(releaseType, 'minor');
});

test('Process rules in order and apply highest match from config even if default has an higher match', async t => {
  const commits = [
    {message: 'Chore: First chore (fixes #123)'},
    {message: 'Docs: update README (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await pify(commitAnalyzer)(
    {preset: 'eslint', commitTypes: [{tag: 'Chore', release: 'patch'}, {breaking: true, release: 'minor'}]},
    {commits}
  );

  t.is(releaseType, 'minor');
});

test('Use default commitTypes if none of provided match', async t => {
  const commits = [{message: 'Chore: First chore'}, {message: 'Update: new feature'}];
  const releaseType = await pify(commitAnalyzer)(
    {preset: 'eslint', commitTypes: [{tag: 'Chore', release: 'patch'}]},
    {commits}
  );

  t.is(releaseType, 'minor');
});

test('Throw SemanticReleaseError if "preset" doesn`t exist', async t => {
  const error = await t.throws(
    pify(commitAnalyzer)({preset: 'unknown-preset'}, {}),
    /Preset: "unknown-preset" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw SemanticReleaseError if "commitTypes" is not an Array or a String', async t => {
  const error = await t.throws(
    pify(commitAnalyzer)({commitTypes: {}}, {}),
    /Error in sr-commit-analyzer configuration: "commitTypes" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});

test('Throw SemanticReleaseError if "commitTypes" commitTypes option reference a requierable module that is not an Array or a String', async t => {
  const error = await t.throws(
    pify(commitAnalyzer)({commitTypes: './test/fixtures/commit-types-invalid'}, {}),
    /Error in sr-commit-analyzer configuration: "commitTypes" must be an array of rules/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'EINVALIDCONFIG');
});

test('Throw SemanticReleaseError if "config" doesn`t exist', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const error = await t.throws(
    pify(commitAnalyzer)({config: 'unknown-config'}, {commits}),
    /Config: "unknown-config" does not exist:/
  );

  t.true(error instanceof SemanticReleaseError);
  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw SemanticReleaseError if "commitTypes" reference invalid commit type', async t => {
  const error = await t.throws(
    pify(commitAnalyzer)({preset: 'eslint', commitTypes: [{tag: 'Update', release: 'invalid'}]}, {}),
    /Error in sr-commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );

  t.is(error.code, 'EINVALIDRELEASE');
  t.true(error instanceof SemanticReleaseError);
});

test('Handle error in "conventional-changelog-parser" and wrap in SemanticReleaseError', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const error = await t.throws(
    pify(commitAnalyzer)({parserOpts: {headerPattern: '\\'}}, {commits}),
    /Error in conventional-changelog-parser: Invalid regular expression:/
  );

  t.true(error instanceof SemanticReleaseError);
});
