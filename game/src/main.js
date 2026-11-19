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
const hero = {x:175,z:93,yaw:0,vx:0,vz:0,car:null,owned:new Set(),model:makeCharacter(scene,cast.ren,true)};
const world = buildBellcove(scene);
const cars = Object.keys(vehicleCatalog).map((type,i)=>makeVehicle(scene,type,166.8,107+i*7.4,0,{parked:true}));
const nearby = makeVehicle(scene,'kestrel',164.5,90,0,{parked:true});
cars.push(nearby);
const traffic=seedTraffic(scene,cars);
const civilians=populateSidewalks(scene,world);
let elapsed=0;
const fixed = 1/60;
function resize() {
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
resize();
addEventListener('resize',resize);
function step(dt) {
  elapsed+=dt;
  if (input.take('KeyE')) {
    if (hero.car) {
      const car=hero.car;
      for(const side of [1,-1]) {
        const x=car.x+Math.cos(car.yaw)*side*(car.model.w+1);
        const z=car.z-Math.sin(car.yaw)*side*(car.model.w+1);
        if(Math.abs(car.speed)<9&&world.free(x,z,.42)) {
          hero.x=x;hero.z=z;hero.car=null;car.parked=true;
          car.speed=car.vx=car.vz=hero.vx=hero.vz=0; break;
        }
      }
    } else {
      hero.car=nearestVehicle(hero,cars);
      if(hero.car) {
        hero.car.parked=false; hero.car.lane=null; hero.owned.add(hero.car.type);
      }
    }
  }
  cameraRig.update(dt,hero.car??hero,hero.car,world,input);
  if(hero.car) {
    if(driveVehicle(hero.car,input,world,dt)) cameraRig.shake=.17;
    hero.x=hero.car.x;hero.z=hero.car.z;hero.yaw=hero.car.yaw;
  } else {
    const speed=moveOnFoot(hero,input,cameraRig,world,dt);
    hero.model.pose(hero.x,hero.z,hero.yaw,speed,dt,input.aim||input.fire);
  }
  hero.model.group.visible=!hero.car||hero.car.type==='dart';
  if(hero.car?.type==='dart') {
    hero.model.pose(hero.x,hero.z+.02,hero.yaw,0,dt,true);
    hero.model.rig.position.y=.3;
    hero.model.rig.rotation.x=.36;
    hero.model.gun.visible=false;
  }
  traffic.update(dt,elapsed,hero);
  civilians.update(dt,hero,()=>{});
  cars.forEach(car=>{
    car.root.visible=car===hero.car||Math.hypot(hero.x-car.x,hero.z-car.z)<157;
    car.sync(dt,elapsed);
  });
  atmosphere.tick(dt,camera);
  input.end();
}
let last=0, bank=0;
function frame(ms) {
  bank += Math.min(.08,(ms-last)/1000);
  last=ms;
  while (bank >= fixed) { step(fixed); bank-=fixed; }
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
hero.model.pose(hero.x,hero.z,hero.yaw,0,0);
cameraRig.update(fixed,hero,null,world,input);
atmosphere.tick(fixed,camera);
requestAnimationFrame(frame);
window.aftertide = { step(count=1) { for(let i=0;i<count;i++) step(fixed); renderer.render(scene,camera); }, hero, scene, camera, cameraRig, atmosphere, world, input, cars, renderer, traffic, civilians };
