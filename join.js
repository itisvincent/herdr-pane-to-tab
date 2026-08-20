// Open the tab picker popup. The picker reads MOVE_* from env.
const { spawnSync } = require("node:child_process");

const herdr = process.env.HERDR_BIN_PATH || "herdr";

function context() {
  try {
    return JSON.parse(process.env.HERDR_PLUGIN_CONTEXT_JSON || "{}");
  } catch {
    return {};
  }
}

const ctx = context();
const paneId = ctx.focused_pane_id || ctx.focused_pane?.pane_id || process.env.HERDR_PANE_ID;
if (!paneId) {
  process.stderr.write("pane-to-tab join: no focused pane\n");
  process.exit(1);
}

const args = [
  "plugin", "pane", "open",
  "--plugin", "example.pane-to-tab",
  "--entrypoint", "picker",
  "--placement", "popup",
  "--focus",
  "--env", `MOVE_PANE_ID=${paneId}`,
];
if (ctx.tab_id) args.push("--env", `MOVE_TAB_ID=${ctx.tab_id}`);
if (ctx.workspace_id) args.push("--env", `MOVE_WORKSPACE_ID=${ctx.workspace_id}`);

const r = spawnSync(herdr, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
