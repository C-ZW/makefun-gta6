import assert from 'node:assert/strict';
import {createDistrict,distance,lineClear,buildings} from '../game/src/district.js';
import {createPolice,updatePolice,reportCrime} from '../game/src/police-pursuit.js';
import {chooseBranch,interact,updateStory} from '../game/src/story.js';
import {updatePlayer,updateAmbient,enterOrExit} from '../game/src/player-vehicles.js';
globalThis.document={querySelector:()=>({classList:{add(){},remove(){}}})};
function start(){return {...createDistrict(),player:{x:300,y:740,a:0,hp:100},car:null,police:createPolice(),time:0,health:100,money:250,stage:'meet',cooldown:0,skids:[],bullets:[]};}
function step(s,keys=[],fire=false,world={x:1000,y:740}){const dt=1/60;s.time+=dt;const wasDriving=!!s.car;updatePlayer(s,{keys:new Set(keys),firing:fire,world},dt);updateAmbient(s,dt);updatePolice(s,dt);updateStory(s);if(wasDriving&&!s.car)console.log('EXIT',JSON.stringify({time:s.time,player:s.player,health:s.health,van:s.cars[0],message:s.message}));}
function drive(s,points){
 for(const [x,y] of points){let frames=0;
  while(frames++<3600){const c=s.car;assert(c,'Still driving');const d=Math.hypot(x-c.x,y-c.y);if(d<30)break;
   const err=Math.atan2(Math.sin(Math.atan2(y-c.y,x-c.x)-c.a),Math.cos(Math.atan2(y-c.y,x-c.x)-c.a));
   const desired=Math.min(c.max*.94,Math.sqrt(d*180),Math.abs(err)>.5?60:c.max),keys=[];
   if(c.speed<desired-4)keys.push('w');if(c.speed>desired+4)keys.push('s');if(err>.035)keys.push('d');if(err<-.035)keys.push('a');step(s,keys);
  }assert(frames<3600,`Reach ${x},${y}: ${JSON.stringify(s.car)}`);
 }
 for(let n=0;n<200&&Math.abs(s.car.speed)>3;n++)step(s,[s.car.speed>0?'s':'w']);
}
for(const branch of ['broadcast','sell']){
 const s=start();interact(s);assert(s.choosing);chooseBranch(s,branch);enterOrExit(s);assert.equal(s.stage,'deliver');assert.equal(s.car,s.cars[0]);
 drive(s,branch==='broadcast'?[[740,740],[1180,740],[1620,740],[1620,350]]:[[740,740],[1180,740],[1620,740],[2060,740],[2060,1180],[2060,1750]]);
 interact(s);assert(s.delivered,'Tape delivered');assert.equal(s.money,branch==='broadcast'?850:2050);if(branch==='sell')assert(s.roadblocks);
 if(branch==='broadcast'){drive(s,[[1620,300],[740,300],[740,620],[680,620]]);enterOrExit(s);}
 else {drive(s,[[2060,1180],[740,1180],[740,700],[780,690]]);enterOrExit(s);for(let i=0;i<40;i++)step(s,['w']);enterOrExit(s);console.log('switch',s.car?.name);drive(s,[[1180,740],[2060,740],[2060,300],[300,300],[300,580],[520,580]]);}
 for(let n=0;n<1200&&s.police.wanted;n++)step(s);
 console.log(branch,JSON.stringify({stage:s.stage,history:s.police.history,health:s.health,position:s.player}));
 assert.equal(s.stage,'done');assert.equal(s.completed,branch);assert(s.police.history.includes('pursuit'),'Witnessed getaway');assert(s.police.history.includes('clear'),'Escaped without being arrested');
}
const chase=start();reportCrime(chase);updatePolice(chase,1/60);assert.equal(chase.police.mode,'pursuit');
// A building must block sight; isolated scenario fixtures exercise the perception edge.
chase.player.x=520;chase.player.y=380;chase.police.units=[{...chase.police.units[0],x:520,y:600,a:-Math.PI/2}];assert(!lineClear(chase.player,chase.police.units[0]));
for(let i=0;i<110;i++)updatePolice(chase,1/60);assert.equal(chase.police.mode,'search');
chase.player.x=chase.police.units[0].x+35;chase.player.y=chase.police.units[0].y;updatePolice(chase,1/60);assert.equal(chase.police.mode,'pursuit');
const fight=start();fight.police.units[0].x=300;fight.police.units[0].y=640;const hp=fight.police.units[0].hp;step(fight,[],true,{x:300,y:640});assert(fight.police.units[0].hp<hp);assert(fight.police.wanted>0);assert(fight.people.some(p=>p.panic>0));assert(fight.bullets.length);
const handling=start();enterOrExit(handling);for(let i=0;i<60;i++)step(handling,['w']);const speed=handling.car.speed;assert(speed>60);for(let i=0;i<25;i++)step(handling,['s']);assert(handling.car.speed<speed/2);const angle=handling.car.a;for(let i=0;i<60;i++)step(handling,['w','d']);assert(Math.abs(handling.car.a-angle)>.5);
console.log('PASS: both stories, pursuit/search/reacquisition, shooting, pedestrian panic, theft, acceleration, braking, steering; '+buildings.length+' buildings.');
