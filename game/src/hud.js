import {icon} from './icons.js';
import {drawMinimap} from './minimap.js';
import {CONTACTS,CHAPTERS} from './story.js';
import {DISTRICTS,districtAt} from './districts.js';
import {STATIONS} from './radio.js';
import {WEAPONS} from './weapons.js';
import {VEHICLES} from './vehicles.js';
import {SIDE_JOBS,serviceAt} from './activities.js';
import {contactPortrait} from './portraits.js';
import {approachCar} from './on-foot.js';
export function timeLabel(n){return Math.floor(Math.max(0,n)/60)+':'+String(Math.floor(Math.max(0,n)%60)).padStart(2,'0')}
export function islandClock(t){const n=(18*60+34+Math.floor(t*1440/620))%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
export function dashboard(g){
 const el=document.querySelector('#hud');el.innerHTML=`
 <div class="brand hud-brand">${icon('sun',29)}<b>SUNBREAK</b><i></i><span>PORT VELA</span></div>
 <section class="mission panel"><div class="kicker gold" id="chapter"></div><h2 id="mission-title"></h2><div id="objective"></div><footer><span id="stage"></span><strong id="timer"></strong></footer></section>
 <section class="dispatch panel"><div class="cap"><span>${icon('tower',15)} POLICE RESPONSE</span><b id="channel"></b></div><div class="wanted"><div id="stars"></div><em id="sight"></em></div><div id="response"></div></section>
 <div id="radio-chip"></div><div id="toast"></div><div id="aim-ring"></div><div id="foe-label"></div>
 <section class="gps panel"><div class="maphead"><b>${icon('pin',13)} PORT VELA</b><span id="clock"></span></div><canvas id="chart" width="236" height="135"></canvas><strong id="district"></strong><div class="vitals"><i>${icon('cross',11)}</i><u><b id="hp"></b></u><i>${icon('shield',12)}</i><u><b id="armor"></b></u></div></section>
 <div id="prompt"></div><div id="dialogue" class="dialogue panel"></div>
 <section class="driver panel"><div class="wallet"><span>ON HAND</span><b id="cash"></b></div><div class="weapon">${icon('gun',22)}<strong id="gun"></strong><span id="ammo"></span></div><div id="vehicle-info"></div></section>
 <div class="damage-wash"></div>`;
 const nodes=Object.fromEntries([...el.querySelectorAll('[id]')].map(e=>[e.id,e]));
 const last={};function set(id,value){if(value!==last[id]){last[id]=value;nodes[id].innerHTML=value}}
 function update(){
  el.hidden=!!g.menu;if(el.hidden)return;
  const p=g.p,m=g.missions.m,spec=g.missions.spec(),obj=g.missions.stage(),a=g.activity,h=g.police.heat,car=p.car,reg=DISTRICTS[districtAt(p.x,p.z)],loc=serviceAt(p);
  set('chapter',a.active?'SIDE ACTIVITY':m.active?'CH. '+['I','II','III'][Math.floor(m.index/3)]+' &nbsp;/&nbsp; '+CHAPTERS[Math.floor(m.index/3)].toUpperCase():'PORT VELA &nbsp;/&nbsp; FREE ROAM');
  set('mission-title',a.active?SIDE_JOBS[a.active].name:m.active?spec.name:m.failed?'Assignment failed':m.ending?'Case closed':'Between jobs');
  let text=a.active?'Reach the next checkpoint':m.active?obj.text:m.failed|| (m.ending?'Explore the island':'Answer the next radio call');
  if(obj?.kind==='hold'&&m.active)text='Hold F · '+text;
  if(obj?.kind==='fight'&&m.active)text+=' · '+m.enemies.filter(e=>e.health<=0).length+'/'+m.enemies.length;
  set('objective','<i>◆</i><span>'+text+'</span>');set('stage',a.active?'GATE '+(a.stage+1)+' / '+SIDE_JOBS[a.active].points.length:m.active?'STAGE '+(m.stage+1)+' / '+spec.steps.length:'STORY '+m.completed.length+' / 9');
  set('timer',a.active?timeLabel(a.timer):m.active?timeLabel(m.timer):'F &nbsp; RADIO');
  set('channel','PVPD / 04');set('stars',[0,1,2,3,4].map(i=>'<b class="'+(i<h.level?'lit':'')+'">★</b>').join(''));
  set('sight',h.state);nodes.sight.dataset.state=h.state;
  set('response',h.state==='SEARCHING'?'Last seen · search '+timeLabel(h.timer):h.level===0?'Patrol frequency open':h.level>=4?icon('car',15)+' Interceptors &nbsp; '+icon('heli',19)+' Air support':h.level>=3?'Intercept units · Roadblock':'Patrol units · Pursuit');
  const station=STATIONS[g.station];set('radio-chip',car?icon('radio',14)+' '+station.name.toUpperCase()+' <b>'+station.freq+'</b>':'');nodes['radio-chip'].hidden=!car;
  set('clock',islandClock(g.time));set('district',reg.name);nodes.hp.style.width=p.health+'%';nodes.armor.style.width=p.armor+'%';
  set('cash','$'+Math.floor(p.cash).toLocaleString('en-US'));set('gun',WEAPONS[p.weapon].short);set('ammo',p.weapon?'<b>'+p.mag[p.weapon]+'</b> / '+p.ammo[p.weapon]:'MELEE');
  set('vehicle-info',car?'<div class="speed"><b>'+String(Math.round(Math.abs(car.speed)*3.6)).padStart(3,'0')+'</b><span>KM/H</span><i>'+Math.round(car.health)+'%<small>BODY</small></i></div><div class="car-name">'+icon('wheel',15)+VEHICLES[car.type].name+' <span>'+VEHICLES[car.type].class+'</span></div>':'<div class="foot-id">'+icon('pin',14)+' ON FOOT <b>INEZ VALE</b></div>');
  const nearby=!car&&approachCar(p,g.cars);
  const command=loc?['F',{home:'Safehouse',shop:'Open garage',race:'Strand Sprint',courier:'Night Mail'}[loc]]:nearby?['E','Steal '+VEHICLES[nearby.type].name]:!m.active&&!a.active&&!m.ending?['F',m.failed?'Retry assignment':'Take next job']:null;
  set('prompt',command?'<kbd>'+command[0]+'</kbd>'+command[1]:'');nodes.prompt.hidden=!command;
  const d=g.dialogue;nodes.dialogue.hidden=!d||d.until<g.time;
  if(d&&!nodes.dialogue.hidden){const person=CONTACTS[d.who];set('dialogue','<img src="'+contactPortrait(d.who)+'" alt=""><div><small>'+icon('radio',12)+' '+person.name.toUpperCase()+'</small><p>'+d.line+'</p></div>')}
  nodes.toast.hidden=!g.toast||g.toast.until<g.time;if(!nodes.toast.hidden)set('toast',g.toast.text);
  const activeFoes=g.combat.foes.filter(e=>e.health>0).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
  nodes['aim-ring'].hidden=!g.combat.flashing&&!activeFoes.length;nodes['aim-ring'].style.left=(g.combat.aim.x*.5+.5)*100+'%';nodes['aim-ring'].style.top=(.5-g.combat.aim.y*.5)*100+'%';
  nodes['foe-label'].hidden=true;
  if(activeFoes.length){const e=activeFoes[0],v=e.model.position.clone().addScalar(0);v.y+=2.05;v.project(g.camera);
   if(v.z<1&&v.z>0&&Math.abs(v.x)<.96&&Math.abs(v.y)<.9){nodes['foe-label'].hidden=false;nodes['foe-label'].style.left=(v.x*.5+.5)*100+'%';nodes['foe-label'].style.top=(.5-v.y*.5)*100+'%';set('foe-label','QUAY CREW <b>'+Math.ceil(e.health/68*100)+'%</b>')}}
  el.classList.toggle('hit',g.lastHit>0);drawMinimap(nodes.chart,g);
 }
 return update;
}
