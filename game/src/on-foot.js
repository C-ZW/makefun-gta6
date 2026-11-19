import {createHuman,animateHuman} from './characters.js';
import {inside} from './vehicle-handling.js';
import {distance} from './districts.js';
export function streetPlayer(scene,x,z){return {x,z,yaw:0,y:0,car:null,model:createHuman(scene,0),walk:0,health:100,armor:35,cash:420,respect:0,owned:[],districts:[]}}
export function approachCar(p,cars){
 return cars.filter(c=>c.active&&c.health>0&&distance(c,p)<4.2&&Math.abs(c.speed)<13).sort((a,b)=>distance(p,a)-distance(p,b))[0];
}
export function enterOrExit(p,cars,world){
 if(p.car){const c=p.car;if(Math.abs(c.speed)>12)return 'Slow down to exit';let found=false;
   for(const k of [-1,1,-1.8,1.8]){const x=c.x+Math.cos(c.yaw)*1.8*k,z=c.z+Math.sin(c.yaw)*1.8*k;if(world.clear(x,z)&&inside(x,z)){p.x=x;p.z=z;found=true;break}}
   if(!found)return 'Door blocked';p.car=null;c.role='parked';c.speed=0;p.model.visible=true;return 'On foot';
 }
 const c=approachCar(p,cars);if(!c)return 'Move closer to a vehicle';
 if(c.role!=='parked'||!p.owned.includes(c.type))p.crime?.(c.role==='patrol'?2:1);
 c.role='player';p.car=c;c.slip=c.yaw;c.lean=0;p.yaw=c.yaw;p.model.visible=false;
 if(!p.owned.includes(c.type))p.owned.push(c.type);return 'At the wheel';
}
export function walkPlayer(p,keys,dt,world,aim=false){
 let move=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),side=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 const length=Math.hypot(move,side),pace=length?(keys.has('ShiftLeft')||keys.has('ShiftRight')?6.8:3.65):0;
 if(length){move/=length;side/=length;const dx=(Math.sin(p.yaw)*move+Math.cos(p.yaw)*side)*pace*dt,dz=(-Math.cos(p.yaw)*move+Math.sin(p.yaw)*side)*pace*dt;
   if(inside(p.x+dx,p.z)&&world.clear(p.x+dx,p.z))p.x+=dx;
   if(inside(p.x,p.z+dz)&&world.clear(p.x,p.z+dz))p.z+=dz;
 }
 p.y=world.height(p.x,p.z);p.model.position.set(p.x,p.y+.04,p.z);p.model.rotation.set(0,-p.yaw,0);p.walk+=dt*pace*2.8;animateHuman(p.model,p.walk,pace,aim);
}
