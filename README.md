# SUNBREAK: Dead Air

[![make.fun GTA competition](https://make.fun/badge/gta6-01.svg)](https://make.fun/competitions/gta6-01)
[![Entry rank](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/rank.svg)](https://make.fun/competitions/gta6-01)
[![Entry reward](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/reward.svg)](https://make.fun/competitions/gta6-01)

An original, sunlit coastal crime game. Play Mara Vale, a courier who steals a harbor corruption tape and chooses between broadcasting the truth and selling the silence. South Quay is a compact district of palm-lined avenues, pastel shops, courtyards, traffic and a working marina.

Run with Node.js 22.18 or later:

```sh
node serve.ts
```

Open `http://localhost:8080`. The game has no dependencies, build step, external assets or network requests. All art is drawn by its own Canvas renderer; sound and the original musical pattern are synthesized with Web Audio. Desktop keyboard and mouse only.

| Control | Action |
| --- | --- |
| WASD / arrows | Walk; accelerate, brake/reverse and steer a vehicle |
| Shift | Sprint on foot |
| Space | Handbrake |
| E | Steal nearest vehicle / exit when slow |
| F | Talk, deliver, repair at Quay Customs |
| Mouse + left button | Aim and shoot on foot |
| 1 / 2 | Choose the story branch |
| K | Save world, vehicle, story, money and police state locally |
| Escape | Pause / resume |

Meet Ivo at the gold marker, choose your recipient, and steal the marked Cormorant van. A patrol can witness your getaway. Turn around buildings to break sight: red pursuit labels become amber searches at your last known position. Reappearing in a patrol's view restarts the chase; remaining unseen clears heat. The minimap shows the target, player, police and search area.

Broadcasting pays $600 and opens green courtyards: exit the vehicle inside one to hide, with a nine-second search. Selling pays $1,800 but summons another patrol and blocks the marina road. A faster stolen Riptide GT makes the harder getaway easier. After a successful escape, explore freely, steal any of four vehicle types, fight police, or buy repairs. Getting arrested costs $150 and requires retrying an unfinished delivery.

## Source outline

- `district.js`: authored district geometry, vehicle types, collision and sight obstruction.
- `player-vehicles.js`: handling, theft, shooting, health and ambient simulation.
- `police-pursuit.js`: perception, road navigation, pursuit/search/clear transitions.
- `story.js`: choice, deliveries, rewards, hideout and roadblock consequences.
- `city-renderer.js`: projected city, architecture, vehicles, people and street effects.
- `hud-minimap.js`: objective, wanted status, minimap and controls.
- `sound.js`: engine, siren, effects and music synthesis.
- `game-loop.js`: input, menus, save/load and simulation clock.

## Verification and packaging

```sh
node tests/simulation-check.mjs
node tests/runtime-check.mjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` preserves the starter's copying of `game/` and `screenshots/` and writes `dossier.json` through the unchanged `vendor/makefun-game.ts`. MIT licensed. No submission has been made.

**Current limitation:** this environment blocks local listening sockets and Chromium IPC, including launches with `--no-sandbox`. Logic playthroughs are available, but real browser playthroughs and the required 3–4 screenshots remain pending. Starter screenshots were removed so they cannot be mistaken for evidence of this game. See `ACCEPTANCE.md` for the brief's checklist and `tests/browser-session.mjs` for the prepared keyboard/mouse browser harness.
