# IsraelCraft Player Stats

A GitHub Pages site for player statistics from the IsraelCraft Minecraft server. The site keeps the IsraelCraft theme, shows a selected group of players, and refreshes stats from Exaroton through GitHub Actions.

## What the site shows

- Player cards with skins, online status, playtime, playtime share, kills, deaths, and KDR.
- A detail page with travel, blocks mined, items used, and entities killed.
- A Player metrics table for the configured citizen rankings and their recorded playtime.
- A Refresh button that requests an update through the deployed Cloudflare Worker.

The player list is limited to the UUIDs in `SHOW` in `config.js`. The overall playtime total and card percentage bars use every player record in `data/stats.json`; currently that file contains 11 players while the page shows the six selected players.

## How updates work

1. The `Update stats` GitHub Actions workflow runs every 10 minutes and can also be started manually.
2. The workflow reads player statistics and online status from the Exaroton API, then updates `data/stats.json`.
3. It fetches any missing block and item textures into `icons/` and updates `data/icons.json`.
4. GitHub Pages serves the site from the `main` branch root.

The Exaroton token and server ID are stored as GitHub Actions secrets. The website does not contain the Exaroton token.

## Repository files

```text
index.html                  Page structure, rendering, player filter, and refresh behavior
theme.css                   Colors, fonts, layout, and visual styles
config.js                   Worker URL, player UUID lists, and rankings
data/stats.json             Most recently collected player stats
data/icons.json             Texture mappings for statistics icons
icons/                      Block, item, and site logo images
scripts/fetch-stats.js      Reads player stats from Exaroton
scripts/fetch-icons.js      Fetches Minecraft block and item textures
.github/workflows/update-stats.yml
                            Scheduled and manual stats update workflow
README.md                   This guide
```

The Cloudflare Worker is deployed separately and its source is not stored in this repository. The deployed Worker URL is set in `config.js`.

## Configuration

- `SHOW` in `config.js` lists the Minecraft UUIDs shown on the site. Add or remove UUIDs there to change the player cards.
- `HIDE` excludes additional UUIDs from the site.
- `CITIZENS` and `METRIC_ROWS` configure the Player metrics table.
- `UNCOUNTED` controls the individual card display for a configured player; the overall site total includes all records from `data/stats.json`.
- `WORKER` is the base URL of the deployed Cloudflare Worker. It may include a trailing slash.
- `WORLD_NAME` in `.github/workflows/update-stats.yml` should match the server's world folder.

Player UUIDs can be found in `data/stats.json`.

## Initial setup

1. Add `EXAROTON_TOKEN` and `EXAROTON_SERVER_ID` under the repository's **Settings → Secrets and variables → Actions**.
2. In GitHub **Settings → Pages**, deploy the `main` branch from the repository root.
3. Run **Actions → Update stats → Run workflow** once and confirm the run succeeds.
4. To enable the Refresh button, configure the Cloudflare Worker separately. It needs to serve `/stats` and `/refresh`, trigger this repository's `workflow_dispatch`, and allow the site's origin.

The current site URL is `https://Pierson492.github.io/IsraelCraft-Stats/`.

## Troubleshooting

| Symptom | Check |
|---|---|
| No player cards appear | Confirm `SHOW` contains the intended UUIDs and `data/stats.json` has those players. |
| The site shows old stats | Check the latest `Update stats` run and the `updated` field in `data/stats.json`. |
| The workflow reports missing Exaroton settings | Check the `EXAROTON_TOKEN` and `EXAROTON_SERVER_ID` repository secrets. |
| Refresh does not start an update | Check the deployed Worker, its `/refresh` route, allowed site origin, and GitHub Actions token. |
| Block/item icons are missing | Run the workflow again; icon fetching is a separate best-effort step. |

## Notes

The repository is public and GitHub Pages is public, so player names, UUIDs, and statistics in `data/stats.json` are public. Minecraft assets are fetched from the open `misode/mcmeta` repository; this project is not affiliated with Mojang or Microsoft.