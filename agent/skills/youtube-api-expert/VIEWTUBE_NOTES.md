# ViewTube integration notes

This skill is vendored from the MIT-licensed `sigvardt/youtube-mcp` project as an **agent knowledge/reference skill only**.

## Important boundary

Do **not** wire the upstream MCP server into ViewTube production authentication. ViewTube should keep one deliberately small production auth/data transport. The skill exists so coding agents can reason accurately about YouTube Data API v3, Analytics API v2, Reporting API v1, scopes, quotas, report compatibility, comments, videos, playlists, and account-management workflows.

## ViewTube architecture target

For production code, prefer:

1. One server-side Google OAuth 2.0 Authorization Code flow.
2. One server-owned credential record per ViewTube user/channel.
3. One HttpOnly ViewTube session cookie in the browser.
4. One server Google client/factory using Google's supported Node client libraries.
5. One typed internal API gateway for YouTube Data, Analytics, and Reporting calls.
6. No browser access tokens, no implicit-grant fallback, no dual server/browser auth modes, no auth-state OR chains, and no widget-specific OAuth handling.
7. Read capability and write capability are explicit server-derived grants, never inferred from cached UI state.

Use the upstream references to validate scopes, quota cost, API method choice, reporting lifecycle, metric/dimension compatibility, and comment/video behavior while implementing this simplified architecture.
