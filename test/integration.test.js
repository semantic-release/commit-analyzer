import test from 'ava';
import {stub} from 'sinon';
import commitAnalyzer from '..';

test.beforeEach(t => {
  const log = stub();
  t.context.log = log;
  t.context.logger = {log};
});

test('Parse with "conventional-changelog-angular" by default', async t => {
  const commits = [{message: 'fix(scope1): First fix'}, {message: 'feat(scope2): Second feature'}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "preset" option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await commitAnalyzer({preset: 'eslint'}, {commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "config" option', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const releaseType = await commitAnalyzer(
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
    {message: '%%BUGFIX%% First fix (fixes #123)'},
    {message: '%%FEATURE%% Second feature (fixes #456)'},
  ];
  const releaseType = await commitAnalyzer(
    {parserOpts: {headerPattern: /^%%(.*?)%% (.*)$/, headerCorrespondence: ['tag', 'shortDesc']}},
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
  const commits = [{message: '%%fix%% First fix (fixes #123)'}, {message: '%%Update%% Second feature (fixes #456)'}];
  const releaseType = await commitAnalyzer(
    {
      config: 'conventional-changelog-eslint',
      parserOpts: {headerPattern: /^%%(.*?)%% (.*)$/, headerCorrespondence: ['type', 'shortDesc']},
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
  const releaseType = await commitAnalyzer(
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
  const releaseType = await commitAnalyzer({preset: 'eslint'}, {commits, logger: t.context.logger});

  t.is(releaseType, 'major');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'major'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'major'));
});

test('Return "patch" if there is only types set to "patch", using default releaseRules', async t => {
  const commits = [{message: 'fix: First fix (fixes #123)'}, {message: 'perf: perf improvement'}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Allow to use regex in "releaseRules" configuration', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await commitAnalyzer(
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
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, null);
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'no'));
});

test('Process rules in order and apply highest match', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await commitAnalyzer(
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
  const releaseType = await commitAnalyzer(
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
  const releaseType = await commitAnalyzer(
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
  const error = await t.throws(commitAnalyzer({preset: 'unknown-preset'}, {}));

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "releaseRules" is not an Array or a String', async t => {
  await t.throws(
    commitAnalyzer({releaseRules: {}}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "releaseRules" option reference a requierable module that is not an Array or a String', async t => {
  await t.throws(
    commitAnalyzer({releaseRules: './test/fixtures/release-rules-invalid'}, {}),
    /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/
  );
});

test('Throw error if "config" doesn`t exist', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  const error = await t.throws(commitAnalyzer({config: 'unknown-config'}, {commits, logger: t.context.logger}));

  t.is(error.code, 'MODULE_NOT_FOUND');
});

test('Throw error if "releaseRules" reference invalid commit type', async t => {
  await t.throws(
    commitAnalyzer({preset: 'eslint', releaseRules: [{tag: 'Update', release: 'invalid'}]}, {}),
    /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*\]/
  );
});

test('Re-Throw error from "conventional-changelog-parser"', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  await t.throws(commitAnalyzer({parserOpts: {headerPattern: '\\'}}, {commits, logger: t.context.logger}));
});

test('Correctly handle squash merges', async t => {
  const message =
    'Squashed commit of the following:\n' +
    '\n' +
    'commit 06cfb67026eecec2ad54fd39fc50cba9080d383c\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:21:50 2018 -0400\n' +
    '\n' +
    '    fix: More fixes\n' +
    '\n' +
    '    Blah blah blah.\n' +
    '\n' +
    '    Fixes #20\n' +
    '\n' +
    'commit b894885ae467975226e81080a35625d247796960\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:13:25 2018 -0400\n' +
    '\n' +
    '    feat: Add moar features!\n';

  const splitCommits = ['fix: More fixes\n\nBlah blah blah.\n\nFixes #20', 'feat: Add moar features!'];

  const commits = [{message}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', splitCommits[0]));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', splitCommits[1]));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Treat modified squash merges like regular commmit messages', async t => {
  const message =
    'fix: This is only a fix.\n' +
    '\n' +
    'commit 06cfb67026eecec2ad54fd39fc50cba9080d383c\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:21:50 2018 -0400\n' +
    '\n' +
    '    fix: More fixes\n' +
    '\n' +
    '    Blah blah blah.\n' +
    '\n' +
    '    Fixes #20\n' +
    '\n' +
    'commit b894885ae467975226e81080a35625d247796960\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:13:25 2018 -0400\n' +
    '\n' +
    '    feat: Add moar features!\n';

  const commits = [{message}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 1, 'patch'));
});

test('Treat modified squash merges with a BREAKING CHANGE as breaking', async t => {
  const message =
    'fix: This is only a fix.\n' +
    '\n' +
    'commit 06cfb67026eecec2ad54fd39fc50cba9080d383c\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:21:50 2018 -0400\n' +
    '\n' +
    '    fix: More fixes\n' +
    '\n' +
    '    Blah blah blah.\n' +
    '\n' +
    '    BREAKING CHANGE: Boom\n' +
    '\n' +
    'commit b894885ae467975226e81080a35625d247796960\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:13:25 2018 -0400\n' +
    '\n' +
    '    feat: Add moar features!\n';

  const commits = [{message}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, 'major');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'major'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 1, 'major'));
});

test('Handle broken squash merge like a regular commit', async t => {
  // This looks like a squash merge, but it's invalid because it doesn't
  // follow the "commit, author, date, indentend body" pattern.
  const message =
    'Squashed commit of the following:\n' +
    '\n' +
    'commit 06cfb67026eecec2ad54fd39fc50cba9080d383c\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n' +
    'Date:   Thu May 17 11:21:50 2018 -0400\n' +
    '\n' +
    '    fix: More fixes\n' +
    '\n' +
    '    Blah blah blah.\n' +
    '\n' +
    '    Fixes #20\n' +
    '\n' +
    'commit b894885ae467975226e81080a35625d247796960\n' +
    'Author: Jason Walton <fakeaddress@fake.com>\n';

  const commits = [{message}];
  const releaseType = await commitAnalyzer({}, {commits, logger: t.context.logger});

  t.is(releaseType, null);
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 1, 'no'));
});
