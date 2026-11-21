// ===== Settings you can edit without touching index.html =====
window.CONFIG = {
  // Your Cloudflare Worker address (makes the Refresh button run the workflow). Leave "" if you haven't set it up.
  WORKER: "https://mc-stats.dietzp29.workers.dev/",

  // Players that are not shown anywhere on the site (Minecraft UUIDs)
  HIDE: [
    "00000000-0000-0000-0009-01fe97d5c010"   // ᴊᴇᴡGamer_Boy1098
  ],

    // Only these players appear in the player list
  SHOW: [
    "b4c4e9e8-bda6-4042-8fb3-d32700283ec4", // Pierson562
    "5206cfb7-8d85-4894-8587-a4a2ee10edbe", // goon_king69
    "00000000-0000-0000-0009-01f439f05aac", // margit_the_f3
    "b5057991-9067-4eab-ba3d-e10cd4c6d2df", // GlennFB
    "00000000-0000-0000-0009-01fd2ffd8d1f", // Einstein1216
    "00000000-0000-0000-0009-01ff0cc6c72b"  // Vangate1
  ],

  // Players that are shown but NOT counted in total playtime
  UNCOUNTED: [
    "ef0af359-12e3-492a-b5ca-ce696027fc0c"   // Cling22
  ],

  // The four citizens in the ranking table: [name shown on the site, Minecraft UUID]
  CITIZENS: [
    ["Pierson", "b4c4e9e8-bda6-4042-8fb3-d32700283ec4"],   // Pierson562
    ["Glenn",   "b5057991-9067-4eab-ba3d-e10cd4c6d2df"],   // GlennFB
    ["Max",     "5206cfb7-8d85-4894-8587-a4a2ee10edbe"],   // goon_king69
    ["Leif",    "00000000-0000-0000-0009-01f439f05aac"]    // margit_the_f3 (Bedrock)
  ],

  // Rankings in display order: [metric, 1st, 2nd, 3rd, 4th]
  METRIC_ROWS: [
    ["Morality",   "Glenn",   "Pierson", "Max",  "Leif"],
    ["Wealth",     "Pierson", "Max",     "Glenn","Leif"],
    ["Development","Pierson", "Glenn",   "Max",  "Leif"],
    ["Land Size",  "Pierson", "Max",     "Glenn","Leif"]
  ]
};
