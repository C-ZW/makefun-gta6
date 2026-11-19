import {landmarks} from './districts.js';
export const SIDE_JOBS={
 race:{name:'Strand Sprint',points:[[96,48],[96,-48],[48,-48],[48,96],[92,94]],limit:62,reward:390},
 courier:{name:'Night Mail',points:[[-48,0],[0,96],[96,43]],limit:80,reward:275}
};
export function islandActivities(g){
 return {active:'',stage:0,timer:0,records:{},start(id){
  if(g.missions.m.active||this.active){g.notify('Finish the current assignment first');return}
  if(!g.p.car){g.notify('Bring a vehicle to the starting line');return}
  this.active=id;this.stage=0;this.timer=SIDE_JOBS[id].limit;g.notify(SIDE_JOBS[id].name+' · follow the gold gates');
 },target(){return this.active?SIDE_JOBS[this.active].points[this.stage]:null},
 tick(dt){if(!this.active)return;const job=SIDE_JOBS[this.active],point=this.target();this.timer-=dt;
  if(this.timer<=0){this.active='';g.notify('Time expired · return to the starting line');return}
  if(!g.p.car||Math.hypot(g.p.x-point[0],g.p.z-point[1])>=6)return;
  if(++this.stage<job.points.length)return;const elapsed=job.limit-this.timer;this.records[this.active]=Math.min(this.records[this.active]??Infinity,elapsed);
  g.p.cash+=job.reward;g.p.respect+=9;g.notify(job.name+' · $'+job.reward+' · '+elapsed.toFixed(1)+' s');this.active='';
 }};
}
export function serviceAt(p){return Object.entries(landmarks).find(([key,a])=>key!=='park'&&Math.hypot(p.x-a[0],p.z-a[1])<6)?.[0]}
