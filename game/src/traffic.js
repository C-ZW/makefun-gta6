import { makeVehicle, vehicleCatalog } from './vehicles.js';
import { randomFrom } from './scenery.js';

export const trafficLoops = [
  [[163,-159],[163,163],[77,163],[77,-159]],
  [[157,156],[157,-164],[83,-164],[83,156]],
  [[-77,-81],[-77,82],[-163,82],[-163,-81]],
  [[-3,156],[-3,-84],[83,-84],[83,156]],
  [[3,-162],[3,162],[-83,162],[-83,-162]],
  [[-157,237],[-157,-237],[-3,-237],[-3,237]]
];

const turns = (a,b,c,d,t) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t*t*t*d;
function lanePath(points) {
  const dots=[];
  for(let i=0;i<points.length;i++) {
    const [x,z]=points[i], [nx,nz]=points[(i+1)%points.length], [px,pz]=points[(i+points.length-1)%points.length];
    const before=Math.hypot(px-x,pz-z),after=Math.hypot(nx-x,nz-z);
    const [a,b]=[x+(px-x)*6/before,z+(pz-z)*6/before];
    const [c,d]=[x+(nx-x)*6/after,z+(nz-z)*6/after];
    for(let j=0;j<8;j++) dots.push([turns(a,x,x,c,j/8),turns(b,z,z,d,j/8)]);
    dots.push([c,d]);
  }
  let length=0;
  const segments=dots.map(([x,z],i)=>{
    const [nx,nz]=dots[(i+1)%dots.length], size=Math.hypot(nx-x,nz-z);
    const section={x,z,nx,nz,start:length,size}; length+=size;
    return section;
  });
  return {
    length,
    point(distance) {
      const t=((distance%length)+length)%length;
      const s=segments.find(v=>t<v.start+v.size)??segments.at(-1);
      const f=(t-s.start)/s.size;
      return [s.x+(s.nx-s.x)*f,s.z+(s.nz-s.z)*f];
    }
  };
}

export function seedTraffic(scene,cars) {
  const rand=randomFrom(91151), models=Object.keys(vehicleCatalog);
  const paint=[0xb4c2b2,0x5791a4,0xc89a69,0x853f4a,0xd5bc97,0x779481,0x627882,0xe9dfbd];
  const moving=[];
  for(let i=0;i<trafficLoops.length;i++) {
    const path=lanePath(trafficLoops[i]);
    const count=i<2?5:4;
    for(let j=0;j<count;j++) {
      const s=(j+.18+(i%2)*.13)*path.length/count;
      const [x,z]=path.point(s);
      const car=makeVehicle(scene,models[(j+i*3)%models.length],x,z,0,{color:paint[(j+2*i)%paint.length]});
      car.lane={path,s,pace:9+rand()*6};
      car.speed=car.lane.pace;
      cars.push(car); moving.push(car);
    }
  }
  for(const [type,x,z,yaw] of [
    ['gull',76.8,143,0],['pica',154.7,59,0],['brasa',165,31,0],['mesa',153.6,-39,Math.PI],
    ['dart',153,-90,Math.PI],['pica',75,45,0],['mesa',-76,-107,0],['gull',-157,23,Math.PI]
  ]) cars.push(makeVehicle(scene,type,x,z,yaw,{parked:true}));
  return {
    moving,
    update(dt,time,hero) {
      for(const car of moving) {
        if (!car.lane||car===hero.car||car.parked) continue;
        const lane=car.lane,[ax,az]=lane.path.point(lane.s+2.7);
        const yaw=Math.atan2(car.x-ax,car.z-az);
        const sx=-Math.sin(yaw),sz=-Math.cos(yaw);
        const isInLane=(x,z) => {
          const dx=x-car.x,dz=z-car.z, front=sx*dx+sz*dz;
          return front>-.25&&front<8 && Math.abs(dx*sz-dz*sx)<1.87;
        };
        const obstructed=(hero.car||hero.model.group.visible)&&isInLane(hero.x,hero.z) ||
          cars.some(other=>other!==car&&other!==hero.car&&isInLane(other.x,other.z));
        const turning=Math.abs(Math.atan2(Math.sin(yaw-car.yaw),Math.cos(yaw-car.yaw)));
        let pace=obstructed?0:lane.pace;
        if(turning>.115) pace=Math.min(6.8,pace);
        const cross=(Math.abs(car.x%80)<11||Math.abs(car.x%80)>69)&&(Math.abs(car.z%80)<15||Math.abs(car.z%80)>65);
        if(cross&&Math.abs(Math.sin(yaw))>.65&&time%13>7.5) pace*=.48;
        car.speed+=(pace-car.speed)*(1-Math.exp(-dt*(obstructed?5:1.7)));
        lane.s+=car.speed*dt;
        [car.x,car.z]=lane.path.point(lane.s);
        car.yaw=yaw;
      }
    }
  };
}
