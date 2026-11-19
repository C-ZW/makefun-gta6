import {islandStory,ENDINGS} from './story.js';
import {spawnVehicle} from './vehicles.js';
import {interceptRoute} from './traffic.js';
export const MISSION_CONDITIONS=['On assignment','Case closed','Time expired','Courier lost','Crew down'];
export function missionDirector(g){
 const m={index:0,stage:0,active:false,completed:[],branch:'',timer:0,hold:0,runner:null,enemies:[],failed:'',ending:'',choice:false,tailLost:0};
 const spec=()=>islandStory(m.branch)[m.index],stage=()=>spec()?.steps[m.stage];
 function dispose(){if(m.runner){m.runner.role='traffic';m.runner=null}g.combat?.dismiss(m.enemies);m.enemies=[];m.choice=false}
 function setStage(){
  const obj=stage();m.hold=0;m.tailLost=0;
  if(obj.kind==='hot')g.p.crime(obj.level);
  if(['tail','chase'].includes(obj.kind)){const [x,z]=obj.point;const runner=spawnVehicle(g.scene,3,x,z,0,0xb7c799,'runner');interceptRoute(runner);g.cars.push(runner);m.runner=runner}
  if(obj.kind==='fight')m.enemies=g.combat?.gang(obj.point)||[];
  if(obj.kind==='choice'){m.choice=true;g.open?.('choice')}
 }
 function start(){if(m.active||!spec()||g.activity?.active)return false;m.active=true;m.stage=0;m.timer=spec().limit;m.failed='';setStage();g.say?.(spec().contact,spec().line,9);return true}
 function fail(reason){dispose();m.active=false;m.failed=reason;g.notify?.(reason+' · F to retry')}
 function advance(){
  dispose();m.stage++;
  if(m.stage<spec().steps.length){setStage();return}
  const title=spec().name,reward=350+m.index*125;m.completed.push(title);m.active=false;m.index++;g.p.cash+=reward;g.p.respect+=18;
  g.notify?.('Case closed · +$'+reward+' · +18 respect');if(m.index===9){m.ending=ENDINGS[m.branch];g.say?.(0,m.ending,16);g.open?.('journal')}
 }
 function choose(branch){if(!m.choice||!['air','cash'].includes(branch))return;m.branch=branch;g.close?.();advance()}
 function target(){
  if(!m.active)return null;const o=stage();if(m.runner)return [m.runner.x,m.runner.z];if(o.kind==='car'){const c=g.cars.filter(c=>c.active&&c.role==='parked').sort((a,b)=>Math.hypot(a.x-g.p.x,a.z-g.p.z)-Math.hypot(b.x-g.p.x,b.z-g.p.z))[0];return c?[c.x,c.z]:null}return o.point||null;
 }
 function tick(dt){if(!m.active||m.choice)return;m.timer-=dt;if(m.timer<=0){fail('Time expired');return}
  const o=stage(),p=g.p,t=target(),d=t?Math.hypot(p.x-t[0],p.z-t[1]):Infinity;
  switch(o.kind){
   case 'car':if(p.car)advance();break;
   case 'go':case 'hot':if(d<6)advance();break;
   case 'race':case 'deliver':if(p.car&&d<6)advance();break;
   case 'hold':m.hold=d<6&&g.keys.has('KeyF')?m.hold+dt:0;if(m.hold>=1.6)advance();break;
   case 'fight':if(m.enemies.length&&m.enemies.every(e=>e.health<=0))advance();break;
   case 'evade':if(g.police.heat.level===0)advance();break;
   case 'tail':case 'chase':{
    const close=o.kind==='chase'?d<12:d>=5&&d<32;
    if(close&&p.car){m.hold+=dt;m.acquired=true}if(m.hold>(o.kind==='chase'?2:5)){advance();break}
    m.tailLost=m.hold>0&&d>57?m.tailLost+dt:0;if(m.tailLost>8)fail('Courier lost');break;
   }
  }
 }
 function restore(story,foes,runner){Object.assign(m,story);if(m.active){setStage();m.hold=story.hold;m.enemies.forEach((e,i)=>Object.assign(e,foes[i]||{}));if(runner&&m.runner)Object.assign(m.runner,runner)}}
 return {m,start,tick,fail,choose,target,spec,stage,dispose,restore};
}
