import * as T from '../vendor/three.module.min.js';
import {spawnVehicle,poseCar} from './vehicles.js';
import {airWatch} from './helicopter.js';
import {wantedLevel,lineOfSight} from './wanted-level.js';
import {nearest,streetsX,streetsZ,distance} from './districts.js';
import {textureCanvas} from './geometry.js';
const flare=textureCanvas(48,48,c=>{const g=c.createRadialGradient(24,24,0,24,24,23);g.addColorStop(0,'#fff');g.addColorStop(.19,'#ffffffe0');g.addColorStop(.4,'#ffffff68');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,48,48)});
export function islandPolice(scene,cars,world){
 const heat=wantedLevel(scene),heli=airWatch(scene),units=[];let requested=0,blockSent=false;
 function dispatch(x,z,yaw,role){
  const c=spawnVehicle(scene,2,x,z,yaw,0x28404e,role);c.duty=role;c.ram=0;
  for(const k of [-1,1]){const f=new T.Sprite(new T.SpriteMaterial({map:flare,color:k<0?0x509fff:0xff4140,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));f.position.set(k*.42,1.62,0);f.scale.setScalar(1.9);c.model.add(f);(c.lamps||=[]).push(f)}
  cars.push(c);units.push(c);return c;
 }
 function spawnNear(p,index,block=false){
  const onZ=Math.abs(p.x-nearest(p.x,streetsX))<Math.abs(p.z-nearest(p.z,streetsZ)),direction=onZ?-Math.sign(Math.cos(p.yaw)||1):Math.sign(Math.sin(p.yaw)||1);
  const offset=direction*(block?27:index===0?13:index===1?-13:22+index*2);
  let x=onZ?nearest(p.x,streetsX)+(index%2?4.6:-3):p.x+offset,z=onZ?p.z+offset:nearest(p.z,streetsZ)+(index%2?4.6:-3);
  x=Math.min(99,Math.max(-99,x));z=Math.min(147,Math.max(-147,z));
  return dispatch(x,z,block?(onZ?1.28:.29):Math.atan2(p.x-x,z-p.z),block?'block':'patrol');
 }
 dispatch(-2.9,-32,Math.PI,'patrol');
 function tick(p,dt,time){
  for(let i=units.length-1;i>=0;i--){const c=units[i];if(c.role!==c.duty){for(const f of c.lamps)f.visible=false;units.splice(i,1)}}
  if(!heat.level){requested=0;blockSent=false}
  if(heat.level&&heat.state==='IN SIGHT'&&requested<Math.min(3,heat.level)){spawnNear(p,requested);requested++}
  if(heat.level>=3&&!blockSent){spawnNear(p,0,true);blockSent=true}
  if(!heat.level&&units.length>3){const old=units.shift();old.active=false;scene.remove(old.model);cars.splice(cars.indexOf(old),1)}
  let seen=false;
  for(const [i,c] of units.entries()){
   const dist=distance(c,p);c.ram=Math.max(0,c.ram-dt);const active=heat.level>0;
   c.lamps.forEach((f,k)=>f.visible=active&&Math.floor(time*6+k+i)%2===0);
   if(!active){if(c.role==='block'){c.role='parked';c.speed=0}continue}
   const sight=dist<(heat.level>=4?45:34)&&lineOfSight(c,p,world);
   if(sight)seen=true;
   if(c.role==='block'){if(dist<2.7&&p.car&&Math.abs(p.car.speed)>3&&c.ram===0){p.car.health=Math.max(0,p.car.health-12);p.car.speed*=-.24;c.ram=2}continue}
   let target=sight?p:heat.center;
   if(!lineOfSight(c,target,world)){
    const cx=nearest(c.x,streetsX),cz=nearest(c.z,streetsZ),tx=nearest(target.x,streetsX),tz=nearest(target.z,streetsZ);
    if(Math.abs(c.x-cx)>5)target={x:tx,z:cz};else if(Math.abs(c.z-cz)>5)target={x:cx,z:tz};else target=Math.abs(tx-cx)>2?{x:tx,z:cz}:{x:cx,z:tz};
   }
   const desired=Math.atan2(target.x-c.x,c.z-target.z),diff=Math.atan2(Math.sin(desired-c.yaw),Math.cos(desired-c.yaw));
   c.yaw+=Math.sign(diff)*Math.min(Math.abs(diff),dt*(dist<8?2.5:1.8));
   const max=heat.state==='SEARCHING'?5:heat.level>=3?15:11,speed=dist<3.1||distance(c,target)<2.4?0:max*(Math.abs(diff)>1?.35:1);
   c.speed+=(speed-c.speed)*Math.min(1,dt*1.1);
   const x=c.x+Math.sin(c.yaw)*c.speed*dt,z=c.z-Math.cos(c.yaw)*c.speed*dt;
   if(world.clear(x,z,.85)){c.x=x;c.z=z}poseCar(c,world);
   if(dist<2.4&&c.ram===0&&sight){c.ram=3.5;if(p.car){p.car.health=Math.max(0,p.car.health-(heat.level>=3?8:3));p.car.speed*=.89}else p.hurt?.(heat.level>=3?7:3)}
  }
  if(heat.level>=4&&heat.state==='IN SIGHT'&&heli.body.visible){const a=heli.body.position;if(distance(a,p)<30&&lineOfSight(a,p,world))seen=true}
  heat.track(seen,p,dt);heli.update(p,heat,dt,time);
 }
 function reset(){heat.clear();requested=0;blockSent=false;for(const c of units){if(c.role===c.duty){scene.remove(c.model);cars.splice(cars.indexOf(c),1)}}units.length=0;heli.body.visible=false}
 return {heat,units,heli,tick,reset};
}
