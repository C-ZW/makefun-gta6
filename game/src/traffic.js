import {spawnVehicle,poseCar,paints} from './vehicles.js';
import {streetsX,streetsZ,distance,nearest} from './districts.js';
export function islandTraffic(scene){
 const cars=[],starts=[[0,3.5,72,0],[1,-4,82,Math.PI],[2,5.7,38,0],[3,-5.7,60,Math.PI],[4,8.7,103,0],[5,8.75,57,0]];
 for(const [type,x,z,yaw] of starts)cars.push(spawnVehicle(scene,type,x,z,yaw,paints[type]));
 for(let i=0;i<27;i++){
   const col=i%4,row=(i*5+3)%6,x=streetsX[col],z=streetsZ[row],reverse=i%3===0,lane=3;
   const path=reverse?[[x-lane,z-lane],[x-lane,z+48+lane],[x+48+lane,z+48+lane],[x+48+lane,z-lane]]:
     [[x+lane,z+lane],[x+48-lane,z+lane],[x+48-lane,z+48-lane],[x+lane,z+48-lane]];
   const edge=i%4,a=path[edge],b=path[(edge+1)%4],f=.15+((i*7)%11)/16;
   const car=spawnVehicle(scene,i%5,a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[0]-a[0],a[1]-b[1]),paints[(i+2)%6],'traffic');
   Object.assign(car,{path,node:(edge+1)%4,cruise:5+i%5,speed:4,wait:0});cars.push(car);
 }
 for(const [type,x,z,yaw] of [[0,99.3,89,0],[1,90.4,79,Math.PI],[4,101.8,51,0],[5,90,31,Math.PI],[2,-91,-83,0]])cars.push(spawnVehicle(scene,type,x,z,yaw,paints[(type+2)%6]));
 for(const [start,rev] of [[72,1],[33,0],[-15,1],[-80,0]]){const X=rev?93:99,Z=rev?142:-142,c=spawnVehicle(scene,rev?1:2,X,start,rev?Math.PI:0,rev?0x55a49a:0xdbad76,'traffic');c.path=[[X,Z],[rev?-92:93,Z],[rev?-92:93,-Z],[X,-Z]];c.node=0;c.cruise=7;c.speed=6;cars.push(c)}
 return cars;
}
export function tickTraffic(cars,p,world,dt){
 for(const c of cars){
  if(c.role!=='traffic'&&c.role!=='runner')continue;
  const t=c.path[c.node],dx=t[0]-c.x,dz=t[1]-c.z,dist=Math.hypot(dx,dz),fx=Math.sin(c.yaw),fz=-Math.cos(c.yaw);
  const obstacle=cars.some(o=>{if(o===c||o.role==='block'&&c.role==='runner')return false;const x=o.x-c.x,z=o.z-c.z,along=x*fx+z*fz;return along>0&&along<5&&Math.abs(x*fz-z*fx)<1.42});
  const pedestrian=!p.car&&distance(c,p)<3;
  const desired=obstacle||pedestrian?0:c.cruise;c.speed+=(desired-c.speed)*Math.min(1,dt*2.7);
  if(dist<1.6){c.node=(c.node+1)%c.path.length;continue}
  const y=Math.atan2(dx,-dz);c.yaw+=Math.atan2(Math.sin(y-c.yaw),Math.cos(y-c.yaw))*Math.min(1,dt*7);
  const step=Math.min(dist,dt*c.speed);c.x+=dx/dist*step;c.z+=dz/dist*step;c.slip=c.yaw;poseCar(c,world);
 }
}
export function interceptRoute(car){
 const X=nearest(car.x,streetsX),Z=nearest(car.z,streetsZ),x=X===96?48:X+48,z=Z===144?96:Z+48;
 car.path=[[X+3,Z+3],[x-3,Z+3],[x-3,z-3],[X+3,z-3]];car.node=1;car.cruise=9;car.role='runner';
}
