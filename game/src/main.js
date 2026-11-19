import * as T from '../vendor/three.module.min.js';
import {buildPortVela} from './city-builder.js';
import {coastalSky} from './daylight.js';
import {streetLighting} from './street-lighting.js';
import {chaseCamera} from './camera.js';
import {streetPlayer,enterOrExit,walkPlayer} from './on-foot.js';
import {rideMotorbike} from './characters.js';
import {drive} from './vehicle-handling.js';
import {separateVehicles} from './collisions.js';
import {tireEffects} from './driving-effects.js';
import {islandTraffic,tickTraffic} from './traffic.js';
import {walkingResidents,tickResidents} from './pedestrians.js';
import {islandPolice} from './police.js';
import {missionDirector,MISSION_FAILURE} from './missions.js';
import {streetCombat} from './combat.js';
import {missionWaypoint} from './waypoints.js';
import {islandActivities,serviceAt,destinationPoint} from './activities.js';
import {safehouse} from './safehouse.js';
import {islandAudio} from './audio.js';
import {STATIONS} from './radio.js';
import {districtAt,DISTRICTS} from './districts.js';
import {dashboard} from './hud.js';
import {menuController} from './menus.js';
export const SUNBREAK={name:'Sunbreak',setting:'Port Vela',lead:'Inez Vale'};
document.title=SUNBREAK.name+' — '+SUNBREAK.setting;
const canvas=document.querySelector('#island'),renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(59,1,.13,800),sky=coastalSky(scene),world=buildPortVela(scene),rig=chaseCamera(camera,world);
const p=streetPlayer(scene,5.6,72),cars=islandTraffic(scene),people=walkingResidents(scene),keys=new Set(),police=islandPolice(scene,cars,world);
const game={scene,camera,renderer,world,p,cars,people,keys,police,time:0,station:0,menu:'title',lastHit:0,
 say(who,line,seconds=7){this.dialogue={who,line,until:this.time+seconds}},
 notify(text){this.toast={text,until:this.time+3.2}},
 snap(){rig.reset();rig.update(p,0,true);camera.updateMatrixWorld()}
};
p.crime=n=>police.heat.crime(n,p);p.notify=text=>game.notify(text);
const combat=game.combat=streetCombat(game),missions=game.missions=missionDirector(game),activity=game.activity=islandActivities(game),save=game.save=safehouse(game),sound=game.sound=islandAudio();
const waypoint=missionWaypoint(scene),tracks=tireEffects(scene),lighting=streetLighting(scene),hud=dashboard(game),menus=menuController(game);game.open=menus.open;game.close=menus.close;
let frozen=false,last=0,hudClock=0,impact=0,titleTime=0;
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();document.documentElement.style.setProperty('--u',Math.min(innerWidth/1050,innerHeight/635,1.7))}
resize();addEventListener('resize',resize);
function recover(){
 if(missions.m.active)missions.fail(MISSION_FAILURE.down);if(p.car){p.car.role='parked';p.car.speed=0;p.car=null}p.model.visible=true;activity.active='';police.reset();
 Object.assign(p,{x:11,z:78,health:100,armor:15,cash:Math.max(0,p.cash-75)});game.snap();game.notify('Back at the safehouse · clinic fee $75');
}
function tick(dt){
 if(game.menu)return;
 game.time+=dt;game.lastHit=Math.max(0,game.lastHit-dt);impact=Math.max(0,impact-dt);sky(game.time);
 if(p.car){
  const c=p.car;drive(c,keys,dt,world);Object.assign(p,{x:c.x,z:c.z,yaw:c.yaw,y:world.height(c.x,c.z)});
  if(c.health<=0){c.speed=0;enterOrExit(p,cars,world);game.notify('Engine out · find another ride');p.hurt(12)}
 }else walkPlayer(p,keys,dt,world,combat.flashing);
 tickTraffic(cars,p,world,dt,people);tickResidents(people,p,world,dt,game.time);police.tick(p,dt,game.time);combat.tick(dt,game.time);missions.tick(dt);activity.tick(dt);
 for(const c of police.units){if(c.role!=='patrol'||!police.heat.level)continue;for(const o of cars)if(o!==c&&o!==p.car&&o.active)separateVehicles(c,o,world)}
 if(p.car){const c=p.car;for(const o of cars){if(o===c||!o.active||!separateVehicles(c,o,world))continue;
  if(!impact&&Math.abs(c.speed)>6){const bump=Math.abs(c.speed)*.34;c.health=Math.max(0,c.health-bump);o.health=Math.max(0,o.health-bump*.5);c.speed*=.53;impact=1.1;if(o.duty)p.crime(2)}}
  p.x=c.x;p.z=c.z;if(c.type===5)rideMotorbike(p)}
 if(p.health<=0)recover();
 const district=districtAt(p.x,p.z);if(!p.districts.includes(district)){p.districts.push(district);if(p.districts.length>1)game.notify(DISTRICTS[district].name+' discovered')}
 const point=destinationPoint(game);waypoint(point,game.time);tracks(game,dt);rig.update(p,dt);
 if(game.destination&&serviceAt(p)===game.destination){game.destination='';game.notify('Destination reached · F to interact')}
 for(const c of cars)c.model.visible=c.active&&Math.hypot(c.x-p.x,c.z-p.z)<149;
}
function render(){lighting(game);renderer.render(scene,camera);hud()}
function frame(now){
 const dt=Math.min(.15,(now-last)/1000);last=now;
 if(!frozen){
  if(game.menu==='title'){
   titleTime+=dt;sky(0);camera.position.set(95.4+Math.sin(titleTime*.07)*.8,2.95,95.9);camera.lookAt(104,5.2,37);
   tickTraffic(cars,p,world,dt,people);tickResidents(people,p,world,dt,titleTime);
  }else if(!game.menu){let remaining=dt;while(remaining>.0001){const step=Math.min(1/45,remaining);tick(step);remaining-=step}}
  sound.tick(game,dt);
  if(!game.menu||game.menu==='title'){lighting(game);renderer.render(scene,camera)}
  hudClock-=dt;if(hudClock<=0){hud();hudClock=.065}
 }
 requestAnimationFrame(frame);
}
function interact(){
 const where=serviceAt(p);if(where==='shop'||where==='home'){menus.open(where);return}
 if(where==='race'||where==='courier'){activity.start(where);return}
 if(!missions.m.active)missions.start();
}
addEventListener('keydown',e=>{
 if(e.target.tagName==='BUTTON'&&(e.code==='Enter'||e.code==='Space'))return;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code)&&e.code!=='Tab')e.preventDefault();
 if(!e.repeat){
  if(e.code==='Escape'){if(game.menu==='title')return;if(game.menu)menus.back();else menus.open('pause');hud();return}
  if(game.menu==='title'&&e.code==='Enter'){menus.act('story');hud();return}
  if(e.code==='KeyJ'||e.code==='KeyH'){if(game.menu==='choice')return;const name=e.code==='KeyJ'?'journal':'help';if(game.menu===name)menus.back();else menus.open(name);hud();return}
 }
 if(game.menu)return;keys.add(e.code);if(e.repeat)return;
 switch(e.code){
  case 'KeyE':{const result=enterOrExit(p,cars,world);game.notify(result);rig.reset();break}
  case 'KeyF':if(missions.stage()?.kind!=='hold'||!missions.m.active)interact();break;
  case 'KeyR':combat.refill();break;
  case 'KeyM':game.notify(sound.toggle()?'Audio muted':'Audio on');break;
  case 'KeyT':game.station=(game.station+1)%STATIONS.length;game.notify(STATIONS[game.station].name+' · '+STATIONS[game.station].band);break;
  default:if(/^Digit[1-4]$/.test(e.code)&&!combat.equip(Number(e.key)-1))game.notify('Available at Palma Motors');
 }
 hud();
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();combat.trigger(false)});
addEventListener('mousemove',e=>{if(game.menu)return;combat.setAim(e.clientX,e.clientY);if(e.buttons&2){if(p.car)rig.orbit(e.movementX,e.movementY);else{p.yaw+=e.movementX*.006;rig.orbit(0,e.movementY)}}});
canvas.addEventListener('mousedown',e=>{if(!game.menu&&e.button===0){combat.setAim(e.clientX,e.clientY);combat.trigger(true)}});
addEventListener('mouseup',()=>combat.trigger(false));addEventListener('contextmenu',e=>e.preventDefault());
menus.render();hud();requestAnimationFrame(frame);
// Browser playtests can pause wall time and exercise exactly the same simulation in fixed steps.
window.vela=Object.assign(game,{freeze(value=true){frozen=value},step(frames=1,draw=true){for(let i=0;i<frames;i++)tick(1/60);if(draw)render();else camera.updateMatrixWorld()},render,rig});
