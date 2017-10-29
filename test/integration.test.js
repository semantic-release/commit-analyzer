import {promisify} from 'util';
import test from 'ava';
import {stub} from 'sinon';
import commitAnalyzer from '../lib/index';

test.beforeEach(t => {
  const log = stub();
  t.context.log = log;
  t.context.logger = {log};
});

test('Parse with "conventional-changelog-angular" by default', async t => {
  const commits = [{message: 'fix(scope1): First fix'}, {message: 'feat(scope2): Second feature'}];
  const releaseType = await promisify(commitAnalyzer)({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "preset" option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await promisify(commitAnalyzer)({preset: 'eslint'}, {commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "config" option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await promisify(commitAnalyzer)(
    {config: 'conventional-changelog-eslint'},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept a "parseOpts" object as option', async t => {
  const commits = [
    {message: '##BUGFIX## First fix (fixes #123)'},
    {message: '##FEATURE## Second feature (fixes #456)'},
  ];
  const releaseType = await promisify(commitAnalyzer)(
    {parserOpts: {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['tag', 'shortDesc']}},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept a partial "parseOpts" object as option', async t => {
  const commits = [{message: '##fix## First fix (fixes #123)'}, {message: '##Update## Second feature (fixes #456)'}];
  const releaseType = await promisify(commitAnalyzer)(
    {
      config: 'conventional-changelog-eslint',
      parserOpts: {headerPattern: /^##(.*?)## (.*)$/, headerCorrespondence: ['type', 'shortDesc']},
    },
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Accept a "releaseRules" option that reference a requierable module', async t => {
  const commits = [{message: 'fix(scope1): First fix'}, {message: 'feat(scope2): Second feature'}];
  const releaseType = await promisify(commitAnalyzer)(
    {releaseRules: './test/fixtures/release-rules'},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Return "major" if there is a breaking change, using default releaseRules', async t => {
  const commits = [
    {message: 'Fix: First fix (fixes #123)'},
    {message: 'Update: Second feature (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await promisify(commitAnalyzer)({preset: 'eslint'}, {commits, logger: t.context.logger});

  t.is(releaseType, 'major');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'major'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'major'));
});

test('Return "patch" if there is only types set to "patch", using default releaseRules', async t => {
  const commits = [{message: 'fix: First fix (fixes #123)'}, {message: 'perf: perf improvement'}];
  const releaseType = await promisify(commitAnalyzer)({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Allow to use regex in "releaseRules" configuration', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await promisify(commitAnalyzer)(
    {
      preset: 'eslint',
      releaseRules: [{tag: 'Chore', release: 'patch'}, {message: '/README/', release: 'minor'}],
    },
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Return "null" if no rule match', async t => {
  const commits = [{message: 'doc: doc update'}, {message: 'chore: Chore'}];
  const releaseType = await promisify(commitAnalyzer)({}, {commits, logger: t.context.logger});

  t.is(releaseType, null);
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'no'));
});

test('Process rules in order and apply highest match', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await promisify(commitAnalyzer)(
    {preset: 'eslint', releaseRules: [{tag: 'Chore', release: 'minor'}, {tag: 'Chore', release: 'patch'}]},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Process rules in order and apply highest match from config even if default has an higher match', async t => {
  const commits = [
    {message: 'Chore: First chore (fixes #123)'},
    {message: 'Docs: update README (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await promisify(commitAnalyzer)(
    {preset: 'eslint', releaseRules: [{tag: 'Chore', release: 'patch'}, {breaking: true, release: 'minor'}]},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Use default "releaseRules" if none of provided match', async t => {
  const commits = [{message: 'Chore: First chore'}, {message: 'Update: new feature'}];
  const releaseType = await promisify(commitAnalyzer)(
    {preset: 'eslint', releaseRules: [{tag: 'Chore', release: 'patch'}]},
    {commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Throw error if "preset" doesn`t exist', async t => {
  const error = await t.throws(promisify(commitAnalyzer)({preset: 'unknown-preset'}, {}));

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "releaseRules" is not an Array or a String', async t => {
  await t.throws(
    promisify(commitAnalyzer)({releaseRules: {}}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "releaseRules" option reference a requierable module that is not an Array or a String', async t => {
  await t.throws(
    promisify(commitAnalyzer)({releaseRules: './test/fixtures/release-rules-invalid'}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "config" doesn`t exist', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const error = await t.throws(
    promisify(commitAnalyzer)({config: 'unknown-config'}, {commits, logger: t.context.logger})
  );

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "releaseRules" reference invalid commit type', async t => {
  await t.throws(
    promisify(commitAnalyzer)({preset: 'eslint', releaseRules: [{tag: 'Update', release: 'invalid'}]}, {}),
    /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );
});

test('Re-Throw error from "conventional-changelog-parser"', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  await t.throws(promisify(commitAnalyzer)({parserOpts: {headerPattern: '\\'}}, {commits, logger: t.context.logger}));
});
