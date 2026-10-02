// Downloads the Minecraft textures the site needs into icons/ and writes data/icons.json
const fs = require("fs"), path = require("path");
const T = "assets/minecraft/textures/";
const RAW = "https://raw.githubusercontent.com/misode/mcmeta/assets/" + T;
const GRASS = "#79c05a";

const ALIAS = {
  wall_torch: "torch", redstone_wall_torch: "redstone_torch", soul_wall_torch: "soul_torch",
  carrots: "carrot", potatoes: "potato", beetroots: "beetroot", sweet_berry_bush: "sweet_berries",
  kelp_plant: "kelp", cave_vines: "glow_berries", cave_vines_plant: "glow_berries",
  redstone_wire: "redstone", tripwire: "string", bamboo_sapling: "bamboo", fire: "fire_0",
  soul_fire: "soul_fire_0", tall_seagrass: "seagrass", water_cauldron: "cauldron", lava_cauldron: "cauldron",
  powder_snow_cauldron: "cauldron", chest: "oak_planks", trapped_chest: "oak_planks", shulker_box: "purple_concrete",
  smooth_quartz: "quartz_block_bottom", smooth_sandstone: "sandstone_top", smooth_red_sandstone: "red_sandstone_top",
  weeping_vines_plant: "weeping_vines", twisting_vines_plant: "twisting_vines",
};
function alias(id) {
  id = id.replace(/^potted_/, "").replace(/^waxed_/, "").replace(/_wall_(sign|hanging_sign|banner)$/, "_$1");
  const sh = id.match(/^(\w+)_shulker_box$/);
  return sh ? sh[1] + "_concrete" : ALIAS[id] || id;
}
// plants and thin blocks that look right as flat sprites
const FLAT = /(sapling|propagule|tulip|dandelion|poppy|orchid|azure_bluet|oxeye_daisy|cornflower|lily_of_the_valley|lilac|peony|rose_bush|^fern$|^large_fern$|^short_grass$|^tall_grass$|^seagrass$|^vine$|^(crimson|warped)_roots$|hanging_roots|sprouts|torch|^ladder$|rail$|^lever$|coral$|coral_fan|_button$|^bush$|leaf_litter|pink_petals|wildflowers|lily_pad|^(brown|red)_mushroom$|fungus$|iron_bars|_pane$|dead_bush|^cobweb$|_trapdoor$|^fire_0$|^soul_fire_0$|^glow_lichen$|^sculk_vein$|dripleaf|^firefly_bush$|^resin_clump$|^spore_blossom$)/;
function tintFor(id) {
  if (/^(short_grass|tall_grass|fern|large_fern|grass_block|bush)$/.test(id)) return GRASS;
  if (id === "vine") return "#48b518";
  if (id === "lily_pad") return "#208030";
  if (/_leaves$/.test(id)) {
    if (/^(cherry|azalea|flowering_azalea|pale_oak)_leaves$/.test(id)) return "";
    return { mangrove_leaves: "#8ab830", birch_leaves: "#80a755", spruce_leaves: "#619961" }[id] || "#48b518";
  }
  return "";
}
function cubeNames(n) {
  const out = [n];
  if (/_wood$/.test(n)) out.push(n.replace(/_wood$/, "_log"));
  const s = n.replace(/_(stairs|slab|wall|fence_gate|fence|button|pressure_plate)$/, "");
  if (s !== n) out.push(s, s + "_planks", s + "s", s + "_block", s.replace(/brick$/, "bricks"), s.replace(/tile$/, "tiles"), s.replace(/_wood$/, "_log"));
  return out;
}
async function pool(list, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const x = list[i++]; await fn(x).catch(() => {}); } }));
}

(async () => {
  const stats = JSON.parse(fs.readFileSync("data/stats.json", "utf8"));
  let old = {}; try { old = JSON.parse(fs.readFileSync("data/icons.json", "utf8")); } catch {}
  const want = new Set();
  for (const p of stats.players) {
    for (const g of ["mined", "used"]) for (const k in p.stats["minecraft:" + g] || {}) want.add(k.replace("minecraft:", ""));
    for (const k in p.stats["minecraft:killed"] || {}) want.add("e:" + k.replace("minecraft:", ""));
  }
  ["air", "cave_air", "void_air"].forEach((a) => want.delete(a));
  const todo = [...want].filter((k) => !(k in old));
  if (!todo.length) return console.log("Icons up to date");

  const r = await fetch("https://api.github.com/repos/misode/mcmeta/git/trees/assets?recursive=1", {
    headers: { "User-Agent": "mc-stats", Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN && { Authorization: "Bearer " + process.env.GITHUB_TOKEN }) },
  });
  const tree = await r.json();
  if (!tree.tree) throw new Error("Couldn't list textures: " + JSON.stringify(tree).slice(0, 200));
  const set = new Set(tree.tree.filter((n) => n.path.startsWith(T) && n.path.endsWith(".png")).map((n) => n.path.slice(T.length, -4)));
  console.log("Known textures:", set.size, "truncated:", tree.truncated);
  const has = (p) => set.has(p), first = (...c) => c.find(has);

  function resolve(key) {
    if (key.startsWith("e:")) { const e = `item/${key.slice(2)}_spawn_egg`; return has(e) ? ["f", e, ""] : 0; }
    const id = alias(key);
    if (id === "grass_block") return ["c", "block/grass_block_top", "block/grass_block_side", GRASS, "block/grass_block_side_overlay"];
    if (has("item/" + id)) return ["f", "item/" + id, ""];
    if (FLAT.test(id)) {
      const f = first("block/" + id.replace(/_pane$/, ""), "block/" + id, "block/" + id + "_top", "block/" + id + "_side");
      if (f) return ["f", f, tintFor(id)];
    }
    for (const n of cubeNames(id)) {
      const top = first(`block/${n}_top`, `block/${n}`, `block/${n}_side`, `block/${n}_front`);
      const side = first(`block/${n}_side`, `block/${n}`, `block/${n}_front`, `block/${n}_top`);
      if (top && side) return ["c", top, side, tintFor(n), ""];
    }
    return 0;
  }

  const fresh = {}, need = new Set();
  for (const k of todo) {
    fresh[k] = resolve(k);
    const s = fresh[k];
    if (s) { need.add(s[1]); if (s[0] === "c") { need.add(s[2]); if (s[4]) need.add(s[4]); } }
  }
  await pool([...need], 12, async (p) => {
    const dest = path.join("icons", p + ".png");
    if (fs.existsSync(dest)) return;
    const res = await fetch(RAW + p + ".png");
    if (!res.ok) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  });
  const ok = (p) => fs.existsSync(path.join("icons", p + ".png"));
  let added = 0, missing = 0;
  for (const k of todo) {
    const s = fresh[k];
    if (!s) { old[k] = 0; missing++; continue; }
    if (ok(s[1]) && (s[0] === "f" || (ok(s[2]) && (!s[4] || ok(s[4]))))) { old[k] = s; added++; }
    // download failed: leave it out so the next run retries
  }
  fs.writeFileSync("data/icons.json", JSON.stringify(old));
  console.log(`Icons added: ${added}, no texture found: ${missing}`);
})().catch((e) => { console.error(e); process.exit(1); });
