import test from 'ava';
import compareReleaseTypes from '../lib/compare-release-types';

test('Compares release types', t => {
  t.true(compareReleaseTypes('patch', 'minor'));
  t.true(compareReleaseTypes('patch', 'major'));
  t.true(compareReleaseTypes('minor', 'major'));

  t.false(compareReleaseTypes('major', 'major'));
  t.false(compareReleaseTypes('major', 'minor'));
  t.false(compareReleaseTypes('major', 'patch'));
  t.false(compareReleaseTypes('minor', 'patch'));
});
