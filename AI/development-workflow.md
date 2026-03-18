# MCP TestRail Development Workflow

## Overview
This project is a TypeScript-based MCP (Model Context Protocol) server that integrates with TestRail.

## Development Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables (create .env file)
# TESTRAIL_URL=https://your-testrail-instance.testrail.io
# TESTRAIL_USERNAME=your-username
# TESTRAIL_API_KEY=your-api-key
```

## Basic Development Flow

### 1. Development Server
```bash
# Start development server (using fastmcp)
npm run start:fastmcp
```

### 2. Code Quality
```bash
# Format code (Biome)
npm run format

# Run tests (Vitest + coverage)
npm test
```

### 3. Build and Run
```bash
# Compile TypeScript
npm run build

# Start MCP server (stdio mode)
npm run start:stdio

# Or SSE mode
npm start
```

### 4. Debugging
```bash
# Debug using MCP Inspector
npm run debug
```

This command:
- Launches MCP Inspector (ports 6274/6277)
- Spawns the **stdio** server (`dist/stdio.js`) so the Inspector can bridge stdin/stdout
- Provides browser-based debugging UI

#### Using the Inspector (avoid "Connection Error")

1. **Env vars**  
   The spawned server needs TestRail credentials. From the project root, either:
   - Use a `.env` with `TESTRAIL_URL`, `TESTRAIL_USERNAME`, `TESTRAIL_API_KEY`, and run `npm run debug` from the same shell, or  
   - Export them before running:  
     `export TESTRAIL_URL=... TESTRAIL_USERNAME=... TESTRAIL_API_KEY=... && npm run debug`

2. **Build first**  
   Run `npm run build` so `dist/stdio.js` exists.

3. **Use the URL with token**  
   When the Inspector starts, the **terminal** prints a line like:  
   `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=abc123...`  
   Open that **full URL** in the browser (or refresh the Inspector tab with that URL). If you use only `http://localhost:6274`, the "Connect" step can fail with "proxy token is correct".

4. **Connect**  
   In the Inspector page, choose the **stdio** transport (if asked) and click **Connect**. The server is already running as a subprocess; Connect links the browser client to it.

#### Viewing logs (case tools / template fields)

To see what the MCP server sends to TestRail for add/update case (e.g. templateId and step fields), enable debug logging:

```bash
# In the same environment where the MCP server runs:
export MCP_TESTRAIL_DEBUG=1
# Then start the server (e.g. npm run debug, or restart Cursor's MCP)
```

When `MCP_TESTRAIL_DEBUG=1` (or `true`), the server logs to **stderr**:
- `buildCaseStepFields: templateId=X → step fields: ...` — which step keys were chosen for the given template
- `addCase` / `updateCase` / `updateCases` request payload keys (step-related) — which of those keys are in the final request body

**Where logs appear:**
- **MCP Inspector** (`npm run debug`): same terminal where you ran `npm run debug` (stderr is inherited).
- **Cursor/IDE**: MCP server runs in a child process; check **Output** panel → select the channel for your MCP server (e.g. "MCP" or "TestRail"), or the terminal tab where you started the server if you run it manually.
- **Manual stdio**: `MCP_TESTRAIL_DEBUG=1 npm run start:stdio` — logs go to the same terminal.

## Project Structure

```
src/
├── client/       # TestRail API client
├── server/       # MCP server implementation
├── shared/       # Common schemas and types
├── stdio.ts      # stdio mode entry point
└── sse.ts        # SSE mode entry point
```

## CI/CD Flow

```bash
# CI tests (silent execution)
npm run test:ci

# Automatic build before publishing
npm run prepublishOnly
```

## Execution Modes

1. **Development**: `npm run start:fastmcp` for instant development
2. **Production**: `npm run build` → `npm start` or `npm run start:stdio`
3. **Debug**: `npm run debug` for detailed debugging with MCP Inspector
4. **Testing**: `npm test` for complete test suite execution

## Node.js Version Requirements
- Node.js 20.18.1 ~ 22.14.0