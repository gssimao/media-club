# Media Club MCP Setup

Connect an LLM client (Cursor, Claude Desktop, etc.) to your Media Club deployment so it can search, add, organize, and manage your catalog.

## Prerequisites

1. Media Club deployed or running locally (`npm run dev`)
2. `MCP_API_KEY` set in your environment (see below)
3. For movie/music search tools: `TMDB_API_KEY` and `DISCOGS_TOKEN` configured server-side

## Generate an API key

Use a long random string (32+ characters). Example:

```bash
openssl rand -hex 32
```

### Local development

Add to `.env`:

```env
MCP_API_KEY=your-long-random-key
```

### Cloudflare Workers

```bash
npx wrangler secret put MCP_API_KEY
```

## Endpoint

| Environment | URL                                   |
| ----------- | ------------------------------------- |
| Local dev   | `http://localhost:5173/mcp`           |
| Production  | `https://your-domain.workers.dev/mcp` |

All requests require:

```
Authorization: Bearer YOUR_MCP_API_KEY
```

## Cursor

Add to `.cursor/mcp.json` (project) or Cursor Settings → MCP:

```json
{
	"mcpServers": {
		"media-club": {
			"url": "http://localhost:5173/mcp",
			"headers": {
				"Authorization": "Bearer YOUR_MCP_API_KEY"
			}
		}
	}
}
```

For production, replace the URL with your deployed Worker URL.

## Claude Desktop

Use [mcp-remote](https://www.npmjs.com/package/mcp-remote) to bridge HTTP MCP:

```json
{
	"mcpServers": {
		"media-club": {
			"command": "npx",
			"args": [
				"mcp-remote",
				"https://your-domain.workers.dev/mcp",
				"--header",
				"Authorization: Bearer YOUR_MCP_API_KEY"
			]
		}
	}
}
```

Restart Claude Desktop after editing the config.

## MCP Inspector (manual testing)

```bash
npx @modelcontextprotocol/inspector
```

Open the inspector UI and connect to `http://localhost:5173/mcp` with the Bearer header.

## Available tools

| Tool                 | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `search_media`       | Search TMDB, Discogs, or Open Library                       |
| `list_media`         | List items (defaults to ungrouped, matching category pages) |
| `get_media_item`     | Get one item by id                                          |
| `get_catalog_stats`  | Counts per category/list type                               |
| `add_media_item`     | Add to owned collection or wishlist                         |
| `add_to_wishlist`    | Shortcut for wishlist adds (no collection assignment)       |
| `move_to_owned`      | Promote wishlist item to owned                              |
| `update_media_notes` | Set or clear notes                                          |
| `remove_media_item`  | Delete an item                                              |
| `list_albums`        | List collections in a category                              |
| `create_album`       | Create a new collection                                     |
| `delete_album`       | Delete a collection                                         |
| `assign_to_album`    | Put an owned item in a collection                           |
| `remove_from_album`  | Unassign from a collection                                  |

### `list_media` filters

| Parameter    | Default | Meaning                          |
| ------------ | ------- | -------------------------------- |
| `ungrouped`  | `true`  | Only items not in a collection   |
| `albumId`    | —       | Items in a specific collection   |
| `includeAll` | `false` | All items, grouped and ungrouped |

## Recommended workflow

1. **Search first** — `search_media` with category + query
2. **Confirm with user** — pick the correct match from results
3. **Add** — `add_media_item` or `add_to_wishlist` with fields from the search result
4. **Organize** — `create_album` then `assign_to_album`
5. **Annotate** — `update_media_notes` for condition, edition, etc.

## Example prompts

- "Search for Dune Part Two and add it to my owned movies"
- "Add Kind of Blue to my music wishlist"
- "Create a collection called 90s Jazz and assign these records to it"
- "Add a note to item \<id\>: bought at Amoeba, mint condition"
- "Remove the wishlist entry for \<title\>"

## Terminology

- **Owned** — items you have (`listType: owned`)
- **Wishlist** — items you want (`listType: wishlist`)
- **Collection** — user-defined grouping within a category (Marvel movies, 90s jazz, etc.)

## Security notes

- Never commit `MCP_API_KEY` to git
- The MCP endpoint requires the API key for all tools, including read/list
- Search rate limits apply per API key (not just IP)
- TMDB and Discogs keys stay server-side; the LLM never sees them
