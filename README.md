# IsraelCraft Player Stats

A stats website for the IsraelCraft Minecraft server. It shows every player's playtime, kills, deaths, distance, blocks broken, items used and mobs killed, in the style of the Exaroton player page but themed to match the IsraelCraft site. It runs entirely on GitHub Pages and updates itself.

## What it shows

- A card for every player with their skin, **online status**, playtime and **share of total playtime**
- A details page per player with the full statistics and 3D block icons
- A **Citizen performance metrics** table (Morality, Wealth, Land, Development, plus real **Time Played**)
- A **Refresh** button that can run the update on demand

## Folder layout

```
index.html                  the website
theme.css                   all colors, fonts and looks
config.js                   settings you edit (rankings, hidden players, Worker address)
README.md                   this file
.github/workflows/
  update-stats.yml          the robot that updates the stats every 10 minutes
scripts/
  fetch-stats.js            reads player stats from Exaroton
  fetch-icons.js            downloads block textures for the icons
data/
  stats.json                latest stats (written by the workflow)
  icons.json                which texture each block/item/mob uses (written by the workflow)
icons/                      block and item textures (written by the workflow)
worker/
  worker.js                 optional Cloudflare Worker for the Refresh button
```

## How it works

1. A GitHub Action runs about every 10 minutes (or when someone presses Refresh).
2. It asks the Exaroton API for each player's stat file and the list of online players, and saves them to `data/stats.json`.
3. It downloads any block textures it hasn't seen yet into `icons/`.
4. GitHub Pages serves the site, which reads `data/stats.json` and draws everything.

The Exaroton key is stored as a GitHub secret. It is never in the code.

## Setup

### 1. Exaroton details
- API token: exaroton.com, then Account, then API.
- Server ID: run `curl.exe -H "Authorization: Bearer YOUR_TOKEN" https://api.exaroton.com/v1/servers/` and copy the `id`.

### 2. GitHub secrets
Repo, then Settings, then Secrets and variables, then Actions, then New repository secret:

| Name | Value |
|---|---|
| `EXAROTON_TOKEN` | your Exaroton API token |
| `EXAROTON_SERVER_ID` | your server ID |

If your world folder is not called `world`, change `WORLD_NAME` in `.github/workflows/update-stats.yml`.

### 3. Turn on the website
Settings, then Pages, then Deploy from a branch, then `main` and `/ (root)`, then Save. The repo must be public.
Your site will be at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

### 4. First update
Actions tab, then **Update stats**, then **Run workflow**. Wait for the green check. The first run is slower because it downloads the block textures.

### 5. Make the Refresh button run the update (optional)
A public page can't hold a GitHub key, so a free Cloudflare Worker does it safely.

1. Create a fine-grained GitHub token: github.com/settings/personal-access-tokens/new. Pick Only select repositories and choose this repo. Set **Actions: Read and write** and **Contents: Read-only**.
2. In Cloudflare (dash.cloudflare.com), go to Workers & Pages, then Create, then Create Worker. Name it `mc-stats`, deploy it, click Edit code, paste in `worker/worker.js`, and deploy.
3. In the Worker, go to Settings, then Variables and Secrets, and add:
   - `GITHUB_TOKEN` (type Secret): your token
   - `REPO` : `YOUR-USERNAME/YOUR-REPO-NAME`
   - `ALLOWED_ORIGIN` : `https://YOUR-USERNAME.github.io`
4. Put the Worker address in `config.js` as `WORKER: "https://mc-stats.yourname.workers.dev"`.

GitHub tokens expire. If Refresh stops working one day, make a new token and update the Worker secret.

## Changing things

| I want to... | Edit |
|---|---|
| Change a ranking, a name, or add a metric row | `config.js` (`METRIC_ROWS`, `CITIZENS`) |
| Hide a player completely | `config.js` (`HIDE`), and `EXCLUDE` in `scripts/fetch-stats.js` |
| Show a player but leave them out of total playtime | `config.js` (`UNCOUNTED`) |
| Change colors, fonts or the logo look | `theme.css` |
| Change the update speed | the `cron` line in `.github/workflows/update-stats.yml` |

Players are identified by their Minecraft UUID. You can find one in the `uuid` field of `data/stats.json`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Site says "Couldn't load stats" | Pages is not on yet, or you opened the file from your computer. Use the github.io address. |
| Workflow fails with `Missing EXAROTON_TOKEN` | A secret is missing or misspelled. |
| Workflow fails finding the stats folder | Check `WORLD_NAME`, and that players have joined at least once. |
| `Permission denied` when pushing | Settings, then Actions, then General, then Workflow permissions: Read and write. |
| Gray squares instead of block icons | The workflow has not finished once since the icons were added. Run it again. |
| Online/Offline looks stale | It is only as fresh as the last update. Press Refresh or run the workflow. |
| A player shows a default Steve head | Bedrock players have no Java skin to look up. |
| Refresh does nothing new | `WORKER` in `config.js` is empty or wrong, or the Worker token expired. |

## Notes

- The repo must be public for free GitHub Pages, so player names, UUIDs and stats are public.
- Block textures come from the open `misode/mcmeta` repository of Minecraft's assets. Not affiliated with Mojang or Microsoft.
- The visual style is copied from the main IsraelCraft site.
