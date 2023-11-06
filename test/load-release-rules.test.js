import test from "ava";
import loadReleaseRules from "../lib/load-release-rules.js";
import testReleaseRules from "./fixtures/release-rules.cjs";

const cwd = process.cwd();

test('Accept a "releaseRules" option', async (t) => {
  const releaseRules = await loadReleaseRules({ releaseRules: testReleaseRules }, { cwd });

  t.deepEqual(releaseRules, testReleaseRules);
});

test('Accept a "releaseRules" option that reference a requireable module', async (t) => {
  const releaseRules = await loadReleaseRules({ releaseRules: "./test/fixtures/release-rules.cjs" }, { cwd });

  t.deepEqual(releaseRules, testReleaseRules);
});

test('Return undefined if "releaseRules" not set', async (t) => {
  const releaseRules = await loadReleaseRules({}, { cwd });

  t.is(releaseRules, undefined);
});

test('Preserve release rules set to "false" or "null"', async (t) => {
  const releaseRules = await loadReleaseRules(
    {
      releaseRules: [
        { type: "feat", release: false },
        { type: "fix", release: null },
      ],
    },
    { cwd }
  );

  t.deepEqual(releaseRules, [
    { type: "feat", release: false },
    { type: "fix", release: null },
  ]);
});

test('Throw error if "releaseRules" reference invalid commit type', async (t) => {
  await t.throwsAsync(loadReleaseRules({ releaseRules: [{ tag: "Update", release: "invalid" }] }, { cwd }), {
    message: /Error in commit-analyzer configuration: "invalid" is not a valid release type\. Valid values are:\[?.*]/,
  });
});

test('Throw error if a rule in "releaseRules" does not have a release type', async (t) => {
  await t.throwsAsync(loadReleaseRules({ releaseRules: [{ tag: "Update" }] }, { cwd }), {
    message: /Error in commit-analyzer configuration: rules must be an object with a "release" property/,
  });
});

test('Throw error if "releaseRules" is not an Array or a String', async (t) => {
  await t.throwsAsync(loadReleaseRules({ releaseRules: {} }, { cwd }), {
    message: /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/,
  });
});

test('Throw error if "releaseRules" option reference a requirable module that is not an Array or a String', async (t) => {
  await t.throwsAsync(loadReleaseRules({ releaseRules: "./test/fixtures/release-rules-invalid.cjs" }, { cwd }), {
    message: /Error in commit-analyzer configuration: "releaseRules" must be an array of rules/,
  });
});

test('Throw error if "releaseRules" contains an undefined rule', async (t) => {
  await t.throwsAsync(loadReleaseRules({ releaseRules: [{ type: "feat", release: "minor" }, undefined] }, { cwd }), {
    message: /Error in commit-analyzer configuration: rules must be an object with a "release" property/,
  });
});
