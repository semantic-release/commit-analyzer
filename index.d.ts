import type { AnalyzeCommitsContext, ReleaseType } from "semantic-release";

/**
 * A single rule used to determine the release type associated with a commit.
 *
 * Rules are matched against the commit object produced by [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser). Any property other than `release`, `breaking` and `revert` is matched against the corresponding property of the parsed commit; string values support [glob](https://github.com/micromatch/micromatch#matching-features) patterns.
 */
export interface ReleaseRule {
  /**
   * The release type to associate with commits matching this rule.
   *
   * `false` or `null` explicitly associates no release with a matching commit, even if it would otherwise match a rule that produces one.
   */
  release: ReleaseType | false | null;

  /**
   * Match only commits that have at least one breaking change note.
   */
  breaking?: boolean;

  /**
   * Match only commits that are reverts.
   */
  revert?: boolean;

  /**
   * Any other parsed commit property to match against, for example `type` and `scope` for the `angular` preset, or `tag` and `component` for others.
   */
  [commitProperty: string]: unknown;
}

/**
 * Configuration accepted by the `analyzeCommits` step.
 *
 * See the [commit-analyzer README](https://github.com/semantic-release/commit-analyzer#options) for the full description of each option.
 */
export interface PluginConfig {
  /**
   * A [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) preset.
   *
   * Common values are `"angular"`, `"atom"`, `"codemirror"`, `"ember"`, `"eslint"`, `"express"`, `"jquery"`, `"jshint"` and `"conventionalcommits"`, but any installed `conventional-changelog-<preset>` package name can be used.
   *
   * @default "angular"
   */
  preset?: string;

  /**
   * npm package name of a custom conventional-changelog preset.
   *
   * Overridden by `preset` if both are set.
   */
  config?: string;

  /**
   * Additional configuration passed to the conventional-changelog preset. Required when using a preset that expects one, such as `conventionalcommits`.
   */
  presetConfig?: Record<string, unknown>;

  /**
   * Additional [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions) options that extend the ones loaded from `preset` or `config`.
   */
  parserOpts?: Record<string, unknown>;

  /**
   * The rules used to determine the release type of a commit: either an array of rules, or the name or path of a module exporting one. Commits that don't match any rule here fall back to the [default release rules](https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js).
   */
  releaseRules?: string | ReleaseRule[];
}

/**
 * Determine the type of release to create based on a list of commits, by matching each one against `pluginConfig.releaseRules` (falling back to the default release rules for conventional commits).
 *
 * @param pluginConfig The plugin configuration.
 * @param context The semantic-release context for the analyze commits step.
 * @returns The type of release to create based on the list of commits, or `null` if no release has to be done.
 */
export declare function analyzeCommits(
  pluginConfig: PluginConfig,
  context: AnalyzeCommitsContext
): Promise<ReleaseType | null>;
