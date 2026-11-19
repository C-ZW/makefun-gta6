import * as T from '../vendor/three.module.min.js';
import {spawnVehicle,poseCar} from './vehicles.js';
import {airWatch} from './helicopter.js';
import {wantedLevel,lineOfSight} from './wanted-level.js';
import {nearest,streetsX,streetsZ,distance} from './districts.js';
import {textureCanvas} from './geometry.js';
import {closeLanes} from './roadblocks.js';
export const PURSUIT_UNITS_BY_STAR=[0,1,2,3,3,4];
const flare=textureCanvas(48,48,c=>{const g=c.createRadialGradient(24,24,0,24,24,23);g.addColorStop(0,'#fff');g.addColorStop(.19,'#ffffffe0');g.addColorStop(.4,'#ffffff68');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,48,48)});
export function islandPolice(scene,cars,world){
 const heat=wantedLevel(scene),heli=airWatch(scene),units=[];let requested=0,blockSent=0;
 function dispatch(x,z,yaw,role){
  const c=spawnVehicle(scene,2,x,z,yaw,0x28404e,role);c.duty=role;c.ram=0;
  for(const k of [-1,1]){const f=new T.Sprite(new T.SpriteMaterial({map:flare,color:k<0?0x509fff:0xff4140,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));f.position.set(k*.42,1.62,0);f.scale.setScalar(1.9);c.model.add(f);(c.lamps||=[]).push(f)}
  if(role==='block'){c.barriers=closeLanes(c);c.barriers.rotation.y=c.yaw+(Math.abs(c.yaw)>1?0:Math.PI/2)}
  cars.push(c);units.push(c);return c;
 }
 function spawnNear(p,index,block=false){
  const onZ=Math.abs(p.x-nearest(p.x,streetsX))<Math.abs(p.z-nearest(p.z,streetsZ)),direction=onZ?-Math.sign(Math.cos(p.yaw)||1):Math.sign(Math.sin(p.yaw)||1);
  const offset=direction*(block?27+index*29:index===0?13:index===1?-13:22+index*2);
  let x=onZ?nearest(p.x,streetsX)+(index%2?4.6:-3):p.x+offset,z=onZ?p.z+offset:nearest(p.z,streetsZ)+(index%2?4.6:-3);
  x=Math.min(99,Math.max(-99,x));z=Math.min(147,Math.max(-147,z));
  return dispatch(x,z,block?(onZ?1.28:.29):Math.atan2(p.x-x,z-p.z),block?'block':'patrol');
 }
 dispatch(-2.9,-32,Math.PI,'patrol');
 function tick(p,dt,time){
  for(let i=units.length-1;i>=0;i--){const c=units[i];if(c.role!==c.duty){for(const f of c.lamps)f.visible=false;c.barriers?.removeFromParent();units.splice(i,1)}}
  if(!heat.level){requested=0;blockSent=0}
  const quota=PURSUIT_UNITS_BY_STAR[heat.level];
  if(heat.level&&heat.state==='IN SIGHT'&&requested<quota){spawnNear(p,requested);requested++}
  if(heat.level>=3&&blockSent<(heat.level===5?2:1)){spawnNear(p,blockSent,true);blockSent++}
  if(!heat.level&&units.length>3){const old=units.shift();old.active=false;scene.remove(old.model);cars.splice(cars.indexOf(old),1)}
  let seen=false;
  for(const [i,c] of units.entries()){
   const dist=distance(c,p);c.ram=Math.max(0,c.ram-dt);const active=heat.level>0;
   c.lamps.forEach((f,k)=>f.visible=active&&Math.floor(time*6+k+i)%2===0);
   if(!active){if(c.role==='block'){c.role='parked';c.speed=0}continue}
   const ahead=((p.x-c.x)*Math.sin(c.yaw)-(p.z-c.z)*Math.cos(c.yaw))/Math.max(1,dist);
   const sight=dist<(heat.level>=4?44:34)&&(dist<8||ahead>(heat.state==='SEARCHING'?.22:-.32))&&lineOfSight(c,p,world);
   if(sight)seen=true;
   if(c.role==='block'){if(dist<2.7&&p.car&&Math.abs(p.car.speed)>3&&c.ram===0){p.car.health=Math.max(0,p.car.health-12);p.car.speed*=-.24;c.ram=2}continue}
   let target=sight?p:heat.center;
   const roadX=nearest(target.x,streetsX),roadZ=nearest(target.z,streetsZ);
   if(Math.min(Math.abs(target.x-roadX),Math.abs(target.z-roadZ))>7){
    target=Math.abs(target.x-roadX)<Math.abs(target.z-roadZ)?{x:roadX+Math.sign(target.x-roadX)*6,z:target.z}:{x:target.x,z:roadZ+Math.sign(target.z-roadZ)*6};
   }
   if(!lineOfSight(c,target,world)){
    const cx=nearest(c.x,streetsX),cz=nearest(c.z,streetsZ),tx=nearest(target.x,streetsX),tz=nearest(target.z,streetsZ);
    if(Math.abs(c.x-cx)>5)target={x:tx,z:cz};else if(Math.abs(c.z-cz)>5)target={x:cx,z:tz};else target=Math.abs(tx-cx)>2?{x:tx,z:cz}:{x:cx,z:tz};
   }
   const desired=Math.atan2(target.x-c.x,c.z-target.z),diff=Math.atan2(Math.sin(desired-c.yaw),Math.cos(desired-c.yaw));
   c.yaw+=Math.sign(diff)*Math.min(Math.abs(diff),dt*(dist<8?2.5:1.8));
   const stop=p.car&&Math.abs(p.car.speed)<3?4.65:3.1;
   const max=heat.state==='SEARCHING'?5:heat.level>=3?15:11,speed=dist<stop||distance(c,target)<2.4?0:max*(Math.abs(diff)>1?.35:1);
   c.speed+=(speed-c.speed)*Math.min(1,dt*1.1);
   const x=c.x+Math.sin(c.yaw)*c.speed*dt,z=c.z-Math.cos(c.yaw)*c.speed*dt;
   const onRoad=Math.min(Math.abs(x-nearest(x,streetsX)),Math.abs(z-nearest(z,streetsZ)))<8.7;
   if(onRoad&&world.clear(x,z,.85)){c.x=x;c.z=z}poseCar(c,world);
   if(dist<2.8&&c.ram===0&&sight&&c.speed>2){c.ram=3.5;if(p.car){p.car.health=Math.max(0,p.car.health-(heat.level>=3?6:3));p.car.speed*=.89}else p.hurt?.(heat.level>=3?5:2)}
  }
  if(heat.level>=4&&heli.body.visible){const a=heli.body.position;if(distance(a,p)<8&&lineOfSight(a,p,world))seen=true}
  heat.track(seen,p,dt);heli.update(p,heat,dt,time);
 }
 function reset(){heat.clear();requested=0;blockSent=0;for(const c of units){if(c.role===c.duty){scene.remove(c.model);cars.splice(cars.indexOf(c),1)}}units.length=0;heli.body.visible=false}
 return {heat,units,heli,tick,reset};
}
