import * as T from '../vendor/three.module.min.js';
import { makeVehicle } from './vehicles.js';
import { createAirSupport } from './helicopter.js';
import { nearestTo, streetRoute } from './navigation.js';
import { avenues, streets } from './districts.js';

export const policeDispatch = [
  {rank:1,unit:'PATROL',type:'patrol'}, {rank:2,unit:'PATROL',type:'patrol'},
  {rank:3,unit:'INTERCEPTOR',type:'interceptor'}, {rank:4,unit:'INTERCEPTOR',type:'interceptor'},
  {rank:5,unit:'INTERCEPTOR',type:'interceptor'}
];

export function patrolNetwork(scene,world,wanted) {
  const units=policeDispatch.map((spec,i)=>{
    const car=makeVehicle(scene,spec.type,0,0,0);
    car.root.visible=false;
    return {car,spec,active:false,id:i,wait:0,timer:0};
  });
  const air=createAirSupport(scene), barriers=new T.Group(), cones=[];
  const box=new T.BoxGeometry(1,1,1), coneGeo=new T.ConeGeometry(.24,.64,8);
  const orange=new T.MeshBasicMaterial({color:0xf38054}), cream=new T.MeshBasicMaterial({color:0xffd894});
  const steel=new T.MeshStandardMaterial({color:0x344451});
  const part=(g,m,x,y,z,w,h,d)=>{
    const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);barriers.add(mesh);return mesh;
  };
  for(let i=0;i<6;i++) {
    const x=-7.1+i*1.48;
    part(coneGeo,orange,x,.32,0,1,1,1);part(box,cream,x,.31,0,.18,.099,.18);
    part(box,steel,x,.039,0,.47,.076,.44);
    cones.push(x);
  }
  for(const x of [-5.3,-1.4]) part(box,steel,x,.5,.18,.14,1.0,.21);
  for(let i=0;i<8;i++) part(box,i%2?orange:cream,-5.61+i*.69,1.06,.18,.67,.34,.17).rotation.z=.11;
  part(box,orange,-6.2,1.36,.18,.29,.29,.2);
  part(box,orange,-.61,1.36,.18,.29,.29,.2);
  scene.add(barriers);barriers.visible=false;
  const roadblock={active:false,x:0,z:0,vertical:true,time:0};
  function spawn(unit,hero) {
    const {car,id}=unit;
    const forwardX=-Math.sin(hero.yaw),forwardZ=-Math.cos(hero.yaw);
    const vertical=Math.abs(forwardZ)>=Math.abs(forwardX);
    const ahead=id===1||id===4;
    const offset=ahead ? (id===1?31:55) : (-13-id*7);
    const across=id%2?3.6:-3.7;
    if(vertical) {
      car.x=nearestTo(avenues,hero.x)+across;
      car.z=T.MathUtils.clamp(hero.z+Math.sign(forwardZ||-1)*offset,-245,245);
    } else {
      car.x=T.MathUtils.clamp(hero.x+Math.sign(forwardX||-1)*offset,-183,177);
      car.z=nearestTo(streets,hero.z)+across;
    }
    if(id===2&&Math.hypot(hero.x-car.x,hero.z-car.z)<11) car.z+=19;
    car.yaw=Math.atan2(car.x-hero.x,car.z-hero.z);
    car.speed=0;car.damage=0;car.contact=0;unit.active=true;unit.wait=0;unit.timer=0;
    car.root.visible=true;
  }
  function positionBarrier(hero) {
    const vertical=Math.abs(Math.cos(hero.yaw))>=Math.abs(Math.sin(hero.yaw));
    const loc=vertical ? hero.z : hero.x;
    const dir=vertical ? -Math.cos(hero.yaw) : -Math.sin(hero.yaw);
    const at=nearestTo(vertical?streets:avenues,loc+Math.sign(dir)*52);
    roadblock.vertical=vertical;roadblock.time=0;
    roadblock.x=vertical?nearestTo(avenues,hero.x):at;
    roadblock.z=vertical?at:nearestTo(streets,hero.z);
    barriers.position.set(roadblock.x,0,roadblock.z);
    barriers.rotation.y=vertical?0:Math.PI/2;
  }
  return {
    units,air,roadblock,barriers,
    update(dt,time,hero,hurt,night=false) {
      let seen=false, count=0;
      const active=wanted.stars>0;
      for(const unit of units) {
        const {car,id,spec}=unit;
        if(!active||wanted.stars<spec.rank) {
          car.root.visible=false;unit.active=false;continue;
        }
        if(!unit.active) spawn(unit,hero);
        let distance=Math.hypot(car.x-hero.x,car.z-hero.z);
        if(distance>145&&wanted.state==='IN SIGHT'&&wanted.unseen<.1&&Math.hypot(wanted.x-hero.x,wanted.z-hero.z)<12) {
          spawn(unit,hero); distance=Math.hypot(car.x-hero.x,car.z-hero.z);
        }
        const open=distance<59&&world.lineClear(car.x,car.z,hero.x,hero.z);
        if(open&&distance<(spec.type==='patrol'?39:49)) seen=true;
        const searching=wanted.state==='SEARCHING';
        const dst=open ? {x:hero.x+(hero.car?hero.car.vx*.24:0),z:hero.z+(hero.car?hero.car.vz*.24:0)}
          : {x:wanted.x+(searching?Math.sin(time*.33+id*1.9)*20:0),z:wanted.z+(searching?Math.cos(time*.33+id*1.9)*20:0)};
        let tx=dst.x,tz=dst.z;
        if(!open) {
          const route=streetRoute(car,dst,world).slice(1);
          const point=route.find(([x,z])=>Math.hypot(x-car.x,z-car.z)>2.6 && world.lineClear(car.x,car.z,x,z))??[dst.x,dst.z];
          [tx,tz]=point;
        }
        const goal=Math.atan2(car.x-tx,car.z-tz);
        const turn=Math.atan2(Math.sin(goal-car.yaw),Math.cos(goal-car.yaw));
        const boost=spec.type==='interceptor';
        const desired = (boost?31:23)*(1-Math.min(Math.abs(turn)*.28,.79))*(wanted.state==='SEARCHING'?.60:1);
        car.speed+=(desired-car.speed)*(1-Math.exp(-dt*1.35));
        car.yaw+=T.MathUtils.clamp(turn,-dt*2.8,dt*2.8);
        car.steer=T.MathUtils.clamp(turn,-1,1);
        const dx=-Math.sin(car.yaw)*car.speed*dt,dz=-Math.cos(car.yaw)*car.speed*dt;
        const free=world.free(car.x+dx*4,car.z+dz*4,.84);
        if(free){car.x+=dx;car.z+=dz;unit.wait=0;}
        else {
          unit.wait+=dt;car.speed*=.955;
          if(world.free(car.x-dx,car.z-dz,.88)){car.x-=dx*.82;car.z-=dz*.82;}
          car.yaw+=dt*1.22*(id%2?1:-1);
          if(unit.wait>4.8&&distance>33&&wanted.state==='IN SIGHT') spawn(unit,hero);
        }
        unit.timer=Math.max(0,unit.timer-dt);
        if(open&&distance<(hero.car?2.65:1.38)&&!unit.timer) {
          unit.timer=1.65;car.speed*=.41;
          if(hero.car) {
            hero.car.speed*=boost?.71:.84;
            hero.car.damage=Math.min(100,hero.car.damage+(boost?9:4));
          } else hurt(boost?14:8);
        }
        const flash=time+id*.13;
        car.sync(dt,flash);count++;
      }
      if(wanted.stars>=4) {
        if(!roadblock.active||
          (Math.hypot(hero.x-roadblock.x,hero.z-roadblock.z)>101&&roadblock.time>4.5)) positionBarrier(hero);
        roadblock.active=true; barriers.visible=true; roadblock.time+=dt;
        if(hero.car&&hero.car.contact<=0) {
          const dx=hero.x-roadblock.x,dz=hero.z-roadblock.z;
          const across=roadblock.vertical?dx:-dz, along=roadblock.vertical?dz:dx;
          if(across>-8.2&&across<.72&&Math.abs(along)<1.23&&Math.abs(hero.car.speed)>3){
            hero.car.damage=Math.min(100,hero.car.damage+12);hero.car.speed*=-.32;
            hero.car.vx*=-.35;hero.car.vz*=-.35;hero.car.contact=.54;
          }
        }
      } else {roadblock.active=false;barriers.visible=false;}
      air.update(dt,hero,wanted,night);
      wanted.update(dt,hero,seen||air.sees(hero,world),time);
      this.count=wanted.stars?count:0;
    },
    count:0
  };
}
