import test from "ava";
import { stub } from "sinon";
import { analyzeCommits } from "../index.js";

const cwd = process.cwd();

test.beforeEach((t) => {
  const log = stub();
  t.context.log = log;
  t.context.logger = { log };
});

test('Accept "preset" option', async (t) => {
  const commits = [
    { hash: "123", message: "Fix: First fix (fixes #123)" },
    { hash: "456", message: "Update: Second feature (fixes #456)" },
  ];
  const releaseType = await analyzeCommits({ preset: "techor" }, { cwd, commits, logger: t.context.logger });

  t.is(releaseType, null);
});
