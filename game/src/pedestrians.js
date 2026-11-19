import { makeCharacter } from './characters.js';
import { randomFrom } from './scenery.js';

export const pedestrianStates = Object.freeze({walk:'WALKING',flee:'FLEEING',down:'INJURED'});

export function populateSidewalks(scene,world) {
  const rand=randomFrom(7489), people=[];
  const shirts=['#a05659','#3d8783','#e9c690','#698399','#74865d','#cf9272','#c9c4a2','#8d6384'];
  const skins=['#b98665','#d7a07d','#885a4c','#e6b28a','#ac714e'];
  const corridors=[
    [174,36,174,73,5], [176,82,176,142,5], [148,26,148,77,5],
    [190,-106,190,231,5], [174,-142,174,22,5], [149,-139,149,20,4],
    [94,89,146,89,4], [10,-72,68,-72,4], [-14,12,-14,71,4], [-54,-88,-10,-88,3],
    [92,171,147,171,3], [-144,-155,-91,-155,3],[-303,12,-241,12,3]
  ];
  for(const [x,z,toX,toZ,count] of corridors) for(let i=0;i<count;i++) {
    const t=(i+.22+rand()*.47)/count;
    const px=x+(toX-x)*t,pz=z+(toZ-z)*t;
    if(!world.free(px,pz,.29)) continue;
    const shirt=shirts[Math.floor(rand()*shirts.length)], skin=skins[Math.floor(rand()*skins.length)];
    const rig=makeCharacter(scene,{shirt,skin,hair:rand()>.4?'#372932':'#805c3e',pants:rand()>.38?'#34424b':'#ccae8b'});
    const scale=.86+rand()*.17; rig.group.scale.set(scale,scale,scale);
    const person={x:px,z:pz,yaw:0,rig,start:[x,z],end:[toX,toZ],dir:rand()>.5?0:1,speed:1.25+rand()*.67,state:pedestrianStates.walk,fear:0,health:50,fallClock:0};
    people.push(person);
    rig.pose(px,pz,0,0,0);
  }
  return {
    people,
    panic(x,z,radius=21) {
      for(const p of people) if(p.health>0&&Math.hypot(x-p.x,z-p.z)<radius) {
        p.fear=4+rand()*4;p.tx=x;p.tz=z;p.state=pedestrianStates.flee;
      }
    },
    harm(person,force) {
      person.health-=force;
      this.panic(person.x,person.z);
      if(person.health<=0){person.state=pedestrianStates.down;person.fallClock=15;}
    },
    update(dt,hero,crime) {
      for(const p of people) {
        const distance=Math.hypot(p.x-hero.x,p.z-hero.z);
        p.rig.group.visible=distance<112;
        if(p.health<=0) {
          p.fallClock-=dt;
          if(p.fallClock<0&&distance>44) { [p.x,p.z]=p.start;p.health=50;p.state=pedestrianStates.walk; }
          else { p.rig.pose(p.x,p.z,p.yaw,0,dt,false,true); continue; }
        }
        if(hero.car&&distance<4.9&&Math.abs(hero.car.speed)>6) {
          p.fear=5;p.tx=hero.x;p.tz=hero.z;p.state=pedestrianStates.flee;
          if(distance<1.48){this.harm(p,60); crime(.82);}
        }
        p.fear=Math.max(0,p.fear-dt);
        if(!p.fear&&p.health>0) p.state=pedestrianStates.walk;
        const [ax,az]=p.dir?p.end:p.start;
        const dx=p.fear?p.x-p.tx:ax-p.x, dz=p.fear?p.z-p.tz:az-p.z;
        const len=Math.hypot(dx,dz), speed=p.fear?4.8:p.speed;
        if(len<.55&&!p.fear) { p.dir=1-p.dir; continue; }
        const vx=dx/(len||1)*speed,vz=dz/(len||1)*speed;
        const px=p.x+vx*dt,pz=p.z+vz*dt;
        if(world.free(px,pz,.24)) {p.x=px;p.z=pz;}
        else if(p.fear) {
          if(world.free(p.x+vz*dt,p.z-vx*dt,.24)) {p.x+=vz*dt;p.z-=vx*dt;}
          else if(world.free(p.x-vz*dt,p.z+vx*dt,.24)) {p.x-=vz*dt;p.z+=vx*dt;}
        } else p.dir=1-p.dir;
        p.yaw=Math.atan2(-vx,-vz);
        p.rig.pose(p.x,p.z,p.yaw,speed,dt);
      }
    }
  };
}
