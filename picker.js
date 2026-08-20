// Popup: press 1-9 to join MOVE_PANE_ID into that tab (current tab = no-op).
const { spawnSync } = require("node:child_process");

const herdr = process.env.HERDR_BIN_PATH || "herdr";
const paneId = process.env.MOVE_PANE_ID || "";
let currentTabId = process.env.MOVE_TAB_ID || "";
let workspaceId = process.env.MOVE_WORKSPACE_ID || "";

function herdrJson(args) {
  const r = spawnSync(herdr, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (r.status !== 0) {
    return { error: (r.stderr || r.stdout || "").trim() || `exit ${r.status}` };
  }
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { error: "non-JSON" };
  }
}

if (!paneId) {
  process.stderr.write("picker: MOVE_PANE_ID missing\n");
  process.exit(1);
}

if (!currentTabId || !workspaceId) {
  const pane = herdrJson(["pane", "get", paneId]);
  const p = pane.result?.pane || pane.pane || {};
  currentTabId = currentTabId || p.tab_id || "";
  workspaceId = workspaceId || p.workspace_id || "";
}

const listed = herdrJson(["tab", "list", ...(workspaceId ? ["--workspace", workspaceId] : [])]);
if (listed.error) {
  process.stderr.write("picker: " + listed.error + "\n");
  process.exit(1);
}
const tabs = (listed.result?.tabs || listed.tabs || []).slice();
tabs.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
const slots = tabs.slice(0, 9);

function lineFor(i, tab) {
  const n = String(i + 1);
  const cur = tab.tab_id === currentTabId ? " (current)" : "";
  const label = tab.label || tab.tab_id;
  return `  ${n}  ${label}${cur}`;
}

function render(msg) {
  const lines = [
    "Join focused pane into tab",
    "",
    ...slots.map((t, i) => lineFor(i, t)),
    slots.length === 0 ? "  (no tabs)" : "",
    "1-9 select · esc/q cancel",
    msg ? "" : "",
    msg || "",
  ];
  process.stdout.write("\x1b[2J\x1b[H" + lines.join("\r\n") + "\r\n");
}

function finish(code, msg) {
  if (msg) process.stderr.write(msg + "\n");
  try { process.stdin.setRawMode(false); } catch {}
  process.exit(code);
}

function joinTo(tab) {
  if (!tab || tab.tab_id === currentTabId) {
    finish(0, tab ? "picker: already on that tab" : "picker: no tab");
    return;
  }
  const moved = herdrJson(["pane", "move", paneId, "--tab", tab.tab_id, "--split", "right", "--focus"]);
  if (moved.error) finish(1, "picker: " + moved.error);
  else finish(0);
}

if (typeof process.stdin.setRawMode !== "function") {
  finish(1, "picker: need a terminal popup");
}

render("");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (data) => {
  const k = data.toString();
  if (k === "\x03" || k === "q" || k === "\x1b") finish(0);
  if (k >= "1" && k <= "9") {
    const tab = slots[Number(k) - 1];
    if (!tab) {
      render("no tab " + k);
      return;
    }
    joinTo(tab);
  }
});
