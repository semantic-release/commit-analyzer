import test from 'ava';
import analyzeCommit from '../lib/analyze-commit';

test('Match breaking change', t => {
  const commit = {
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(analyzeCommit([{breaking: true, release: 'major'}], commit), 'major');
});

test('Match revert commit', t => {
  const commit = {
    revert: {header: 'Update: First feature', hash: '123'},
  };

  t.is(analyzeCommit([{revert: true, release: 'patch'}], commit), 'patch');
});

test('Match multiple criteria with breaking change', t => {
  const commit = {
    type: 'feat',
    notes: [{title: 'BREAKING CHANGE', text: 'some breaking change'}],
  };

  t.is(analyzeCommit([{type: 'feat', breaking: true, release: 'major'}], commit), 'major');
});

test('Match multiple criteria with revert', t => {
  const commit = {
    type: 'feat',
    revert: {header: 'Update: First feature', hash: '123'},
  };

  t.is(analyzeCommit([{type: 'feat', revert: true, release: 'major'}], commit), 'major');
});

test('Match multiple criteria', t => {
  const commit = {type: 'feat', scope: 1};

  t.is(analyzeCommit([{type: 'feat', scope: 1, release: 'major'}], commit), 'major');
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

test('Return undefined for commit with falsy properties', t => {
  const commit = {type: null};

  t.is(analyzeCommit([{type: 'feat'}], commit), undefined);
});

test('Match with glob', t => {
  const rules = [{type: 'docs', scope: 'b*', release: 'minor'}];
  const match = {type: 'docs', scope: 'bar'};
  const match2 = {type: 'docs', scope: 'baz'};
  const notMatch = {type: 'docs', scope: 'foo'};

  t.is(analyzeCommit(rules, match), 'minor');
  t.is(analyzeCommit(rules, match2), 'minor');
  t.is(analyzeCommit(rules, notMatch), undefined);
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
