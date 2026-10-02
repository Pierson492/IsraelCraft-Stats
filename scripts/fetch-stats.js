// Pulls player stat files from your Exaroton server and writes data/stats.json
const fs = require("fs");
const { EXAROTON_TOKEN: T, EXAROTON_SERVER_ID: S, WORLD_NAME = "world" } = process.env;
if (!T || !S) throw new Error("Missing EXAROTON_TOKEN or EXAROTON_SERVER_ID secret");

const api = (p) => fetch(`https://api.exaroton.com/v1/servers/${S}/${p}`, {
  headers: { Authorization: `Bearer ${T}` },
});
const json = async (p) => {
  const r = await api(p);
  const b = await r.json();
  if (!b.success) throw new Error(`${p}: ${b.error}`);
  return b.data;
};
const text = async (p) => {
  const r = await api(p);
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
  return r.text();
};

(async () => {
  const server = await json("");
  // uuid -> name lookup from the server's usercache
  let names = {};
  try {
    for (const u of JSON.parse(await text("files/data/usercache.json")))
      names[u.uuid] = u.name;
  } catch (e) { console.warn("No usercache:", e.message); }

  // Newer Minecraft versions may store stats in world/players/stats
  let base, dir;
  for (const b of [`${WORLD_NAME}/players/stats`, `${WORLD_NAME}/stats`]) {
    try { dir = await json(`files/info/${b}`); base = b; break; }
    catch (e) { console.warn("Not found:", b); }
  }
  if (!dir) throw new Error("Couldn't find a stats folder. Check WORLD_NAME and that players have joined.");
  console.log("Using", base);
  const players = [];
  for (const f of dir.children || []) {
    if (!f.name.endsWith(".json")) continue;
    const uuid = f.name.replace(".json", "");
    try {
      const s = JSON.parse(await text(`files/data/${base}/${f.name}`));
      players.push({ uuid, name: names[uuid] || uuid.slice(0, 8), stats: s.stats || {} });
    } catch (e) { console.warn("Skipped", f.name, e.message); }
  }
  fs.writeFileSync("data/stats.json", JSON.stringify({
    updated: new Date().toISOString(),
    server: { name: server.name, address: server.address, status: server.status },
    online: (server.players && server.players.list) || [],
    players,
  }));
  console.log(`Saved ${players.length} players`);
})().catch((e) => { console.error(e); process.exit(1); });
