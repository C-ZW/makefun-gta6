import {spawnVehicle} from './vehicles.js';
export const SAVE_SLOT='sunbreak.port-vela.checkpoint.1';
const inventory=['health','armor','cash','respect','owned','districts','weapons','ammo','mag','weapon'];
export function safehouse(g){
 function save(heal=false){
  const {p,missions,activity}=g;if(heal){p.health=100;p.armor=Math.max(35,p.armor)}
  const m=missions.m,c=p.car,heat=g.police.heat;
  const data={version:1,p:Object.fromEntries(inventory.map(k=>[k,p[k]])),x:p.x,z:p.z,yaw:p.yaw,clock:g.time,radio:g.station,
   car:c?{type:c.type,color:c.color,health:c.health}:null,story:{index:m.index,stage:m.stage,active:m.active,completed:m.completed,branch:m.branch,timer:m.timer,hold:m.hold,failed:m.failed,ending:m.ending},
   pursuit:{level:heat.level,state:heat.state,timer:heat.timer,center:heat.center},foes:m.enemies.map(e=>({health:e.health,x:e.x,z:e.z})),runner:m.runner?{x:m.runner.x,z:m.runner.z,node:m.runner.node}:null,activities:{records:activity.records,active:activity.active,stage:activity.stage,timer:activity.timer}};
  try{localStorage.setItem(SAVE_SLOT,JSON.stringify(data));g.notify(heal?'Safehouse · healed and saved':'Checkpoint saved');return true}catch{g.notify('Storage unavailable');return false}
 }
 function restore(){
  let d;try{d=JSON.parse(localStorage.getItem(SAVE_SLOT))}catch{return false}if(d?.version!==1||!d.p)return false;
  const {p,missions,police}=g;missions.dispose();g.close();if(p.car){p.car.role='parked';p.car.speed=0}
  Object.assign(p,d.p,{x:d.x,z:d.z,yaw:d.yaw,car:null});if(d.car){
   let c=g.cars.find(c=>c.type===d.car.type&&c.color===d.car.color&&Math.hypot(c.x-d.x,c.z-d.z)<7);
   if(!c){c=spawnVehicle(g.scene,d.car.type,d.x,d.z,d.yaw,d.car.color);g.cars.push(c)}
   Object.assign(c,{x:d.x,z:d.z,yaw:d.yaw,slip:d.yaw,lean:0,speed:0,health:d.car.health,role:'player'});p.car=c;
  }
  p.model.visible=!p.car;g.combat.equip(p.weapon);
  Object.assign(g.activity,d.activities);g.time=d.clock;g.station=d.radio||0;
  missions.restore(d.story,d.foes,d.runner);police.reset();
  Object.assign(police.heat,d.pursuit,{lost:d.pursuit.state==='SEARCHING'?2:0,cooldown:0});g.snap();g.notify('Checkpoint restored');return true;
 }
 return {save,restore,available(){try{return !!localStorage.getItem(SAVE_SLOT)}catch{return false}}};
}
