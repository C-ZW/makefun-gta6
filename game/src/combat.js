import * as T from '../vendor/three.module.min.js';
import {WEAPONS,heldWeapon} from './weapons.js';
import {createHuman,animateHuman} from './characters.js';
import {distance} from './districts.js';
import {lineOfSight} from './wanted-level.js';
import {sculpture,ink} from './geometry.js';
export function streetCombat(g){
 const {p,scene,camera,world}=g,ray=new T.Raycaster(),aim=new T.Vector2(0,0),foes=[],drops=[],tracers=[];
 Object.assign(p,{weapon:1,weapons:[0,1],ammo:[0,60,0,0],mag:[0,12,0,0],shots:0});
 let gun=heldWeapon(p.model,1),cool=0,flash=0,reload=0,firing=false,lastSlot=1;
 function equip(slot){if(!p.weapons.includes(slot))return false;p.weapon=slot;reload=0;if(lastSlot!==slot){gun.removeFromParent();gun=heldWeapon(p.model,slot);lastSlot=slot}return true}
 function refill(){const slot=p.weapon;if(!slot||reload||p.mag[slot]>=WEAPONS[slot].clip||p.ammo[slot]<=0)return;reload=1.05;g.notify?.('Reloading '+WEAPONS[slot].name)}
 function drop(x,z,kind){
  const s=sculpture(),col=kind==='armor'?0x74d6d1:kind==='ammo'?0xffce76:0x89ddb1;
  s.box(0,0,0,.62,.47,.33,0x315555);if(kind==='health'){s.box(0,0,.18,.10,.34,.03,col,undefined,ink);s.box(0,0,.18,.34,.1,.03,col,undefined,ink)}
  else for(let i=-1;i<2;i++)s.box(i*.135,0,.18,.066,.30,.035,col,undefined,ink);
  const model=s.finish(scene);model.position.set(x,.72,z);drops.push({x,z,kind,model});
 }
 for(const [x,z,kind] of [[8,61,'ammo'],[-45,-75,'armor'],[92,5,'health'],[-49,-91,'ammo']])drop(x,z,kind);
 function gang(point){
  return [[-2,-2],[3,-6],[.8,-10]].map(([dx,dz],i)=>{
   let x=point[0]+dx,z=point[1]+dz;if(!world.clear(x,z)){x=point[0];z=point[1]}
   const model=createHuman(scene,7);heldWeapon(model,1);const e={x,z,model,health:68,phase:i*8,shoot:2+i,kind:'crew'};model.position.set(x,0,z);foes.push(e);return e;
  });
 }
 function dismiss(list){for(const e of list){scene.remove(e.model);const i=foes.indexOf(e);if(i>=0)foes.splice(i,1)}}
 function streak(from,to,c){
   const delta=to.clone().sub(from),geo=new T.CylinderGeometry(.018,.030,delta.length(),5),mat=new T.MeshBasicMaterial({color:c});
   const beam=new T.Mesh(geo,mat);beam.position.copy(from).lerp(to,.5);beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());scene.add(beam);tracers.push({beam,ttl:.105});
   const flare=new T.Mesh(new T.OctahedronGeometry(.18,0),new T.MeshBasicMaterial({color:0xffbd5a}));flare.scale.set(1.15,1.75,.85);flare.position.copy(from).addScaledVector(delta,.24);flare.quaternion.copy(beam.quaternion);scene.add(flare);tracers.push({beam:flare,ttl:.085});
 }
 function fire(){
  if(cool>0||reload>0||g.menu)return false;const slot=p.weapon,w=WEAPONS[slot];if(slot&&!p.mag[slot]){refill();return false}
  cool=w.cool;flash=.24;if(slot)p.mag[slot]--;p.shots++;g.sound?.shot(slot);ray.setFromCamera(aim,camera);
  let hit=null,best=Infinity;
  for(const n of [...foes,...g.people,...g.cars]){
   if(n===p.car||n.health<=0)continue;const isCar=n.type!==undefined,far=distance(p,n);
   if(far>w.range||!lineOfSight(p,n,world))continue;
   const center=new T.Vector3(n.x,isCar?.75:1.0,n.z),near=ray.ray.closestPointToPoint(center,new T.Vector3()),off=near.distanceTo(center);
   const eligible=slot?off<(isCar?1.35:slot===3?.99:.79):far<2.7;
   if(eligible&&far<best){hit=n;best=far}
  }
  const dest=hit?new T.Vector3(hit.x,hit.type!==undefined?.75:1.12,hit.z):ray.ray.at(w.range,new T.Vector3());
  const origin=new T.Vector3(p.x+Math.cos(p.yaw)*.29+Math.sin(p.yaw)*.78,1.32,p.z+Math.sin(p.yaw)*.29-Math.cos(p.yaw)*.78);
  if(slot)streak(origin,dest,slot===3?0xffb962:0xffe6a4);
  if(hit){hit.health=Math.max(0,hit.health-w.damage);if(hit.kind==='crew'&&!hit.health){drop(hit.x,hit.z,'ammo');p.cash+=45}
   if(hit.role==='patrol'||hit.duty==='patrol')p.crime(3);if(hit.kind==='resident')p.crime(2)}
  if(slot){for(const n of g.people)if(distance(n,p)<25)n.fear=6;const underFire=foes.some(e=>e.health>0&&distance(e,p)<35);if((!hit||hit.kind!=='crew')&&!underFire)p.crime(1)}
  return true;
 }
 function hurt(n){const absorb=Math.min(n,p.armor);p.armor-=absorb;p.health=Math.max(0,p.health-n+absorb);g.lastHit=.4}
 p.hurt=hurt;
 function tick(dt,time){
  cool=Math.max(0,cool-dt);flash=Math.max(0,flash-dt);if(firing&&(p.weapon===2||p.weapon===0))fire();
  if(reload>0){reload-=dt;if(reload<=0){const i=p.weapon,n=Math.min(WEAPONS[i].clip-p.mag[i],p.ammo[i]);p.mag[i]+=n;p.ammo[i]-=n}}
  gun.visible=!p.car&&(flash>0||foes.length>0||firing);
  if(gun.visible)animateHuman(p.model,p.walk,0,true);
  for(const e of foes){if(e.health<=0){e.model.rotation.z=1.5;e.model.position.y=.19;continue}
   const d=distance(e,p),visible=d<40&&lineOfSight(e,p,world);if(!visible)continue;
   const dx=(p.x-e.x)/Math.max(1,d),dz=(p.z-e.z)/Math.max(1,d),pace=d>10?1.7:.45;
   const x=e.x+(dx*pace+dz*Math.sin(time+e.phase)*.65)*dt,z=e.z+(dz*pace-dx*Math.sin(time+e.phase)*.65)*dt;
   if(world.clear(x,z)){e.x=x;e.z=z}e.model.position.set(e.x,0,e.z);e.model.rotation.y=-Math.atan2(dx,-dz);animateHuman(e.model,time*4+e.phase,pace,true);
   e.shoot-=dt;if(e.shoot<=0){e.shoot=1.95+e.phase*.045;streak(new T.Vector3(e.x,1.35,e.z),new T.Vector3(p.x,1.15,p.z),0xff8462);if(p.car)p.car.health=Math.max(0,p.car.health-2);else hurt(4);g.sound?.enemyShot()}
  }
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.model.rotation.y=time*1.4;d.model.position.y=.7+Math.sin(time*2+d.x)*.10;
   if(distance(p,d)>1.7||p.car)continue;if(d.kind==='ammo')p.ammo[p.weapon||1]+=18;else if(d.kind==='armor')p.armor=Math.min(100,p.armor+35);else p.health=Math.min(100,p.health+35);
   g.notify?.('Picked up '+d.kind);scene.remove(d.model);drops.splice(i,1);
  }
  for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.ttl-=dt;if(t.ttl<=0){scene.remove(t.beam);t.beam.geometry.dispose();t.beam.material.dispose();tracers.splice(i,1)}}
 }
 return {foes,gang,dismiss,drop,equip,fire,refill,tick,aim,get flashing(){return flash>0},resetInput(){cool=0;flash=0;reload=0;firing=false},trigger(on){firing=on;if(on)fire()},setAim(x,y){aim.set(x/innerWidth*2-1,1-y/innerHeight*2)}};
}
