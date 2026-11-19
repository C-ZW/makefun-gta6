import {createHuman,animateHuman} from './characters.js';
import {distance} from './districts.js';
export function walkingResidents(scene){
 const people=[];
 for(let i=0;i<54;i++){
   const X=i<12?0:((i*7)%5-2)*48,Z=i<12?48+Math.floor(i/6)*48:((i*11)%6-3)*48;
   const x=X+(i%2?10:-10),z=Z+12+(i*3.7)%23;
   const model=createHuman(scene,1+i%6);const npc={x,z,homeZ:Z+24,direction:i%3?1:-1,model,phase:i*1.47,health:50,fear:0,kind:'resident'};
   model.position.set(x,0,z);people.push(npc);
 }
 return people;
}
export function tickResidents(people,p,world,dt,time){
 for(const n of people){const dist=distance(n,p);n.model.visible=dist<95;if(!n.model.visible)continue;
   if(n.health<=0){n.model.rotation.z=1.45;n.model.position.y=.2;continue}
   if(p.car&&Math.abs(p.car.speed)>7&&dist<6)n.fear=4;
   if(p.car&&Math.abs(p.car.speed)>5&&dist<1.45){n.health=0;p.crime?.(1);continue}
   n.fear=Math.max(0,n.fear-dt);
   const pace=n.fear?3.9:.75+(n.phase%1)*.35;
   if(n.fear&&dist<9)n.direction=n.z>=p.z?1:-1;
   else if(n.z>n.homeZ+13)n.direction=-1;else if(n.z<n.homeZ-13)n.direction=1;
   n.z+=dt*pace*n.direction;n.model.position.set(n.x,.17,n.z);n.model.rotation.y=n.direction>0?Math.PI:0;
   n.phase+=dt*pace*4;animateHuman(n.model,n.phase,pace);
 }
}
