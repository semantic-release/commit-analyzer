const test = require('ava');
const {stub} = require('sinon');
const {analyzeCommits} = require('..');

const cwd = process.cwd();

test.beforeEach(t => {
  const log = stub();
  t.context.log = log;
  t.context.logger = {log};
});

test('Return "patch" if the branch option contains "release/monthly"', async t => {
  const commits = [
    {hash: '123', message: 'fix(scope1): First fix'},
    {hash: '456', message: 'feat(scope2): Second feature'},
  ];
  const releaseType = await analyzeCommits({branch: 'release/monthly-v2'}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
});

test('Parse with "conventional-changelog-angular" by default', async t => {
  const commits = [
    {hash: '123', message: 'fix(scope1): First fix'},
    {hash: '456', message: 'feat(scope2): Second feature'},
  ];
  const releaseType = await analyzeCommits({}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "preset" option', async t => {
  const commits = [
    {hash: '123', message: 'Fix: First fix (fixes #123)'},
    {hash: '456', message: 'Update: Second feature (fixes #456)'},
  ];
  const releaseType = await analyzeCommits({preset: 'eslint'}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept "config" option', async t => {
  const commits = [
    {hash: '123', message: 'Fix: First fix (fixes #123)'},
    {hash: '456', message: 'Update: Second feature (fixes #456)'},
  ];
  const releaseType = await analyzeCommits(
    {config: 'conventional-changelog-eslint'},
    {cwd, commits, logger: t.context.logger}
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
    {hash: '123', message: '%%BUGFIX%% First fix (fixes #123)'},
    {hash: '456', message: '%%FEATURE%% Second feature (fixes #456)'},
  ];
  const releaseType = await analyzeCommits(
    {parserOpts: {headerPattern: /^%%(?<type>.*?)%% (?<subject>.*)$/, headerCorrespondence: ['tag', 'shortDesc']}},
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Accept a partial "parseOpts" object as option', async t => {
  const commits = [
    {hash: '123', message: '%%fix%% First fix (fixes #123)'},
    {hash: '456', message: '%%Update%% Second feature (fixes #456)'},
  ];
  const releaseType = await analyzeCommits(
    {
      config: 'conventional-changelog-eslint',
      parserOpts: {headerPattern: /^%%(?<type>.*?)%% (?<subject>.*)$/, headerCorrespondence: ['type', 'shortDesc']},
    },
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Exclude commits if they have a matching revert commits', async t => {
  const commits = [
    {hash: '123', message: 'feat(scope): First feature'},
    {hash: '456', message: 'revert: feat(scope): First feature\n\nThis reverts commit 123.\n'},
    {message: 'fix(scope): First fix'},
  ];
  const releaseType = await analyzeCommits({}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[2].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 3, 'patch'));
});

test('Accept a "releaseRules" option that reference a requirable module', async t => {
  const commits = [
    {hash: '123', message: 'fix(scope1): First fix'},
    {hash: '456', message: 'feat(scope2): Second feature'},
  ];
  const releaseType = await analyzeCommits(
    {releaseRules: './test/fixtures/release-rules'},
    {cwd, commits, logger: t.context.logger}
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
    {hash: '123', message: 'Fix: First fix (fixes #123)'},
    {hash: '456', message: 'Update: Second feature (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await analyzeCommits({preset: 'eslint'}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'major');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'major'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'major'));
});

test('Return "major" if there is a "conventionalcommits" breaking change, using default releaseRules', async t => {
  const commits = [
    {hash: '123', message: 'fix: First fix'},
    {hash: '456', message: 'feat!: Breaking change feature'},
  ];
  const releaseType = await analyzeCommits({preset: 'conventionalcommits'}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'major');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'major'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'major'));
});

test('Return "patch" if there is only types set to "patch", using default releaseRules', async t => {
  const commits = [
    {hash: '123', message: 'fix: First fix (fixes #123)'},
    {hash: '456', message: 'perf: perf improvement'},
  ];
  const releaseType = await analyzeCommits({}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Allow to use glob in "releaseRules" configuration', async t => {
  const commits = [{message: 'Chore: First chore (fixes #123)'}, {message: 'Docs: update README (fixes #456)'}];
  const releaseType = await analyzeCommits(
    {
      preset: 'eslint',
      releaseRules: [
        {tag: 'Chore', release: 'patch'},
        {message: '*README*', release: 'minor'},
      ],
    },
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Return "null" if no rule match', async t => {
  const commits = [
    {hash: '123', message: 'doc: doc update'},
    {hash: '456', message: 'chore: Chore'},
  ];
  const releaseType = await analyzeCommits({}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, null);
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'no'));
});

test('Process rules in order and apply highest match', async t => {
  const commits = [
    {hash: '123', message: 'Chore: First chore (fixes #123)'},
    {hash: '456', message: 'Docs: update README (fixes #456)'},
  ];
  const releaseType = await analyzeCommits(
    {
      preset: 'eslint',
      releaseRules: [
        {tag: 'Chore', release: 'minor'},
        {tag: 'Chore', release: 'patch'},
      ],
    },
    {cwd, commits, logger: t.context.logger}
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
    {hash: '123', message: 'Chore: First chore (fixes #123)'},
    {hash: '456', message: 'Docs: update README (fixes #456) \n\n BREAKING CHANGE: break something'},
  ];
  const releaseType = await analyzeCommits(
    {
      preset: 'eslint',
      releaseRules: [
        {tag: 'Chore', release: 'patch'},
        {breaking: true, release: 'minor'},
      ],
    },
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Allow to overwrite default "releaseRules" with "false"', async t => {
  const commits = [
    {hash: '123', message: 'chore: First chore'},
    {hash: '456', message: 'feat: new feature'},
  ];
  const releaseType = await analyzeCommits(
    {preset: 'angular', releaseRules: [{type: 'feat', release: false}]},
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, null);
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'no'));
});

test('Commits with an associated custom release type have higher priority than commits with release "false"', async t => {
  const commits = [
    {hash: '123', message: 'feat: Feature to skip'},
    {hash: '456', message: 'docs: update README'},
  ];
  const releaseType = await analyzeCommits(
    {
      preset: 'angular',
      releaseRules: [
        {type: 'feat', release: false},
        {type: 'docs', release: 'patch'},
      ],
    },
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Commits with an associated default release type have higher priority than commits with release "false"', async t => {
  const commits = [
    {hash: '123', message: 'feat: new feature'},
    {hash: '456', message: 'fix: new Fix'},
  ];
  const releaseType = await analyzeCommits(
    {preset: 'angular', releaseRules: [{type: 'feat', release: false}]},
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'patch');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The commit should not trigger a release'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'patch'));
});

test('Use default "releaseRules" if none of provided match', async t => {
  const commits = [
    {hash: '123', message: 'Chore: First chore'},
    {hash: '456', message: 'Update: new feature'},
  ];
  const releaseType = await analyzeCommits(
    {preset: 'eslint', releaseRules: [{tag: 'Chore', release: 'patch'}]},
    {cwd, commits, logger: t.context.logger}
  );

  t.is(releaseType, 'minor');
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[0].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'patch'));
  t.true(t.context.log.calledWith('Analyzing commit: %s', commits[1].message));
  t.true(t.context.log.calledWith('The release type for the commit is %s', 'minor'));
  t.true(t.context.log.calledWith('Analysis of %s commits complete: %s release', 2, 'minor'));
});

test('Filter out empty commits', async t => {
  const commits = [
    {hash: '123', message: ''},
    {hash: '456', message: 'fix(scope1): First fix'},
  ];
  const releaseType = await analyzeCommits({}, {cwd, commits, logger: t.context.logger});

  t.is(releaseType, 'patch');
});

test('Throw error if "preset" doesn`t exist', async t => {
  await t.throwsAsync(analyzeCommits({preset: 'unknown-preset'}, {cwd}), {code: 'MODULE_NOT_FOUND'});
});

test('Throw error if "releaseRules" is not an Array or a String', async t => {
  await t.throwsAsync(analyzeCommits({releaseRules: {}}, {cwd}), {
    message: /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/,
  });
});

test('Throw error if "releaseRules" option reference a requirable module that is not an Array or a String', async t => {
  await t.throwsAsync(analyzeCommits({releaseRules: './test/fixtures/release-rules-invalid'}, {cwd}), {
    message: /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/,
  });
});

test('Throw error if "config" doesn`t exist', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  await t.throwsAsync(analyzeCommits({config: 'unknown-config'}, {cwd, commits, logger: t.context.logger}), {
    code: 'MODULE_NOT_FOUND',
  });
});

test('Throw error if "releaseRules" reference invalid commit type', async t => {
  await t.throwsAsync(analyzeCommits({preset: 'eslint', releaseRules: [{tag: 'Update', release: 'invalid'}]}, {cwd}), {
    message: /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*]/,
  });
});

test('Re-Throw error from "conventional-changelog-parser"', async t => {
  const commits = [{message: 'Fix: First fix (fixes #123)'}, {message: 'Update: Second feature (fixes #456)'}];
  await t.throwsAsync(analyzeCommits({parserOpts: {headerPattern: '\\'}}, {cwd, commits, logger: t.context.logger}));
});
