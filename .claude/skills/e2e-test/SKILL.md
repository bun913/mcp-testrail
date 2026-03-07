---
name: e2e-test
description: "Run E2E regression tests against TestRail using MCP tools. Builds the project, then exercises Projects, Suites, Sections, Cases (CRUD), Runs, Tests, Results, Plans, Milestones, and SharedSteps."
allowed-tools: Bash(npm:*), Bash(git:*), mcp__testrail__getProjects, mcp__testrail__getProject, mcp__testrail__getSuites, mcp__testrail__getSuite, mcp__testrail__addSuite, mcp__testrail__updateSuite, mcp__testrail__getSections, mcp__testrail__getSection, mcp__testrail__addSection, mcp__testrail__updateSection, mcp__testrail__deleteSection, mcp__testrail__moveSection, mcp__testrail__getCases, mcp__testrail__getCase, mcp__testrail__addCase, mcp__testrail__updateCase, mcp__testrail__updateCases, mcp__testrail__deleteCase, mcp__testrail__getCaseTypes, mcp__testrail__getCaseFields, mcp__testrail__getCaseHistory, mcp__testrail__copyToSection, mcp__testrail__moveToSection, mcp__testrail__getRuns, mcp__testrail__getRun, mcp__testrail__addRun, mcp__testrail__updateRun, mcp__testrail__getTests, mcp__testrail__getTest, mcp__testrail__getResults, mcp__testrail__getResultsForCase, mcp__testrail__getResultsForRun, mcp__testrail__addResultForCase, mcp__testrail__addResultsForCases, mcp__testrail__getPlans, mcp__testrail__addPlan, mcp__testrail__addPlanEntry, mcp__testrail__addRunToPlanEntry, mcp__testrail__getMilestones, mcp__testrail__getSharedSteps
---

# MCP TestRail E2E Test

## Overview

Runs E2E regression tests against TestRail using `mcp__testrail__*` MCP tools directly.
Always runs a baseline regression suite regardless of code changes.

**Prerequisite**: `.mcp.json` must be configured and MCP tools must be loaded. Run `/e2e-setup` first if needed.

## Step 1: Build the project

```bash
npm run build
```

Ensure the build succeeds before proceeding.

## Step 2: Detect changed tools (informational)

```bash
git diff main...HEAD --name-only -- src/server/api/ src/client/ src/shared/
```

Map changed files to categories (for reporting which are "targeted" vs "regression"):

| File pattern | Tool category |
|---|---|
| `projects.ts` | Projects |
| `cases.ts` | Cases |
| `sections.ts` | Sections |
| `suites.ts` | Suites |
| `runs.ts` | Runs |
| `tests.ts` | Tests |
| `results.ts` | Results |
| `plans.ts` | Plans |
| `milestones.ts` | Milestones |
| `sharedSteps.ts` | SharedSteps |

This is informational only. All categories are always tested.

## Step 3: Run regression tests

Use the `mcp__testrail__*` tools directly. Each step captures IDs needed for subsequent steps.
If a tool call returns an error, log it and continue. Do not abort the entire run.

### 3a. Projects (read-only)

1. `mcp__testrail__getProjects` -> capture a `project_id` from the response
2. `mcp__testrail__getProject` with that `project_id`

### 3b. Suites

1. `mcp__testrail__getSuites` with `project_id` -> capture a `suite_id`

### 3c. Sections

1. `mcp__testrail__getSections` with `project_id` and `suite_id` -> capture a `section_id`

### 3d. Cases (full CRUD lifecycle)

1. **Create**: `mcp__testrail__addCase` with `section_id`, title `"[E2E] Auto-generated test case"`, `type_id=1`, `priority_id=2` -> capture `case_id`
2. **Read**: `mcp__testrail__getCase` with `case_id`
3. **Update**: `mcp__testrail__updateCase` with `case_id`, title `"[E2E] Updated test case"`
4. **Read again**: `mcp__testrail__getCase` to verify update
5. *(Keep case_id for Results tests, delete in cleanup)*

### 3e. Runs

1. **Create**: `mcp__testrail__addRun` with `project_id`, `suite_id`, name `"[E2E] Auto-generated run"` -> capture `run_id`
2. **Read**: `mcp__testrail__getRun` with `run_id`
3. **List**: `mcp__testrail__getRuns` with `project_id`

### 3f. Tests

1. `mcp__testrail__getTests` with `run_id`

### 3g. Results

1. **Add**: `mcp__testrail__addResultForCase` with `run_id`, `case_id`, `status_id=1`, comment `"[E2E] Passed via automated test"`
2. **Read**: `mcp__testrail__getResultsForRun` with `run_id`

### 3h. Plans

1. **Create**: `mcp__testrail__addPlan` with `project_id`, name `"[E2E] Auto-generated plan"` -> capture `plan_id`
2. **List**: `mcp__testrail__getPlans` with `project_id`

### 3i. Milestones (read-only)

1. `mcp__testrail__getMilestones` with `project_id`

### 3j. SharedSteps (read-only)

1. `mcp__testrail__getSharedSteps` with `project_id`

### 3k. CaseTypes & CaseFields (read-only)

1. `mcp__testrail__getCaseTypes`
2. `mcp__testrail__getCaseFields`

## Step 4: Report results

Summarize all results in a table:

```
| Tool              | Status | Details          |
|-------------------|--------|------------------|
| getProjects       | PASS   | 3 projects found |
| addCase           | PASS   | case_id=12345    |
| ...               | ...    | ...              |
```

Mark each tool as PASS or FAIL with details.

## Step 5: Cleanup

Remove all test data created during the run:

1. **Delete test cases**: `mcp__testrail__deleteCase` for any case created with `[E2E]` prefix
2. **Close test runs**: `mcp__testrail__updateRun` with `is_completed=true` for `[E2E]` runs (runs cannot be deleted via API, only closed)
3. **Delete is not available for plans via this MCP server**, so just note any plans created for manual cleanup

This prevents polluting the shared demo environment.

## Notes

- All test data uses `[E2E]` prefix for easy identification and cleanup.
- The demo site resets every Sunday, so leftover data is not permanent.
- If a tool call returns an error, log it and continue with the next tool.
- Write-operation tests (add/update/delete) should form a complete lifecycle: create -> verify -> update -> verify -> delete/close.
