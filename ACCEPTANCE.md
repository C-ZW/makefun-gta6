# Official brief acceptance checklist

Source of requirements: `/tmp/claude-0/kit-new/gta6-01-kit/RULES.txt`, read before implementation. This is a fresh game replacing the starter gameplay. All new source and documentation were authored with apply_patch. No commercial game assets, libraries, downloaded code or prior game implementation were used.

## Playable systems

| Requirement | Implementation and evidence |
| --- | --- |
| Compact open world on foot and by car | South Quay: 32 buildings, road grid, alleys, courtyards, waterfront and docks. Collision and occluded police sight. |
| Convincing driving | Acceleration, rolling resistance, braking before reverse, speed-dependent steering, handbrake, collision response and damage. Simulation checks pass; subjective browser feel remains unverified. |
| Multiple stealable vehicles | Mistral coupe, Largo sedan, Cormorant van, Riptide GT, with distinct dimensions, speed, acceleration and steering. |
| Traffic and pedestrians | 17 moving traffic vehicles, 4 initially parked vehicles, 46 pedestrians, panic and collision reactions. |
| Short crime story with consequential choice | Tape theft and delivery: broadcast opens on-foot hiding courtyards and 9-second searches; sale gives more money, an extra patrol and a physical roadblock. Both routes complete in simulation through gameplay inputs. |
| Witnessed chase | Vehicle theft creates wanted heat; a patrol with sight confirms pursuit. |
| Pursuit → search → reacquisition → clear | Sight obstructed by buildings, amber last-seen search, visual reacquisition restarts pursuit, unseen timer clears wanted. Explicit regression checks pass. |
| Street-readable states | Patrol lightbars and cones, pursuit/search labels, last-seen street marker, safe-courtyard rings, all-clear marker and police stand-down. |
| Combat and wanted response | Mouse aim/fire on foot, hit detection and damage, pedestrian panic, rising stars, reinforcement patrol and arrest. Simulation checks pass. |
| HUD | Minimap, objective, wanted level, search timer, health/vehicle condition, speed, cash and interaction prompt. |
| Start screen and save | New story, continue, pause, keyboard choice; localStorage persists complete story, traffic, player, vehicle and heat. Save/load event-handler test passes with DOM mocks. |
| Sound | Web Audio engine, siren, shooting, impacts, notifications and original repeating musical phrase. Audio objects exercise successfully with mocks; listening remains pending. |

## File and gate requirements

- [x] Static files under `game/`, no build step; no library dependency.
- [x] `game/index.html` is a regular file below 1 MiB.
- [x] Local script/style/module references; no external requests or runtime fetches.
- [x] Plain files and directories; no symlinks. Far below 993 entries, 48 MiB and 1,000-byte path limits.
- [x] Own source split by responsibility into descriptively named modules; all JavaScript passes Node syntax checks.
- [x] Starter `main.ts` edited directly; still copies `game/` and `screenshots/` and invokes `buildDossier` with the starter caps.
- [x] `vendor/makefun-game.ts` unchanged, confirmed byte-for-byte against kit starter.
- [x] Root OSI-approved MIT `LICENSE` preserved.
- [x] Three exact live README badge image URLs for `gta6-01/C-ZW/makefun-gta6`, linked to make.fun; run command `node serve.ts`.
- [x] `.makefun/owner.json` contains the requested wallet; `.gitignore` excludes `out/`.
- [ ] `screenshots/`: 3 or 4 real PNG/JPEG browser captures, 256 KiB maximum each, longest side ≤1280 and shortest side ≥480; allowed filenames 1–128 characters, letters/digits/dot/space/underscore/hyphen, not initially dot or hyphen. First by name is the cover.
- [ ] Complete `/output` equivalent: game, screenshots and `dossier.json`, ≤1,000 entries and 64 MiB; dossier ≤1.5 MiB and byte-identical to the official builder's reconstruction.
- [ ] Two successful packaging runs with byte-identical complete outputs.
- [ ] Actual browser playthrough of both story choices, tail loss, reacquisition, escape, combat and theft; inspect and refine visual/handling feel.

## Verification results and remaining blocker

`node tests/simulation-check.mjs` passes both complete story routes, escape transitions, reacquisition, theft, acceleration, braking, steering, combat, pedestrian panic and the arrest regression. The sale route avoids the roadblock and switches from the van to the Riptide GT before escaping. These execute actual gameplay modules, with only choice DOM hooks stubbed; they are not browser playthroughs.

`node tests/runtime-check.mjs` executes the real game loop, renderer, menus, keyboard input, save/load and pause with mocked DOM/Canvas/Audio objects. It detects runtime exceptions and nonfinite draw coordinates, but does not establish visual or sound quality.

Local `node serve.ts` fails with `listen EPERM`. Chrome fails on denied IPC `setsockopt`; Chromium Headless Shell fails on denied IPC `shutdown`, including with `--no-sandbox`, `--single-process` and `--no-zygote`. A remote browser tool fallback was also denied because it requires approval and this session's approval policy is never.

The old starter screenshots were deleted. Both attempted `main.ts` runs copied the new static game but failed with the same official `DossierError`: `screenshots/ holds no image: the first is the cover`. There is no valid dossier, and complete output determinism has not been established. No screenshots were fabricated and no submission was made.

Once browser execution is available, use the prepared `tests/browser-session.mjs` harness or `node serve.ts` for the real playthrough. Capture four unedited 1280×800 JPEGs: `1-chase.jpg` (wanted + objective + minimap + patrol), `2-city.jpg` (on foot and traffic), `3-getaway.jpg` (driving and waterfront), `4-combat.jpg` (aim/fire with police). Check each is ≤262,144 bytes, then rerun packaging into two clean directories and compare all files byte-for-byte.

Recording sealing, transcript provenance, GitHub About metadata and contest submission remain outside this local verification. The user requested preparation only; nothing was submitted or published.
