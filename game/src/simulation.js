import {home,air,ferry,gate,dist,clamp,vehicles,walkers,car,createFleet,obstacle,sight,streetsX,streetsY} from './district.js';
import {ping} from './sound.js';
export const keys=new Set(), s={};
export const actor=()=>s.ride===null?s.foot:vehicles[s.ride];
export const destination=()=>s.branch==='air'?air:ferry;
export const gateOpen=()=>s.branch==='air';
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function reset(){
 createFleet();Object.assign(s,{mode:'title',foot:{...home,a:0},ride:null,phase:'pickup',branch:'',heat:'clear',timer:0,blind:0,pin:0,clock:0,
 cop:car(52,-6,0,'#ddd2bb','police'),last:{...home},msg:'',msgTime:0,cash:0,wanted:false,trail:[],shove:0,bumps:0});
}
export function say(text,seconds=4){s.msg=text;s.msgTime=seconds}
export function start(){s.mode='play';say('Nix left the reel in the orange Kestrel.',5)}
export function choose(branch){
 s.reportTime=0;s.branch=branch;s.phase='run';s.wanted=true;s.mode='play';ping(660);
 say(branch==='air'?'NIX  /  Union opened the striped yard gate.':'VALE  /  Cash at the east ferry. Come alone.',5);
}
export function interact(vehicleOnly=false){
 if(s.mode!=='play')return;
 if(!vehicleOnly&&s.phase==='drop'&&dist(actor(),destination())<22){
 if(Math.abs(actor().v||0)>10)return say('Brake to hand over the reel.');
 s.phase='done';s.deliveryTime=s.clock;s.cash+=s.branch==='air'?80:900;ping(880);
 say(s.branch==='air'?'ON AIR  /  Every dock hears the stolen payroll tape.':'PAID IN FULL  /  The last ferry takes the only copy.',8);save(false);return;
 }
 if(s.ride!==null){
 let c=actor();if(Math.abs(c.v)>16)return say('Slow down to get out.');
 for(let a of [c.a+Math.PI/2,c.a-Math.PI/2,c.a+Math.PI,c.a]){
 let x=c.x+Math.cos(a)*9,y=c.y+Math.sin(a)*9;
 if(!obstacle(x,y,2,gateOpen())){s.foot={x,y,a:c.a};s.ride=null;c.v=c.vx=c.vy=0;return}
 }return;
 }
 let n=vehicles.reduce((best,v,i)=>dist(v,s.foot)<dist(vehicles[best],s.foot)?i:best,0);
 if(dist(vehicles[n],s.foot)>16)return say('Walk up to a car door.');
 s.ride=n;vehicles[n].stolen=true;
 if(n===0&&s.phase==='pickup'){s.mode='choice';ping(520)}
 else if(n>0){s.wanted=true;say('Vehicle theft reported. Watch for harbor patrol.')}
}
export function save(announce=true){
 try{localStorage.setItem('lowtide-4',JSON.stringify({state:{...s,mode:'play',trail:[]},cars:vehicles}));if(announce)say('Tape deck  /  Progress saved.');return true}catch{return false}
}
export function resumeSave(){try{const q=JSON.parse(localStorage.getItem('lowtide-4'));if(!q||!q.state||!q.cars?.length)return false;Object.assign(s,q.state);vehicles.splice(0,vehicles.length,...q.cars);return true}catch{return false}}
function move(o,dx,dy,r){
 let hit=false;
 if(!obstacle(o.x+dx,o.y,r,gateOpen()))o.x+=dx;else hit=true;
 if(!obstacle(o.x,o.y+dy,r,gateOpen()))o.y+=dy;else hit=true;
 return hit;
}
function drive(c,dt){
 const gas=keys.has('w')||keys.has('arrowup'),brake=keys.has('s')||keys.has('arrowdown');
 const turn=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 const slide=keys.has(' ');
 c.steer+=(turn-c.steer)*(1-Math.exp(-8*dt));
 let force=gas?(c.v<0?65:39*(1-Math.max(c.v,0)/94)):0;
 if(brake)force-=c.v>1?82:22;
 c.v+=force*dt;c.v=Math.sign(c.v)*Math.max(0,Math.abs(c.v)-(3.6+.035*Math.abs(c.v)+(slide?22:0))*dt);
 c.v=clamp(c.v,-23,94);
 c.a+=c.steer*Math.sign(c.v)*Math.min(1,Math.abs(c.v)/11)*(slide?2.85:2.05)/(1+Math.abs(c.v)*.006)*dt;
 const grip=1-Math.exp(-(slide?2.2:7.5)*dt);
 c.vx+=(Math.cos(c.a)*c.v-c.vx)*grip;c.vy+=(Math.sin(c.a)*c.v-c.vy)*grip;
 if(move(c,c.vx*dt,c.vy*dt,4)){if(Math.abs(c.v)>20)ping(95);c.v*=Math.exp(-11*dt);c.vx*=.85;c.vy*=.85}
 if(slide&&Math.abs(c.v)>17&&s.clock-(s.trail.at(-1)?.t??-1)>.05)s.trail.push({x:c.x,y:c.y,a:c.a,t:s.clock});
 for(let other of vehicles){if(other===c||dist(c,other)>8)continue;
 const a=Math.atan2(c.y-other.y,c.x-other.x);move(c,Math.cos(a)*1.3,Math.sin(a)*1.3,4);c.v*=.87;other.wait=1.2}
}
function patrolTarget(c,p){
 // Choose a clear corner along the shortest visible street route.
 if(sight(c,p))return p;
 let corners=streetsX.flatMap(x=>streetsY.map(y=>({x,y})));
 let costs=corners.map(n=>sight(n,p)?dist(n,p):Infinity);
 for(let k=0;k<6;k++)for(let i=0;i<corners.length;i++)for(let j=0;j<i;j++){
 let a=corners[i],b=corners[j];if(a.x!==b.x&&a.y!==b.y)continue;
 const d=dist(a,b);costs[i]=Math.min(costs[i],costs[j]+d);costs[j]=Math.min(costs[j],costs[i]+d);
 }
 let best=null,score=Infinity;
 corners.forEach((n,i)=>{let v=dist(c,n)+costs[i];if(dist(c,n)>5&&v<score&&sight(c,n)){best=n;score=v}});
 return best||p;
}
function patrol(dt){
 const c=s.cop,p=actor(),d=dist(c,p),bearing=Math.atan2(p.y-c.y,p.x-c.x);
 const seen=s.wanted&&d<(s.heat==='chase'?112:91)&&sight(c,p)&&(s.heat==='chase'||d<40||Math.abs(angleDiff(bearing,c.a+(s.heat==='search'?Math.sin(s.clock*2.5)*.45:0)))<1.13);
 if(seen){s.last={x:p.x,y:p.y};s.blind=0;if(s.heat!=='chase'){say(s.heat==='search'?'PATROL  /  Visual regained!':'PATROL  /  Orange channel, visual contact!');ping(270)}s.heat='chase'}
 else if(s.heat==='chase'&&(s.blind+=dt)>.85){s.heat='search';s.timer=10;say('DISPATCH  /  Lost visual. Sweep the last corner.');ping(410)}
 if(s.heat==='search'&&(s.timer-=dt)<=0){s.heat='clear';s.wanted=false;s.pin=0;if(s.phase==='run')s.phase='drop';say('DISPATCH  /  Call off the sweep. Channel clear.');ping(830)}
 if(s.phase==='run'&&s.heat==='clear'&&s.wanted){s.reportTime=(s.reportTime||0)+dt;
 if(s.reportTime>12&&dist(p,home)>100){s.wanted=false;s.phase='drop';say('NIX  /  No visual on the car. Bring the reel in.')}}
 const loop=[{x:2,y:-6},{x:653,y:-6},{x:653,y:174},{x:2,y:174}];
 let goal=s.heat==='clear'?(s.wanted&&s.phase==='run'?home:loop[c.next??1]):s.heat==='chase'&&seen?p:s.last;
 if(s.heat==='clear'&&dist(c,goal)<5)c.next=((c.next??1)+1)%4;
 if(s.heat==='search'&&dist(c,goal)<9){c.a+=dt*.85;c.v=0}
 else {
 let aim=patrolTarget(c,goal);
 // The cruiser follows the street up to an alley mouth before taking the tight turn.
 const streetX=streetsX.reduce((x,n)=>Math.abs(n-c.x)<Math.abs(x-c.x)?n:x);
 const streetY=streetsY.reduce((y,n)=>Math.abs(n-c.y)<Math.abs(y-c.y)?n:y);
 const onEW=Math.abs(c.y-streetY)<15,onNS=Math.abs(c.x-streetX)<15;
 if(s.heat==='chase'&&sight(c,goal)){
 if(onEW&&!onNS&&Math.abs(goal.y-streetY)>24&&Math.abs(c.x-goal.x)>8)aim={x:goal.x,y:c.y};
 if(onNS&&!onEW&&Math.abs(goal.x-streetX)>24&&Math.abs(c.y-goal.y)>8)aim={x:c.x,y:goal.y};
 }
 let a=Math.atan2(aim.y-c.y,aim.x-c.x);
 c.a+=clamp(angleDiff(a,c.a),-dt*1.7,dt*1.7);
 let speed=s.heat==='chase'?clamp(20+d*.17,20,39):s.heat==='search'?19:12;
 if(!onEW&&!onNS)speed*=.65;
 c.v+=(speed-c.v)*Math.min(1,dt*3);
 if(Math.abs(angleDiff(a,c.a))<1.25)move(c,Math.cos(c.a)*c.v*dt,Math.sin(c.a)*c.v*dt,3);
 }
 if(s.heat==='chase'&&d<10){s.pin+=dt;if(s.pin>3){
 s.mode='caught';s.pin=0;ping(100);
 }}else s.pin=Math.max(0,s.pin-dt*2);
}
export function retry(){
 const branch=s.branch;reset();start();if(branch){s.ride=0;choose(branch)}
}
export function shove(){
 if(s.ride!==null||s.mode!=='play'||s.shove>0)return;
 s.shove=.55;let w=walkers.find(w=>dist(w,s.foot)<12);
 if(w){let a=Math.atan2(w.y-s.foot.y,w.x-s.foot.x);move(w,Math.cos(a)*3,Math.sin(a)*3,1);
 w.dir=w.x>=s.foot.x?1:-1;w.stagger=.45;w.flee=5;s.wanted=true;say('Disturbance reported on the quay.');ping(125)}
}
export function tick(dt){
 if(s.mode!=='play')return;s.clock+=dt;s.msgTime-=dt;s.shove=Math.max(0,s.shove-dt);
 if(s.ride!==null)drive(actor(),dt);
 else{
 let h=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 let v=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(h||v){let a=Math.atan2(v,h)-.58;s.foot.a=a;let speed=keys.has('shift')?24:15;move(s.foot,Math.cos(a)*dt*speed,Math.sin(a)*dt*speed,2)}
 }
 vehicles.forEach((c,i)=>{if(!c.route||c.stolen||i===s.ride)return;
 if(c.wait>0){c.wait-=dt;return}
 let p=c.route[c.next],d=dist(c,p);if(d<1){c.next=(c.next+1)%4;return}
 c.a=Math.atan2(p.y-c.y,p.x-c.x);c.x+=Math.cos(c.a)*dt*c.cruise;c.y+=Math.sin(c.a)*dt*c.cruise;
 });
 for(let w of walkers){w.stagger=Math.max(0,(w.stagger||0)-dt);
 if(s.ride!==null&&Math.abs(actor().v)>13&&dist(w,actor())<15){w.flee=2;w.dir=w.x>=actor().x?1:-1}
 w.flee=Math.max(0,(w.flee||0)-dt);w.x+=w.dir*(w.flee?13:2.4)*dt;if(w.x<w.origin||w.x>w.origin+160)w.dir=(w.x<w.origin?1:-1)}
 s.trail=s.trail.filter(p=>s.clock-p.t<8);patrol(dt);
}
reset();
