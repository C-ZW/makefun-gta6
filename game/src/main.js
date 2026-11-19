import * as T from '../vendor/three.module.min.js';
import { createAtmosphere } from './atmosphere.js';
import { thirdPersonCamera } from './camera.js';
import { keyboardMouse } from './controls.js';
import { buildBellcove } from './city-builder.js';
import { cast, makeCharacter } from './characters.js';
import { makeVehicle, vehicleCatalog } from './vehicles.js';
import { driveVehicle, moveOnFoot, nearestVehicle } from './vehicle-handling.js';
import { seedTraffic } from './traffic.js';
import { populateSidewalks } from './pedestrians.js';
import { createWantedLevel } from './wanted-level.js';
import { patrolNetwork } from './police.js';
import { missionDirector } from './missions.js';
import { createEffects } from './effects.js';
import { equipment } from './weapons.js';
import { createCombat } from './combat.js';
import { createHUD } from './hud.js';
import { createMenus } from './menus.js';
import { makoCounter } from './shop.js';
import { boathouseSafehouse } from './safehouse.js';
import { localCheckpoint } from './save.js';
import { signposts } from './districts.js';
import { createBellcoveAudio } from './audio.js';
import { synthRadio } from './radio.js';

export const gameTitle = 'Aftertide';

const viewport = document.getElementById('viewport');
const renderer = new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
viewport.append(renderer.domElement);
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(58, innerWidth/innerHeight, .12, 1450);
const cameraRig = thirdPersonCamera(camera);
const atmosphere = createAtmosphere(scene);
const input = keyboardMouse();
const hero = {x:175,z:73,yaw:0,vx:0,vz:0,car:null,cash:380,respect:0,health:100,armor:30,owned:new Set(),discovered:new Set(),model:makeCharacter(scene,cast.ren,true)};
const world = buildBellcove(scene);
const cars = Object.keys(vehicleCatalog).map((type,i)=>makeVehicle(scene,type,166.8,107+i*7.4,0,{parked:true}));
const nearby = makeVehicle(scene,'kestrel',164.5,90,0,{parked:true});
cars.push(nearby);
const traffic=seedTraffic(scene,cars);
const civilians=populateSidewalks(scene,world);
const wanted=createWantedLevel(scene);
const police=patrolNetwork(scene,world,wanted);
const report=(amount,floor)=>wanted.report(amount,hero.x,hero.z,floor);
const gear=equipment(), effects=createEffects(scene);
const hud=createHUD(document.getElementById('hud'),world);
const local=localCheckpoint();
const audio=createBellcoveAudio(), radio=synthRadio(audio);
let needsDraw=true;
const notify=(...args)=>{
  hud.notice(...args);
  needsDraw=true;
  if(args[0]==='COMPLETE') audio.sound('complete');
};
const shop=makoCounter(hero,gear,()=>{
  const here=signposts.shop;
  return nearestVehicle(here,cars.filter(car=>car.claimed),18);
},notify);
const safe=boathouseSafehouse(hero,save,notify);
let currentEnding=null;
let helpReturn='pause';
const debug=new URLSearchParams(location.search).has('debug');
let manual=debug, mode=debug?'play':'start';
function hurt(amount) {
  const absorbed=Math.min(hero.armor,amount*.76);
  hero.armor-=absorbed;hero.health=Math.max(0,hero.health-amount+absorbed);
  cameraRig.shake=.16;
}
const combat=createCombat(scene,world,hero,gear,civilians,effects,{report,hurt,sound:(...args)=>audio.sound(...args)});
const missions=missionDirector(scene,hero,{
  wanted,report,notice:notify,grant:id=>gear.grant(id),
  spawnEnemies:(p,n)=>combat.spawn(p,n),countEnemies:()=>combat.count(),
  dismissEnemies:()=>combat.dismiss(),checkpoint:save,
  ending:ending=>{currentEnding=ending;setMode('ending');}
});
const menus=createMenus(document.getElementById('overlay'),()=>({
  hero,missions,gear,shop,save:local,ending:currentEnding
}),menuAction);
let elapsed=0;
const fixed = 1/60;
const homeCars=cars.map(car=>({car,x:car.x,z:car.z,yaw:car.yaw,lane:car.lane?{...car.lane}:null,parked:car.parked,color:car.color,speed:car.speed}));
const contactModels=Object.fromEntries(Object.entries(cast).filter(([id])=>id!=='ren').map(([id,p])=>[id,makeCharacter(scene,p,true)]));
for(const model of Object.values(contactModels)) model.group.visible=false;
function save() {
  return local.write(hero,missions,gear,atmosphere);
}
function reset(snapshot=null) {
  for(const {car,...state} of homeCars) {
    Object.assign(car,{...state,lane:state.lane?{...state.lane}:null,claimed:false,damage:0,vx:0,vz:0,steer:0,contact:0});
    car.repaint(state.color);
  }
  Object.assign(hero,{car:null,vx:0,vz:0,recentCar:null});
  wanted.reset();combat.dismiss();
  missions.active=null;missions.stage=0;missions.currentAt=null;missions.subject=null;
  missions.message=null;missions.timer=null;missions.failure=null;missions.target.root.visible=false;
  gear.cooldown=0;gear.reload=0;
  local.restore(snapshot??{version:1},hero,missions,gear,atmosphere,world);
  cameraRig.yaw=hero.yaw;cameraRig.pitch=0;cameraRig.orbit=0;cameraRig.snap();
  if(snapshot?.parked?.type in vehicleCatalog) {
    const parked=snapshot.parked;
    const car=cars.find(c=>c.type===parked.type&&c.parked);
    if(car) {
      const poses=[[hero.x-3.6,hero.z+1.5],[hero.x+3.6,hero.z],[hero.x,hero.z-5.6]];
      const pose=poses.find(([x,z])=>world.free(x,z,2.5));
      if(pose) [car.x,car.z]=pose;
      if(Number.isInteger(parked.color)) car.repaint(parked.color);
      car.damage=Number.isFinite(parked.damage)?Math.max(0,Math.min(100,parked.damage)):0;
      car.claimed=true;hero.recentCar=car;
    }
  }
}
function lock() {
  if(!manual&&mode==='play'&&!document.pointerLockElement) {
    try {renderer.domElement.requestPointerLock()?.catch(()=>{});} catch {}
  }
}
function setMode(next) {
  mode=next;
  needsDraw=true;
  if(next!=='play'&&document.pointerLockElement) document.exitPointerLock();
  input.fire=false;input.aim=false;
  menus.render(next);
}
function menuAction(action) {
  if(action==='new') {reset();setMode('play');lock();}
  else if(action==='load') {
    const state=local.read();
    if(state) {reset(state);setMode('play');notify('CHECKPOINT','Welcome back, Ren','Local story progress restored');lock();}
  } else if(action==='resume') {
    if(mode==='controls') setMode(helpReturn);
    else if(mode==='choice') return;
    else {setMode('play');lock();}
  } else if(action==='title') setMode('start');
  else if(action==='controls') {helpReturn=mode;setMode('controls');}
  else if(action==='journal') setMode('journal');
  else if(action==='save') {
    const stored=save();setMode('play');lock();
    notify('CHECKPOINT',stored?'Progress saved':'Save unavailable',stored?'Cash, gear and completed jobs recorded':'Check browser storage');
  } else if(action.startsWith('choose-')) {
    if(missions.choose(action.slice(7))) {setMode('play');lock();}
  } else if(action.startsWith('buy-')) {
    shop.buy(action.slice(4));menus.render(mode);
  } else if(action.startsWith('paint-')) {
    shop.buy('paint',Number(action.slice(6)));menus.render(mode);
  }
}
renderer.domElement.addEventListener('click',lock);
addEventListener('pointerdown',()=>audio.start(),{passive:true});
addEventListener('keydown',()=>audio.start());
let locked=false;
addEventListener('pointerlockchange',()=>{
  if(locked&&!document.pointerLockElement&&mode==='play') setMode('pause');
  locked=!!document.pointerLockElement;
});
function menuKeys() {
  if(mode==='start'&&input.take('Enter')) {menuAction(local.read()?'load':'new');return;}
  if(mode==='choice') {
    if(input.take('Digit1')) menuAction('choose-broadcast');
    if(input.take('Digit2')) menuAction('choose-bargain');
    return;
  }
  if(input.take('KeyJ')&&(mode==='play'||mode==='journal')) {setMode(mode==='play'?'journal':'play');return;}
  if(!input.take('Escape')) return;
  if(mode==='play') setMode('pause');
  else if(mode!=='start') menuAction('resume');
}
function resize() {
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  needsDraw=true;
}
resize();
addEventListener('resize',resize);
function step(dt) {
  menuKeys();
  if(mode!=='play') {input.end();return;}
  elapsed+=dt;
  if(input.take('KeyQ')) {
    const station=radio.cycle();
    if(!hero.car) notify('BELLCOVE RADIO',station,'Q TO TUNE');
  }
  if(input.take('KeyF')&&!missions.interact()) {
    if(safe.nearby()&&!wanted.stars) safe.use();
    else if(!hero.car&&Math.hypot(hero.x-signposts.shop.x,hero.z-signposts.shop.z)<6.3) setMode('shop');
  }
  if (input.take('KeyE')) {
    if (hero.car) {
      const car=hero.car;
      for(const side of [1,-1]) {
        const x=car.x+Math.cos(car.yaw)*side*(car.model.w+1);
        const z=car.z-Math.sin(car.yaw)*side*(car.model.w+1);
        if(Math.abs(car.speed)<9&&world.free(x,z,.42)) {
          hero.x=x;hero.z=z;hero.car=null;hero.recentCar=car;car.parked=true;
          car.speed=car.vx=car.vz=hero.vx=hero.vz=0; break;
        }
      }
    } else {
      hero.car=nearestVehicle(hero,cars);
      if(hero.car) {
        hero.car.parked=false; hero.car.lane=null; hero.owned.add(hero.car.type);
        if(!hero.car.claimed) {
          if(missions.current?.vehicle!==hero.car.type) report(.68);
          hero.car.claimed=true;notify('VEHICLE ACQUIRED',hero.car.model.name,hero.car.model.kind+' added to the journal');
        }
      }
    }
  }
  cameraRig.update(dt,hero.car??hero,hero.car,world,input);
  if(hero.car) {
    const car=hero.car;
    if(driveVehicle(car,input,world,dt)) {
      cameraRig.shake=.17;effects.impact(car.x, .55,car.z,6);audio.sound('impact');
    }
    if(input.down('Space')&&Math.abs(car.speed)>7&&Math.floor(elapsed*15)!==Math.floor((elapsed-dt)*15)) effects.dust(car.x,car.z+.65,1.7);
    for(const other of cars) {
      if(other===car||car.contact>0||Math.abs(car.speed)<4) continue;
      if(Math.hypot(car.x-other.x,car.z-other.z)<(car.model.w+other.model.w)*.53) {
        car.contact=.51;car.damage=Math.min(100,car.damage+Math.abs(car.speed)*.37);
        car.speed*=-.21;car.vx*=-.24;car.vz*=-.24;
        other.speed*=.71;cameraRig.shake=.20;effects.impact((car.x+other.x)/2,.52,(car.z+other.z)/2,7);
        report(.13);
      }
    }
    hero.x=hero.car.x;hero.z=hero.car.z;hero.yaw=hero.car.yaw;
  } else {
    const speed=moveOnFoot(hero,input,cameraRig,world,dt);
    const aim=input.aim||input.fire;
    hero.model.pose(hero.x,hero.z,hero.yaw,speed,dt,aim);
    hero.model.gun.visible=aim&&gear.slot>0;
    hero.model.gun.scale.z=[.10,.28,.49,.68][gear.slot];
  }
  hero.model.group.visible=!hero.car||hero.car.type==='dart';
  if(hero.car?.type==='dart') {
    hero.model.pose(hero.x,hero.z+.02,hero.yaw,0,dt,true);
    hero.model.rig.position.y=.3;
    hero.model.rig.rotation.x=.36;
    hero.model.gun.visible=false;
  }
  traffic.update(dt,elapsed,hero);
  civilians.update(dt,hero,report);
  police.update(dt,elapsed,hero,hurt,atmosphere.hour>19);
  missions.update(dt,elapsed);
  if(missions.current?.type==='choice'&&missions.started) {
    input.pressed.delete('Digit1');input.pressed.delete('Digit2');
    setMode('choice');
  }
  combat.update(dt,elapsed,input,camera);
  effects.update(dt);
  if(hero.health<=0) {
    missions.fail('Ren was taken down'); wanted.reset(); combat.dismiss();
    if(hero.car) {hero.car.parked=true;hero.car.speed=0;hero.car=null;}
    hero.x=179;hero.z=100;hero.health=100;hero.armor=0;hero.cash=Math.max(0,hero.cash-145);cameraRig.snap();
  }
  cars.forEach(car=>{
    car.root.visible=car===hero.car||Math.hypot(hero.x-car.x,hero.z-car.z)<157;
    car.sync(dt,elapsed);
  });
  for(const [id,model] of Object.entries(contactModels)) {
    const target=missions.targetPoint();
    const isContact=(!missions.active||missions.current?.type==='interact')&&missions.contact?.contact===id&&target;
    model.group.visible=!!isContact&&Math.hypot(target.x-hero.x,target.z-hero.z)<83;
    if(model.group.visible) {
      const x=target.x+1.2,z=target.z;
      model.pose(x,z,Math.atan2(x-hero.x,z-hero.z),0,dt);
    }
  }
  hero.discovered.add(world.districtAt(hero.x,hero.z).name);
  atmosphere.tick(dt,camera);
  input.end();
}
function draw() {
  needsDraw=false;
  camera.updateMatrixWorld();
  audio.update(elapsed,hero,police,mode==='play',mode==='play'&&input.down('KeyW'));
  radio.update(mode==='play'&&!!hero.car,wanted.stars?.74:1);
  hud.update({hero,missions,wanted,police,gear,combat,input,atmosphere,traffic,world,camera,elapsed,cars,radio,mode});
  renderer.render(scene,camera);
}
let last=0, bank=0;
function frame(ms) {
  requestAnimationFrame(frame);
  if(manual) return;
  bank += Math.min(.08,(ms-last)/1000);
  last=ms;
  while (bank >= fixed) { step(fixed); bank-=fixed; }
  if(mode==='play'||needsDraw) draw();
}
hero.model.pose(hero.x,hero.z,hero.yaw,0,0);
cameraRig.update(fixed,hero,null,world,input);
atmosphere.tick(fixed,camera);
setMode(mode);
draw();
requestAnimationFrame(frame);
if(debug) window.aftertide = {
  step(count=1,render=true) {for(let i=0;i<count;i++) step(fixed);if(render) draw();},
  draw, setMode, menuAction, save, reset, get mode(){return mode;}, auto(value){manual=!value;},
  hero,scene,camera,cameraRig,atmosphere,world,input,cars,renderer,traffic,civilians,wanted,police,report,missions,combat,gear,effects,shop,audio,radio
};
