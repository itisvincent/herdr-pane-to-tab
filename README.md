# herdr-pane-to-tab

Move the **focused pane** to a **new tab**, or **join** it into a tab you pick.

Herdr has no mouse “send this split to a new tab”. This plugin is those actions.

Needs **Node.js** on PATH (`node -v`).

## Install (any PC)

Copy this folder anywhere, then:

```bat
herdr plugin link C:\path\to\herdr-pane-to-tab
```

Add to `%APPDATA%\herdr\config.toml`:

```toml
[[keys.command]]
key = "prefix+m"
type = "plugin_action"
command = "example.pane-to-tab.move"
description = "move focused pane to new tab"

[[keys.command]]
key = "prefix+t"
type = "plugin_action"
command = "example.pane-to-tab.join"
description = "join focused pane into a chosen tab"
```

Then:

```bat
herdr server reload-config
```

## Keys

| Chord | Action |
|---|---|
| `Ctrl+B` then `m` | Extract focused pane to a **new tab** |
| `Ctrl+B` then `t` | Join picker: press `1`–`9` (current tab = no-op, `esc` cancels) |

Sequence: press **Ctrl+B**, **release**, then `m` or `t`.

If this pane is the last one in its tab, that tab closes after join.

`prefix+j` is **not** used — Herdr already binds it to focus pane down.
`prefix+n` is **not** used — Herdr already binds it to next tab.
