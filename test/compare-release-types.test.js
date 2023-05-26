import test from 'ava';
import compareReleaseTypes from '../lib/compare-release-types.js';

test('Compares release types', (t) => {
  t.true(compareReleaseTypes('patch', 'minor'));
  t.true(compareReleaseTypes('patch', 'major'));
  t.true(compareReleaseTypes('minor', 'major'));

  t.false(compareReleaseTypes('major', 'major'));
  t.false(compareReleaseTypes('major', 'minor'));
  t.false(compareReleaseTypes('major', 'patch'));
  t.false(compareReleaseTypes('minor', 'patch'));

  t.true(compareReleaseTypes('major', false));
  t.true(compareReleaseTypes('minor', false));
  t.true(compareReleaseTypes('patch', false));

  t.true(compareReleaseTypes('major', null));
  t.true(compareReleaseTypes('minor', null));
  t.true(compareReleaseTypes('patch', null));
});
