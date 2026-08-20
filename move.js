// Move the focused Herdr pane into a new tab in the same workspace.
const { spawnSync } = require("node:child_process");

const herdr = process.env.HERDR_BIN_PATH || "herdr";

function focusedPaneId() {
  try {
    const ctx = JSON.parse(process.env.HERDR_PLUGIN_CONTEXT_JSON || "{}");
    if (typeof ctx.focused_pane_id === "string") return ctx.focused_pane_id;
    if (ctx.focused_pane && typeof ctx.focused_pane.pane_id === "string") {
      return ctx.focused_pane.pane_id;
    }
  } catch {}
  return process.env.HERDR_PANE_ID || null;
}

const paneId = focusedPaneId();
if (!paneId) {
  process.stderr.write("pane-to-tab: no focused pane\n");
  process.exit(1);
}

const r = spawnSync(
  herdr,
  ["pane", "move", paneId, "--new-tab", "--focus"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
