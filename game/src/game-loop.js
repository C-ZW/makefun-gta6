import {createDistrict} from './district.js';
import {createPolice,updatePolice,radio} from './police-pursuit.js';
import {updatePlayer,updateAmbient,enterOrExit} from './player-vehicles.js';
import {chooseBranch,interact,updateStory} from './story.js';
import {renderCity,unproject,camera} from './city-renderer.js';
import {updateHUD} from './hud-minimap.js';
import {startAudio,updateSound} from './sound.js';
function freshGame(){return {...createDistrict(),player:{x:300,y:740,a:0,hp:100,walk:0},car:null,health:100,money:250,time:0,stage:'meet',branch:null,delivered:false,completed:null,roadblocks:false,police:createPolice(),bullets:[],skids:[],cooldown:0,message:'IVO / Meet me by Palm Court. Gold marker. F to talk.',messageUntil:10,paused:true,choosing:false,aim:{x:400,y:740}};}
let s=freshGame();const input={keys:new Set(),firing:false,world:{x:400,y:740},mouse:{x:600,y:400}};
function resume(){s.paused=false;document.querySelector('#menu').classList.add('hidden');startAudio();}
document.querySelector('#start').onclick=()=>{s=freshGame();camera.x=s.player.x;camera.y=s.player.y;resume();};
document.querySelector('#continue').onclick=()=>{if(s.time>0&&s.paused){resume();return;}try{const data=JSON.parse(localStorage.getItem('sunbreak-save-v1'));if(data){s={...freshGame(),...data,car:null,paused:true};s.car=data.carIndex>=0?s.cars[data.carIndex]:null;camera.x=s.player.x;camera.y=s.player.y;resume();}else document.querySelector('#continue').textContent='NO SAVE YET — START A NEW STORY';}catch{document.querySelector('#continue').textContent='SAVE UNAVAILABLE — START A NEW STORY';}};
document.querySelector('#broadcast').onclick=()=>chooseBranch(s,'broadcast');document.querySelector('#sell').onclick=()=>chooseBranch(s,'sell');
function save(){try{const data={...s,car:null,carIndex:s.cars.indexOf(s.car),bullets:[],skids:[],choosing:false};localStorage.setItem('sunbreak-save-v1',JSON.stringify(data));radio(s,'SAVED / Your position, story, vehicles and heat are stored in this browser.');}catch{radio(s,'Save unavailable: browser storage is disabled.');}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();input.keys.add(k);if(e.repeat)return;if(k==='escape'){s.paused=!s.paused;document.querySelector('#menu').classList.toggle('hidden',!s.paused);document.querySelector('#continue').textContent='RESUME / CONTINUE';input.firing=false;return;}if(s.paused)return;if(s.choosing){if(k==='1')chooseBranch(s,'broadcast');if(k==='2')chooseBranch(s,'sell');return;}if(k==='e')enterOrExit(s);if(k==='f')interact(s);if(k==='k')save();});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{input.keys.clear();input.firing=false;});addEventListener('mousemove',e=>{input.mouse={x:e.clientX,y:e.clientY};});document.querySelector('#city').addEventListener('mousedown',e=>{if(e.button===0)input.firing=true;startAudio();});addEventListener('mouseup',()=>input.firing=false);addEventListener('contextmenu',e=>e.preventDefault());
let last=performance.now();function frame(now){const dt=Math.min(.033,(now-last)/1000);last=now;input.world=unproject(input.mouse.x,input.mouse.y);s.aim=input.world;if(!s.paused&&!s.choosing){s.time+=dt;updatePlayer(s,input,dt);updateAmbient(s,dt);updatePolice(s,dt);updateStory(s);}updateSound(s,dt);renderCity(s,dt);updateHUD(s);requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Read-only inspection for playtest evidence; no state setters or screenshot staging.
window.sunbreak={inspect:()=>JSON.parse(JSON.stringify({...s,car:s.car?s.cars.indexOf(s.car):null})),project:(x,y)=>({x:camera.w/2+(x-camera.x+(y-camera.y)*.18)*camera.zoom,y:camera.h*.52+(y-camera.y)*.72*camera.zoom})};
