import * as T from '../vendor/three.module.min.js';
import {coastalSky} from './daylight.js';
import {chaseCamera} from './camera.js';
import {buildPortVela} from './city-builder.js';
import {spawnVehicle,poseCar} from './vehicles.js';
import {drive} from './vehicle-handling.js';
import {islandTraffic,tickTraffic} from './traffic.js';
import {walkingResidents,tickResidents} from './pedestrians.js';
import {streetPlayer,enterOrExit,walkPlayer} from './on-foot.js';
import {islandPolice} from './police.js';
import {missionDirector} from './missions.js';
import {missionWaypoint} from './waypoints.js';
import {streetCombat} from './combat.js';
export const PORT_VELA={title:'SUNBREAK',city:'Port Vela'};
const renderer=new T.WebGLRenderer({canvas:document.querySelector('#island'),antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(59,1,.13,800),daylight=coastalSky(scene),rig=chaseCamera(camera);
const p=streetPlayer(scene,5.6,72);
const world=buildPortVela(scene);
const cars=islandTraffic(scene),people=walkingResidents(scene);
const police=islandPolice(scene,cars,world);p.crime=n=>police.heat.crime(n,p);
addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat)enterOrExit(p,cars,world)});
addEventListener('mousemove',e=>{if(e.buttons===2||document.pointerLockElement){if(p.car)rig.orbit(e.movementX,e.movementY);else p.yaw+=e.movementX*.006}});
addEventListener('contextmenu',e=>e.preventDefault());
const keys=new Set();addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));
const game={p,scene,camera,renderer,cars,people,police,keys,world},missions=missionDirector(game),waypoint=missionWaypoint(scene);
game.missions=missions;addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat)missions.start()});
const combat=game.combat=streetCombat(game);
addEventListener('mousemove',e=>combat.setAim(e.clientX,e.clientY));addEventListener('mousedown',e=>{if(e.button===0&&e.target.id==='island')combat.trigger(true)});addEventListener('mouseup',()=>combat.trigger(false));
addEventListener('keydown',e=>{if(/^Digit[1-4]$/.test(e.code))combat.equip(Number(e.key)-1);if(e.code==='KeyR')combat.refill()});
addEventListener('blur',()=>keys.clear());
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
resize();addEventListener('resize',resize);let time=0,last=0;
function tick(dt){time+=dt;daylight(time);if(p.car){drive(p.car,keys,dt,world);Object.assign(p,{x:p.car.x,z:p.car.z,yaw:p.car.yaw,y:world.height(p.car.x,p.car.z)})}else walkPlayer(p,keys,dt,world);
 tickTraffic(cars,p,world,dt);tickResidents(people,p,world,dt,time);police.tick(p,dt,time);combat.tick(dt,time);missions.tick(dt);waypoint(missions.target(),time);rig.update(p,dt)}
function render(){renderer.render(scene,camera)}
function frame(now){tick(Math.min(.05,(now-last)/1000));last=now;render();requestAnimationFrame(frame)}
rig.update(p,0,true);requestAnimationFrame(frame);
window.vela=Object.assign(game,{step(n=1){for(let i=0;i<n;i++)tick(1/60);render()}});
