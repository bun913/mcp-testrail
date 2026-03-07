---
name: e2e-setup
description: "Manage TestRail demo site API key. Delete stale keys (72h+), generate a new one via Playwright, verify access, and update .mcp.json."
allowed-tools: Bash(playwright-cli:*), Bash(curl:*), Bash(npx:*), Bash(node:*), Bash(date:*), Bash(cat:*), Bash(cp:*), Bash(test:*)
---

# TestRail E2E Setup

## Overview

Ensures `.mcp.json` is configured with valid TestRail credentials so that `mcp__testrail__*` tools are available in the current Claude Code session.

**Output**: A valid `.mcp.json` file that Claude Code recognizes as MCP server config.

## Step 1: Check if `.mcp.json` already works

```bash
test -f .mcp.json && cat .mcp.json
```

**If `.mcp.json` exists**, verify the credentials work:

```bash
# Extract creds from .mcp.json
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

Fetch the latest login credentials from the demo site info page.

```bash
# Use WebFetch on this URL to extract login ID, password, and demo URL:
# https://www.techmatrix.co.jp/product/testrail/demo_site.html
```

## Step 3: Login to TestRail via Playwright

### 3a. Open login page

```bash
npx playwright-cli open '<DEMO_SITE_URL>/index.php?/auth/login'
npx playwright-cli snapshot
```

### 3b. Fill login form and submit

Login page elements (refs are dynamic -- always snapshot first):
- textbox "電子メール" -> login ID
- textbox "パスワード" -> password
- button "ログイン" -> submit

```bash
npx playwright-cli fill <email_ref> "<LOGIN_ID>"
npx playwright-cli fill <password_ref> "<PASSWORD>"
npx playwright-cli click <login_button_ref>
```

Verify redirect to dashboard (URL contains `/dashboard`).

### 3c. Navigate to API Keys tab

```bash
npx playwright-cli goto '<DEMO_SITE_URL>/index.php?/mysettings'
npx playwright-cli snapshot
```

Click the "API キー" tab:

```bash
npx playwright-cli click <api_key_tab_ref>
npx playwright-cli snapshot
```

## Step 4: Delete old `mcp-e2e-*` keys

Scan the API key table. For each row whose name starts with `mcp-e2e-`:
1. Click its delete link
2. Handle any confirmation dialog
3. Snapshot to confirm

**Never delete keys that don't start with `mcp-e2e-`.**

## Step 5: Generate new API key

### 5a. Click "キーの追加"

```bash
npx playwright-cli click <add_key_link_ref>
npx playwright-cli snapshot
```

### 5b. Fill key name

```bash
npx playwright-cli fill <key_name_ref> "mcp-e2e-$(date -u +%Y%m%d-%H%M%S)"
```

### 5c. Generate and capture key

```bash
npx playwright-cli click <generate_button_ref>
npx playwright-cli snapshot
```

**The generated API key is shown only once.** Read it from the snapshot immediately.

### 5d. Confirm and save

1. Click "キーの追加" button in the dialog
2. Click "設定の保存" on the main settings page (required, otherwise HTTP 401)

```bash
npx playwright-cli click <dialog_add_key_button_ref>
npx playwright-cli snapshot
npx playwright-cli click <save_settings_button_ref>
npx playwright-cli snapshot
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
npx playwright-cli close
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

## Self-update protocol

If any step fails due to UI changes:
1. Snapshot the current page state
2. Identify what changed
3. Update THIS skill file with the new element structure
4. Retry

## File Layout

| File | Purpose | Git tracked |
|------|---------|-------------|
| `.mcp.json` | MCP server config for Claude Code | No (gitignored) |
