import test from 'ava';
import pify from 'pify';
import conventionalChangelogAngular from 'conventional-changelog-angular';
import conventionalChangelogESLint from 'conventional-changelog-eslint';
import SemanticReleaseError from '@semantic-release/error';
import parse from '../lib/parse';

test('Parse raw commit with angular parser', t => {
  const commit = parse(
    'feat(test): new feature (fixes #456)\n\n BREAKING CHANGE: break something',
    conventionalChangelogAngular.parserOpts
  );

  t.is(commit.type, 'feat');
  t.is(commit.scope, 'test');
  t.is(commit.subject, 'new feature (fixes #456)');
  t.is(commit.notes[0].title, 'BREAKING CHANGE');
  t.is(commit.notes[0].text, 'break something');
});

test('Parse raw commit with eslint parser', async t => {
  const commit = parse(
    'Update: new feature (fixes #456)\n\n BREAKING CHANGE: break something',
    (await pify(conventionalChangelogESLint)()).parserOpts
  );

  t.is(commit.tag, 'Update');
  t.is(commit.message, 'new feature ');
  t.is(commit.notes[0].title, 'BREAKING CHANGE');
  t.is(commit.notes[0].text, 'break something');
});

test('Parse raw commit with custom parser', t => {
  const commit = parse('##BUGFIX## First fix (fixes #123)', {
    headerPattern: /^##(.*?)## (.*)$/,
    headerCorrespondence: ['tag', 'shortDesc'],
  });

  t.is(commit.tag, 'BUGFIX');
  t.is(commit.shortDesc, 'First fix (fixes #123)');
});

test('Wrap parser errors in SemanticReleaseError', t => {
  const error = t.throws(
    () => parse('Fix: First fix (fixes #123)', {headerPattern: '\\'}),
    /Error in conventional-changelog-parser: Invalid regular expression:/
  );

  t.true(error instanceof SemanticReleaseError);
});
