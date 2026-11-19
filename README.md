# Sunbreak

[![Make GTA 6 competition](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![Competition rank](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/rank.svg)](https://make.fun/c/gta6-01)
[![Competition reward](https://make.fun/badge/gta6-01/C-ZW/makefun-gta6/reward.svg)](https://make.fun/c/gta6-01)

One stolen ledger. An island for sale. Play as wheelwoman Inez Vale in Port Vela, where a pirate radio host, a dock union rep and a port accountant all want the same recording. Drive the tape to a transmitter or sell it offshore.

## Play

Run `node serve.ts` from the repository root with Node 22 or newer. Open `http://localhost:8080` in desktop Chrome. Choose **Begin story** for the first job or **Free roam** to explore. The game runs from local static files with the bundled three.js r160.

## Features

- **4 districts** across a coastal island. Mirador Mile has deco hotels and cinemas, Saffron Strand has a beach and observation wheel, Copper Quay has cargo yards and a causeway, and Loma Verde has hillside villas and a public garden.
- **9 story missions** in 3 chapters. Steal a ride, tail a courier, run a blockade, fight a dock crew, work a vault circuit and race between relays. Tape custody changes the later jobs and ending.
- **6 drivable vehicle types** with different acceleration, steering and grip. The Marlin GT, Pico 3, Baron LX, Parcel 88, Dune Hauler and Moth 500 share the streets with lane traffic and pedestrians.
- **5 wanted levels** with patrols, ramming interceptors, roadblocks and a spotlight helicopter. Break sight, watch the search countdown and stay hidden until dispatch clears the pursuit.
- **4 weapons** with ammunition, reloading, health, armor and pickups. Earn respect to unlock the Vela 9 and Brine 12 at Palma Motors.
- **3 synthesized radio stations** with original music, plus engine, siren, weapon and coastal sounds.
- **2 side activities** with repeatable cash rewards and personal bests. Run the Strand Sprint circuit or deliver Night Mail.
- The garage sells ammunition, armor, weapons, repairs and paint. Rest at the safehouse to heal and save. The journal records cases, vehicles, weapons, districts, rank and race times.

## Controls

| Input | Action |
| --- | --- |
| W / S or up / down | Walk forward or back. Accelerate, brake or reverse in a vehicle. |
| A / D or left / right | Strafe on foot. Steer while driving. |
| Shift | Sprint |
| Right mouse drag | Turn the on-foot camera or orbit the vehicle |
| E | Steal, enter or exit a nearby vehicle |
| Space | Handbrake |
| Mouse cursor and left click | Aim and fire. Hold for automatic fire with the Vela 9. |
| 1–4 / R | Select weapon / reload |
| F | Answer a job, enter the garage or safehouse, or begin a side activity at its marker |
| Hold F | Work a marked circuit or transmit a recording |
| T / M | Cycle car radio / toggle audio |
| J / H | Journal / controls |
| Esc | Pause or return. The pause menu includes service routes, save and load. |

Checkpoints use the browser's local storage. Use the same browser and local server address to continue a saved game.

## Fixed-step playtesting

After entering the world, run `vela.freeze(true)` in the browser console to pause wall-clock updates. Run `vela.step(120)` to advance two seconds of traffic, pursuit, combat and mission logic and render the result. Use `vela.freeze(false)` to return to live keyboard and mouse play.
