import * as T from '../vendor/three.module.min.js';
import { createAtmosphere } from './atmosphere.js';
import { thirdPersonCamera } from './camera.js';
import { keyboardMouse } from './controls.js';
import { buildBellcove } from './city-builder.js';

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
const hero = {x:160,z:105,yaw:0};
const world = buildBellcove(scene);
const fixed = 1/60;
function resize() {
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
resize();
addEventListener('resize',resize);
function step(dt) {
  const dx = Number(input.down('KeyD'))-Number(input.down('KeyA'));
  const dz = Number(input.down('KeyS'))-Number(input.down('KeyW'));
  const x = hero.x+dx*dt*8, z=hero.z+dz*dt*8;
  if (world.free(x,hero.z)) hero.x=x;
  if (world.free(hero.x,z)) hero.z=z;
  cameraRig.update(dt,hero,null,world,input);
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
cameraRig.update(fixed,hero,null,world,input);
atmosphere.tick(fixed,camera);
requestAnimationFrame(frame);
window.aftertide = { step(count=1) { for(let i=0;i<count;i++) step(fixed); renderer.render(scene,camera); }, hero, scene, camera, cameraRig, atmosphere, world };
