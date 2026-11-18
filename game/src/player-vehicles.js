import {distance,moveBody,solid,lineClear} from './district.js';
import {reportCrime,radio} from './police-pursuit.js';
import {tone} from './sound.js';
export function enterOrExit(s){
 if(s.car){if(Math.abs(s.car.speed)>75){radio(s,'Slow down before stepping out.');return;}const c=s.car;for(const side of [1,-1]){const x=c.x-Math.sin(c.a)*44*side,y=c.y+Math.cos(c.a)*44*side;if(!solid(x,y)){s.player.x=x;s.player.y=y;s.car=null;c.speed=0;return;}}return;}
 const c=s.cars.filter(c=>c.hp>0&&distance(c,s.player)<85).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];
 if(c){s.car=c;c.ai=false;c.speed=0;c.stolen=true;s.player.x=c.x;s.player.y=c.y;reportCrime(s,1);tone(180,.12);if(c===s.cars[0]&&s.stage==='steal'){s.stage='deliver';radio(s,'IVO / Tape secured. Patrol ahead! Turn twice to break their sight.');}else radio(s,'Vehicle stolen / '+c.name);}
}
export function updatePlayer(s,input,dt){
 const k=input.keys,c=s.car;
 if(c){const throttle=(k.has('w')||k.has('arrowup')?1:0)-(k.has('s')||k.has('arrowdown')?1:0),steer=(k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0),brake=k.has(' ');
  if(throttle){const opposing=Math.sign(throttle)!==Math.sign(c.speed)&&Math.abs(c.speed)>8;c.speed+=throttle*(opposing?280:c.accel)*dt;}else c.speed*=Math.exp(-dt*.7);
  if(brake)c.speed*=Math.exp(-dt*2.2);c.speed=Math.max(-95,Math.min(c.max,c.speed));
  c.a+=steer*c.grip*Math.min(1,Math.abs(c.speed)/90)*Math.sign(c.speed)*(brake?1.6:1)*dt;
  const dx=Math.cos(c.a)*c.speed*dt,dy=Math.sin(c.a)*c.speed*dt;
  if(moveBody(c,dx,dy,20)){if(Math.abs(c.speed)>65){c.hp-=Math.abs(c.speed)*.025;tone(65,.15,'sawtooth');}c.speed*=-.25;}
  if(brake&&Math.abs(c.speed)>70){s.skids.push({x:c.x,y:c.y,a:c.a,life:8});}
  for(const o of s.cars){if(o!==c&&distance(c,o)<43){const impact=Math.abs(c.speed);c.speed*=-.3;c.hp-=impact*.008;o.speed*=.4;moveBody(c,-Math.cos(c.a)*8,-Math.sin(c.a)*8,18);}}
  if(s.roadblocks&&Math.abs(c.y-1620)<28&&c.x>1850&&c.x<1950){c.speed*=-.4;c.hp-=dt*10;}
  s.player.x=c.x;s.player.y=c.y;s.player.a=c.a;if(c.hp<=0){s.car=null;c.hp=0;s.player.y+=48;radio(s,'Engine wrecked. Find another ride. The tape stays in the van.');if(c===s.cars[0]&&s.stage==='deliver'){c.hp=35;radio(s,'IVO / Backup ignition online. The Cormorant can still limp to the drop.');}}
 }else{
  let dx=(k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0),dy=(k.has('s')||k.has('arrowdown')?1:0)-(k.has('w')||k.has('arrowup')?1:0);const len=Math.hypot(dx,dy)||1;const speed=k.has('shift')?160:110;moveBody(s.player,dx/len*speed*dt,dy/len*speed*dt);s.player.walk=Math.hypot(dx,dy);s.player.a=Math.atan2(input.world.y-s.player.y,input.world.x-s.player.x);
 }
 s.cooldown-=dt;if(input.firing&&s.cooldown<=0&&!s.car){s.cooldown=.24;fire(s,input.world);}
 if(s.health<=0){s.health=100;s.money=Math.max(0,s.money-150);s.player.x=300;s.player.y=1620;s.car=null;s.police.wanted=0;s.police.mode='clear';radio(s,'BUSTED / $150 impound fee. The tape is where you left it.');}
}
function fire(s,aim){
 const a=Math.atan2(aim.y-s.player.y,aim.x-s.player.x),end={x:s.player.x+Math.cos(a)*520,y:s.player.y+Math.sin(a)*520};
 reportCrime(s,.35);tone(75,.1,'sawtooth',.12);for(const p of s.people)if(distance(p,s.player)<350)p.panic=5;
 let closest=520,hit=null;for(const o of [...s.police.units,...s.people,...s.cars]){const dx=o.x-s.player.x,dy=o.y-s.player.y,along=dx*Math.cos(a)+dy*Math.sin(a),across=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(o.hp>0&&along>0&&along<closest&&across<(o.length?26:13)&&lineClear(s.player,o)){closest=along;hit=o;}}
 if(hit){hit.hp-=hit.police?2:1;end.x=s.player.x+Math.cos(a)*closest;end.y=s.player.y+Math.sin(a)*closest;}
 s.bullets.push({x:s.player.x,y:s.player.y,tx:end.x,ty:end.y,life:.13,hit:!!hit});
}
export function updateAmbient(s,dt){
 for(const c of s.cars)if(c.ai){c[c.axis]+=c.speed*dt;if(c[c.axis]>2220)c[c.axis]=160;}
 for(const p of s.people){if(p.hp<=0)continue;p.panic=Math.max(0,p.panic-dt);p.y+=p.dir*dt*(p.panic?85:19);if(p.y>2220)p.dir=-1;if(p.y<180)p.dir=1;if(s.car&&distance(s.car,p)<28&&Math.abs(s.car.speed)>65){p.panic=5;p.x+=40;p.hp--;reportCrime(s,.5);}}
 for(const list of [s.bullets,s.skids])for(let i=list.length-1;i>=0;i--){list[i].life-=dt;if(list[i].life<=0)list.splice(i,1);}
}
