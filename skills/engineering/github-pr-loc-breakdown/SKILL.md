---
name: github-pr-loc-breakdown
description: "Use when calculating, auditing, or explaining lines changed in a large GitHub pull request, especially when generated files, documentation, lockfiles, or API file-list limits may distort the headline LOC."
---

# GitHub PR LOC breakdown

## Goal

Produce reviewer-useful LOC rather than repeating GitHub's raw additions and deletions. Separate generated artifacts, documentation, tests, and implementation while keeping exact totals.

## Workflow

1. Read PR metadata: base and head, `changedFiles`, total additions, and total deletions.
2. Fetch **all** changed files with paginated GitHub GraphQL:

   ```graphql
   query($endCursor: String) {
     repository(owner: "OWNER", name: "REPO") {
       pullRequest(number: PR_NUMBER) {
         files(first: 100, after: $endCursor) {
           nodes { path additions deletions }
           pageInfo { hasNextPage endCursor }
         }
       }
     }
   }
   ```

   With `gh`, use `gh api graphql --paginate --slurp`. Do not rely on `gh pr view --json files` for large PRs: its file list can stop at 100 while `changedFiles` is larger.
3. Assert:
   - the fetched file count equals `changedFiles`;
   - summed additions equal the PR total;
   - summed deletions equal the PR total.
4. Classify paths into mutually exclusive categories suited to the repository. Common categories:
   - generated migration or schema snapshots;
   - source code excluding tests;
   - tests;
   - SQL migrations;
   - Markdown and MDX;
   - generated SVG or compiled assets;
   - lockfiles;
   - package manifests;
   - other configuration and diagram sources.
5. For each category report files, additions, deletions, and churn (`additions + deletions`).
6. Report useful rollups:
   - raw PR churn;
   - excluding generated artifacts;
   - excluding generated artifacts and docs;
   - implementation plus tests plus migrations;
   - production implementation excluding tests.

## Output

Lead with the conclusion: which category actually inflates the raw number. Include a compact table and percentages of raw churn. Distinguish additions from churn; additions alone are not "changed lines".

## Common mistakes

- Categorizing only the first 100 files.
- Trusting a cached PR diff whose file count disagrees with PR metadata.
- Blaming Markdown before measuring generated schema snapshots or compiled diagrams.
- Combining generated and handwritten code into one "LOC" number.
- Hiding deletions or presenting net additions as review effort.
- Using overlapping categories whose totals exceed the PR total.
