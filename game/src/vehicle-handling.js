import {VEHICLES,poseCar} from './vehicles.js';
export function drive(c,keys,dt,world){
 const spec=VEHICLES[c.type],gas=keys.has('KeyW')||keys.has('ArrowUp'),brake=keys.has('KeyS')||keys.has('ArrowDown');
 const steer=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),skid=keys.has('Space');
 c.speed+=(gas?(c.speed<0?22:spec.pull):0)*dt-(brake?(c.speed>1?24:6.2):0)*dt;
 c.speed*=Math.exp(-(skid?1.15:gas||brake?.10:.49)*dt);
 c.speed=Math.max(-9,Math.min(spec.max*(c.health<30?.58:1),c.speed));
 c.yaw+=steer*spec.turn*Math.min(1,Math.abs(c.speed)/6)*Math.sign(c.speed)*(skid?1.55:1)/(1+Math.abs(c.speed)*.013)*dt;
 c.slip+=Math.atan2(Math.sin(c.yaw-c.slip),Math.cos(c.yaw-c.slip))*(1-Math.exp(-(skid?1.45:spec.grip)*dt));
 const x=c.x+Math.sin(c.slip)*c.speed*dt,z=c.z-Math.cos(c.slip)*c.speed*dt;
 c.scrape=Math.max(0,(c.scrape||0)-dt);
 if(!inside(x,z)||!world.clear(x,z,spec.w*.51)){
  if(!c.scrape&&Math.abs(c.speed)>4){c.health=Math.max(0,c.health-Math.abs(c.speed)*.42);c.scrape=.8}
  if(inside(x,c.z)&&world.clear(x,c.z,spec.w*.51)&&Math.abs(x-c.x)>.025){c.x=x;c.speed*=.93}
  else if(inside(c.x,z)&&world.clear(c.x,z,spec.w*.51)&&Math.abs(z-c.z)>.025){c.z=z;c.speed*=.93}else c.speed*=-.28;
 }
 else{c.x=x;c.z=z}
 c.lean+=(steer*Math.min(.085,Math.abs(c.speed)*.003)*(c.type===5?-3:1)-c.lean||0)*Math.min(1,dt*7);
 poseCar(c,world);
}
export function inside(x,z){return Math.abs(z)<159&&((x> -109&&x<127)||(x> -159&&x< -96&&Math.abs(z+96)<4.7))}
