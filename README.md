[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/bun913-mcp-testrail-badge.png)](https://mseep.ai/app/bun913-mcp-testrail)

# TestRail MCP Server

This Model Context Protocol (MCP) server provides tools for interacting with TestRail directly from Claude AI and other MCP-supported clients like Cursor. It allows you to manage test cases, projects, suites, runs, and more without leaving your conversation with the AI.

## Available Tools

The TestRail MCP server provides the following tools:

| Category | Tools |
|----------|-------|
| **Projects** | `getProjects`, `getProject` |
| **Suites** | `getSuites`, `getSuite`, `addSuite`, `updateSuite` |
| **Cases** | `getCase`, `getCases`, `addCase`, `updateCase`, `deleteCase`, `getCaseTypes`, `getCaseFields`, `copyToSection`, `moveToSection`, `getCaseHistory`, `updateCases` |
| **Sections** | `getSection`, `getSections`, `addSection`, `moveSection`, `updateSection`, `deleteSection` |
| **Runs** | `getRuns`, `getRun`, `addRun`, `updateRun` |
| **Tests** | `getTests`, `getTest` |
| **Results** | `getResults`, `getResultsForCase`, `getResultsForRun`, `addResultForCase`, `addResultsForCases` |
| **Plans** | `getPlans` |
| **Milestones** | `getMilestones` |
| **Shared Steps** | `getSharedSteps` |

## Usage

You can connect this MCP server by setting like the below. This method uses `npx` to automatically download and run the latest version of the package, eliminating the need for local installation.

```json
// Example configuration using npx
{
  "mcpServers": {
    "testrail": {
      "command": "npx",
      "args": ["@bun913/mcp-testrail@latest"],
      "env": {
        "TESTRAIL_URL": "https://your-instance.testrail.io", // Replace with your TestRail URL
        "TESTRAIL_USERNAME": "your-email@example.com", // Replace with your TestRail username
        "TESTRAIL_API_KEY": "YOUR_API_KEY" // Replace with your TestRail API key
      }
    }
  }
}
```

## Troubleshooting

- **`spawn node ENOENT` errors**: Ensure that Node.js is properly installed and in your PATH.
- **Connection issues**: Verify that the server is running and the URL is correctly configured in your MCP client.
- **Authentication issues**: Check your TestRail API credentials in the `.env` file.
- **SSE connection errors**: If you see `SSE error: TypeError: fetch failed: connect ECONNREFUSED`, make sure the server is running on the specified port.
- **Your conversation is too long**: Pleae use `limit` and `offset` parameter for test cases

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [TestRail API](https://docs.testrail.techmatrix.jp/testrail/docs/702/api/)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)

