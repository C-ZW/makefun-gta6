import {WEAPONS} from './weapons.js';
import {spawnVehicle,paints,VEHICLES,poseCar} from './vehicles.js';
export const RANKS=[[0,'Runner'],[18,'Wheelhand'],[36,'Fixer'],[72,'Insider'],[108,'Harbor ace'],[150,'Island legend']];
export const rankName=p=>RANKS.filter(([n])=>p.respect>=n).at(-1)[1];
export const COUNTER=[{id:'ammo',name:'Ammunition tin',info:'48 rounds for your sidearm',price:55},{id:'armor',name:'Harbor vest',info:'Restore armor to 100',price:130},{id:'repair',name:'Bodywork',info:'Restore vehicle condition',price:95},{id:'paint',name:'Lacquer coat',info:'Advance to the next island color',price:65},...WEAPONS.slice(1).map((w,i)=>({id:'w'+(i+1),name:w.name,info:w.clip+' round magazine',price:w.price,rank:w.rank}))];
export function collectRide(g,type){
 const p=g.p;if(!p.owned.includes(type))return;
 if(p.car?.type===type){g.close();return}
 if(p.car){p.car.role='parked';p.car.speed=0}
 let c=g.cars.find(c=>c.type===type&&c.role==='parked'&&c.health>0);
 const z=[56,61,66,71,76,81].find(z=>!g.cars.some(o=>o!==c&&Math.hypot(o.x+7.5,o.z-z)<4))??86;
 if(!c){c=spawnVehicle(g.scene,type,-7.5,z,0,paints[type]);g.cars.push(c)}
 Object.assign(c,{role:'player',x:-7.5,z,yaw:0,slip:0,lean:0,speed:0});poseCar(c,g.world);
 Object.assign(p,{car:c,x:c.x,z:c.z,yaw:0,y:0});p.model.visible=false;g.close();g.snap();g.notify(VEHICLES[type].name+' collected');
}
export function buyAtGarage(g,id){
 const item=COUNTER.find(s=>s.id===id),p=g.p;if(!item)return false;
 const say=text=>{g.notify(text);return false};if(p.respect<(item.rank||0))return say('Requires '+item.rank+' respect');
 if(id[0]==='w'&&p.weapons.includes(+id[1]))return say('Already in your kit');
 if((id==='repair'||id==='paint')&&!p.car)return say('Bring your vehicle into the garage');
 if(p.cash<item.price)return say('Insufficient cash');
 if(id==='ammo')p.ammo[p.weapon||1]+=48;
 if(id==='armor')p.armor=100;
 if(id==='repair')p.car.health=100;
 if(id==='paint'){const c=p.car,color=paints[(Math.max(0,paints.indexOf(c.color))+1)%paints.length],next=spawnVehicle(g.scene,c.type,c.x,c.z,c.yaw,color,'player');next.health=c.health;next.slip=c.yaw;next.lean=0;g.scene.remove(c.model);g.cars.splice(g.cars.indexOf(c),1,next);p.car=next}
 if(id[0]==='w'){const n=+id[1];p.weapons.push(n);p.mag[n]=WEAPONS[n].clip;p.ammo[n]+=WEAPONS[n].clip*2;g.combat.equip(n)}
 p.cash-=item.price;g.notify(item.name+' · purchased');return true;
}
