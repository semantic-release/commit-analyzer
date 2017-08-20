import test from 'ava';
import analyzeCommit from './../lib/analyze-commit';

test('Match breaking change', t => {
  const commit = {
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(analyzeCommit([{breaking: true, release: 'major'}], commit), 'major');
});

test('Match multiple criteria with breaking change', t => {
  const commit = {
    type: 'feat',
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(analyzeCommit([{type: 'feat', breaking: true, release: 'major'}], commit), 'major');
});

test('Match multiple criteria', t => {
  const commit = {type: 'feat', scope: 'test'};

  t.is(analyzeCommit([{type: 'feat', scope: 'test', release: 'major'}], commit), 'major');
});

test('Match only if all criteria are verified', t => {
  const commit = {
    type: 'fix',
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(
    analyzeCommit([{type: 'fix', release: 'minor'}, {type: 'fix', breaking: true, release: 'major'}], commit),
    'major'
  );
});

test('Return undefined if there is no match', t => {
  const commit = {
    type: 'fix',
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(analyzeCommit([{type: 'feat', breaking: true, release: 'major'}], commit), undefined);
});

test('Match with regex', t => {
  const commit = {type: 'docs', scope: 'README'};

  t.is(analyzeCommit([{type: 'docs', scope: /RE..ME/, release: 'minor'}], commit), 'minor');
});

test('Match with regex as string', t => {
  const commit = {type: 'docs', scope: 'README'};

  t.is(analyzeCommit([{type: 'docs', scope: '/RE..ME/', release: 'minor'}], commit), 'minor');
});

test('Return highest release type if multiple rules match', t => {
  const commit = {
    type: 'feat',
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(
    analyzeCommit(
      [
        {type: 'feat', release: 'minor'},
        {breaking: true, release: 'minor'},
        {type: 'feat', breaking: true, release: 'major'},
      ],
      commit
    ),
    'major'
  );
});
