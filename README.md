# Aftertide

[![Make GTA 6](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![Live rank](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/rank.svg)](https://make.fun/c/gta6-01)
[![Live reward](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/reward.svg)](https://make.fun/c/gta6-01)

Ren Aster drives for a waterfront repair co-op. A missing shipment puts him in the middle of a land grab on Bellcove Island. Follow the deed from the Marigold Strand to the last ferry and decide who gets to keep it.

- 5 districts with lane traffic, pedestrians, a ferry causeway, and a day–night cycle.
- 9 story missions in 3 chapters, a mid-story decision, and 2 endings.
- 6 drivable vehicle models with distinct handling and collision damage.
- 5 wanted levels with patrols, interceptors, roadblocks, a helicopter, and a timed sight-and-search system.
- 4 weapons with ammo, reloads, armor, and pickups.
- 2 repeatable street jobs, street respect, garage and supply services, a healing safehouse, and a local checkpoint.
- 3 synthesized radio stations with generated engine audio, sirens, gunfire, and coastal ambience.

## Play

Run `node serve.ts` with Node.js 22 and open `http://localhost:8080` in desktop Chrome or Chromium. Click **Start story** to capture the mouse. Click the game again to regain mouse look after leaving a menu.

| Input | Action |
| --- | --- |
| W, A, S, D | Move on foot or steer, brake, and accelerate |
| Mouse | Look and aim |
| Left mouse / right mouse | Attack / precision aim |
| Shift | Sprint |
| Space | Handbrake |
| E / F | Enter or exit a vehicle / interact |
| 1–4 / R | Equip a weapon / reload |
| Q | Cycle the radio |
| J / Esc | Journal / pause |

Use the Boathouse or the pause menu to save. Loading restores your completed jobs, equipment, cash, and last set of wheels. A job in progress can be restarted from its contact.

`MAKEFUN_OUTPUT_DIR=out node main.ts` writes the local game, screenshots, and dossier.
