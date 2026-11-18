import {vehicle,roads,distance,lineClear,moveBody,hideouts} from './district.js';
import {tone} from './sound.js';
export function createPolice(){return {mode:'clear',wanted:0,unseen:0,remaining:0,last:{x:300,y:740},units:[patrol(650,740,Math.PI),patrol(1620,1180,-Math.PI/2)],history:[]};}
function patrol(x,y,a){return {...vehicle(x,y,a,1),police:true,color:'#e2e9da',name:'QUAY PATROL',hp:8,route:0};}
export function radio(s,message){s.message=message;s.messageUntil=s.time+7;}
function transition(s,mode){const p=s.police;if(p.mode===mode)return;p.mode=mode;p.history.push(mode);tone(mode==='clear'?660:220,.3);if(mode==='pursuit'){s.escaped=false;radio(s,'DISPATCH / Visual confirmed. Stop the vehicle!');}if(mode==='search'){p.remaining=s.branch==='broadcast'&&s.delivered?9:15;radio(s,'DISPATCH / Visual lost. Sweep the last known position.');}if(mode==='clear'){p.wanted=0;s.escaped=true;radio(s,'DISPATCH / All units stand down. You are back in free roam.');}}
export function reportCrime(s,amount=1){const p=s.police;p.wanted=Math.min(5,p.wanted+amount);p.last={x:s.player.x,y:s.player.y};if(p.mode==='clear'){transition(s,'search');p.remaining=15;}if(p.wanted>=3&&p.units.length<3)p.units.push(patrol(1180,740,0));}
function nearestRoad(v){return roads.reduce((a,b)=>Math.abs(v-b)<Math.abs(v-a)?b:a);}
function navigate(c,target,dt,speed){
 let goal=target;
 if(!lineClear(c,target)){
  const cx=nearestRoad(c.x),cy=nearestRoad(c.y),tx=nearestRoad(target.x),ty=nearestRoad(target.y);
  if(Math.abs(c.x-cx)>18&&Math.abs(c.y-cy)>18)goal={x:cx,y:c.y};
  else if(Math.abs(c.y-cy)>18)goal={x:cx,y:cy};
  else if(Math.abs(c.x-cx)>18)goal={x:cx,y:cy};
  else if(Math.abs(cx-tx)>20)goal={x:cx+Math.sign(tx-cx)*440,y:cy};
  else goal={x:cx,y:ty};
 }
 const d=distance(c,goal);if(d<12){c.speed=0;return;}
 const angle=Math.atan2(goal.y-c.y,goal.x-c.x),delta=Math.atan2(Math.sin(angle-c.a),Math.cos(angle-c.a));c.a+=Math.max(-dt*3,Math.min(dt*3,delta));c.speed=speed*Math.max(.3,1-Math.abs(delta)/3);moveBody(c,Math.cos(c.a)*c.speed*dt,Math.sin(c.a)*c.speed*dt,18);
}
export function updatePolice(s,dt){
 const p=s.police,player=s.player;
 const sheltered=s.branch==='broadcast'&&s.delivered&&!s.car&&hideouts.some(h=>distance(h,player)<52);
 let seen=false;
 for(const c of p.units){
  if(c.hp<=0)continue;
  const d=distance(c,player),bearing=Math.atan2(player.y-c.y,player.x-c.x),angle=Math.abs(Math.atan2(Math.sin(bearing-c.a),Math.cos(bearing-c.a)));
  c.sees=p.wanted>0&&!sheltered&&d<360&&(p.mode==='pursuit'||d<130||angle<1.2)&&lineClear(c,player);
  if(c.sees)seen=true;
  if(p.mode==='pursuit'){navigate(c,player,dt,115+p.wanted*7);if(d<50&&(!s.car||Math.abs(s.car.speed)<30)){s.health-=dt*3;}if(d<38&&s.car){moveBody(c,-Math.cos(c.a)*35*dt,-Math.sin(c.a)*35*dt,18);}}
  else if(p.mode==='search'){const t=p.remaining>9?p.last:{x:nearestRoad(p.last.x)+Math.sin(s.time*.6+c.route)*75,y:nearestRoad(p.last.y)+Math.cos(s.time*.6+c.route)*75};navigate(c,t,dt,65);if(distance(c,t)<80)c.a+=dt*.9;}
  else{const corners=[{x:740,y:740},{x:1620,y:740},{x:1620,y:1620},{x:740,y:1620}];if(distance(c,corners[c.route])<30)c.route=(c.route+1)%4;navigate(c,corners[c.route],dt,48);}
 }
 if(p.wanted){if(seen){p.last={x:player.x,y:player.y};p.unseen=0;transition(s,'pursuit');}else if(p.mode==='pursuit'){p.unseen+=dt;if(p.unseen>.85)transition(s,'search');}else if(p.mode==='search'){p.remaining-=dt;if(p.remaining<=0)transition(s,'clear');}}
}
