---
name: e2e-setup
description: "Manage TestRail demo site API key. Delete stale keys (72h+), generate a new one via Playwright, verify access, and update .mcp.json."
allowed-tools: Bash(npm run playwright-cli:*), Bash(curl:*), Bash(npm:*), Bash(node:*), Bash(date:*), Bash(test:*)
---

# TestRail E2E Setup

## Overview

Ensures `.mcp.json` is configured with valid TestRail credentials so that `mcp__testrail__*` tools are available in the current Claude Code session.

**Output**: A valid `.mcp.json` file that Claude Code recognizes as MCP server config.

## Prerequisites

- `@playwright/cli` is in `devDependencies` and available as `npm run playwright-cli`
- Chromium must be installed: `npx playwright install chromium` if needed

## Step 1: Check if `.mcp.json` already works

```bash
test -f .mcp.json && cat .mcp.json
```

**If `.mcp.json` exists**, verify the credentials work:

```bash
TESTRAIL_URL=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_URL)")
TESTRAIL_USERNAME=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_USERNAME)")
TESTRAIL_API_KEY=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_API_KEY)")
curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -u "$TESTRAIL_USERNAME:$TESTRAIL_API_KEY" \
  "${TESTRAIL_URL}/index.php?/api/v2/get_projects"
```

- HTTP 200 -> setup complete, skip to Step 6
- HTTP 401 or file missing -> continue to Step 2

## Step 2: Get latest credentials

Use `WebFetch` on this URL to extract login ID, password, and demo URL:

```
https://www.techmatrix.co.jp/product/testrail/demo_site.html
```

## Step 3: Login to TestRail via playwright-cli

All playwright-cli commands are run via `npm run playwright-cli --`.

### 3a. Open login page

```bash
npm run playwright-cli -- open '<DEMO_SITE_URL>/index.php?/auth/login'
npm run playwright-cli -- snapshot
```

### 3b. Fill login form and submit

Known selectors (as of 2026-03):
- Email: `input[name="name"]`
- Password: `input[name="password"]`
- Submit: `#button_primary`

Use snapshot refs to fill and click:

```bash
npm run playwright-cli -- fill <email_ref> "<LOGIN_ID>"
npm run playwright-cli -- fill <password_ref> "<PASSWORD>"
npm run playwright-cli -- click <login_button_ref>
```

Verify redirect to dashboard (URL contains `/dashboard`).

### 3c. Navigate to API Keys tab

```bash
npm run playwright-cli -- goto '<DEMO_SITE_URL>/index.php?/mysettings'
npm run playwright-cli -- snapshot
```

Click the "API キー" tab. **Important**: There are two elements with text "API キー". Use the one with `data-testid="apiKeysButton"`:

```bash
npm run playwright-cli -- click <ref_for_apiKeysButton>
npm run playwright-cli -- snapshot
```

## Step 4: Delete old `mcp-e2e-*` keys

Scan the API key table in the snapshot. For each row whose name starts with `mcp-e2e-`:
1. Click its delete icon/link
2. Handle confirmation dialog (click the `.dialog-action-default` or "OK" button)
3. Snapshot to confirm

**Never delete keys that don't start with `mcp-e2e-`.**

## Step 5: Generate new API key

### 5a. Click "キーの追加" link

```bash
npm run playwright-cli -- click <add_key_link_ref>
npm run playwright-cli -- snapshot
```

### 5b. Fill key name

The name input field has `id="userTokenName"`:

```bash
npm run playwright-cli -- fill <userTokenName_ref> "mcp-e2e-YYYYMMDD-HHMMSS"
```

### 5c. Generate and capture key

Click the "キーの生成" button:

```bash
npm run playwright-cli -- click <generate_button_ref>
npm run playwright-cli -- snapshot
```

**The generated API key is shown only once.** Read it from the snapshot immediately. It appears as a readonly input with the key value.

### 5d. Confirm and save

1. Click "キーの追加" button in the dialog to confirm
2. Click "設定の保存" on the main settings page (**required**, otherwise the key won't be activated and API returns 401)

```bash
npm run playwright-cli -- click <dialog_add_key_button_ref>
npm run playwright-cli -- snapshot
npm run playwright-cli -- click <save_settings_button_ref>
npm run playwright-cli -- snapshot
```

### 5e. Write `.mcp.json`

Write the MCP server configuration directly to `.mcp.json`:

```json
{
  "mcpServers": {
    "testrail": {
      "command": "node",
      "args": ["dist/stdio.js"],
      "env": {
        "TESTRAIL_URL": "<DEMO_SITE_URL>",
        "TESTRAIL_USERNAME": "<LOGIN_ID>",
        "TESTRAIL_API_KEY": "<GENERATED_API_KEY>"
      }
    }
  }
}
```

### 5f. Close browser

```bash
npm run playwright-cli -- close
```

## Step 6: Verify

```bash
TESTRAIL_URL=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_URL)")
TESTRAIL_USERNAME=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_USERNAME)")
TESTRAIL_API_KEY=$(node -e "const c=JSON.parse(require('fs').readFileSync('.mcp.json','utf8'));console.log(c.mcpServers.testrail.env.TESTRAIL_API_KEY)")
curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -u "$TESTRAIL_USERNAME:$TESTRAIL_API_KEY" \
  "${TESTRAIL_URL}/index.php?/api/v2/get_projects"
```

- HTTP 200 -> setup complete. Tell the user to restart Claude Code or reload MCP to pick up the new `.mcp.json`.
- Any other status -> investigate and retry.

## Key Naming Convention

All keys use prefix `mcp-e2e-YYYYMMDD-HHMMSS`. Only keys matching `mcp-e2e-*` are managed by this skill.

## Known UI Selectors (as of 2026-03)

| Element | Selector / Identifier |
|---|---|
| Login email | `input[name="name"]` |
| Login password | `input[name="password"]` |
| Login submit | `#button_primary` |
| API Keys tab | `data-testid="apiKeysButton"` (use this to avoid duplicate match) |
| Add key link | Text: "キーの追加" |
| Key name input | `id="userTokenName"` |
| Generate button | Text: "キーの生成" |
| Confirm add button | Text: "キーの追加" (in dialog) |
| Save settings button | Text: "設定の保存" |
| Delete confirm | `.dialog-action-default` |

## Self-update protocol

If any step fails due to UI changes:
1. Snapshot the current page state
2. Identify what changed
3. Update THIS skill file with the new element structure (especially the Known UI Selectors table)
4. Retry

## File Layout

| File | Purpose | Git tracked |
|------|---------|-------------|
| `.mcp.json` | MCP server config for Claude Code | No (gitignored) |
