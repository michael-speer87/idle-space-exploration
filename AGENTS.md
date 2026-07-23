# GRaD Command Agent Instructions

## Project

GRaD Command: Galactic Ratification Division is a React, TypeScript,
Vite, and PixiJS idle space-exploration game.

The project is currently developing v0.4.0. Do not update the package
version unless the task explicitly requests the release-sealing step.

## Working style

Work in small, reviewable implementation steps.

Before editing:

1. Inspect the current implementation.
2. Summarize the relevant architecture.
3. State the files expected to change.
4. Identify save compatibility, gameplay, and test risks.

Do not alter approved game design, names, balance values, formulas, or
scope unless the task explicitly requests the change.

Do not perform broad cleanup outside the requested task.

## Git safety

Do not:

- Push to GitHub
- Merge branches or worktrees
- Rebase
- Reset
- Force push
- Delete branches or tags
- Rewrite commit history

Leave all changes uncommitted unless the task explicitly requests a commit.

Never modify the user's main working tree when an isolated worktree is
available.

## Testing

After implementation, run focused tests for the changed system, followed by:

```bash
npm test
npm run lint
npm run build
```

Do not claim completion when any required check is failing.

Report:

- Changed files
- Implemented behavior
- Tests and commands run
- Exact failures, if any
- Save compatibility considerations
- Remaining risks or follow-up work

## Architecture and design guardrails

Preserve existing save compatibility unless the task explicitly includes
a migration.

Research persists through Influence resets. A New Game resets Research.

Research uses fresh Science only and never consumes stored Science.

Research progress is limited by fresh Science production and Research
Academy Capacity.

Completed Research ranks apply their incremental effects immediately.

Primary Outposts define a system's operation. Support Buildings specialize
that operation during the current run.

Research owns non-starting construction unlocks through explicit effects.

Keep the economy intentionally understandable. Avoid workers, detailed
shipping routes, resource grades, random breakdowns, and logistics-heavy
simulation systems.

Do not invent unapproved Research programs, Buildings, resources, or
balance values.

## Current verification expectations

Prefer existing project patterns and TypeScript types.

Add or update tests for all meaningful behavior changes.

Keep code clear and direct rather than introducing speculative frameworks.