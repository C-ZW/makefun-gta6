import {icon} from './icons.js';
import {CHAPTERS,CONTACTS,islandStory} from './story.js';
import {DISTRICTS} from './districts.js';
import {WEAPONS} from './weapons.js';
import {VEHICLES} from './vehicles.js';
import {contactPortrait} from './portraits.js';
import {COUNTER,rankName,buyAtGarage} from './shop.js';
import {islandClock} from './hud.js';
export const CONTROLS=[
 ['W A S D / ↑ ↓ ← →','Move or drive'],['RMB + mouse','Look around'],['LMB','Aim at cursor & fire'],['Shift','Sprint'],['E','Steal / enter / exit'],['Space','Handbrake'],['1 – 4 / R','Equip / reload'],['F / hold F','Interact / work a circuit'],['T / M','Radio station / mute'],['J / H / Esc','Journal / controls / pause']
];
const button=(cmd,label,cls='')=>'<button data-act="'+cmd+'" class="'+cls+'">'+label+'</button>';
const wordmark='<span class="brand">'+icon('sun',28)+'<b>SUNBREAK</b></span>';
const key=(k,text)=>'<span><kbd>'+k+'</kbd> '+text+'</span>';
function title(g){
 return `<div class="title-screen"><header>${wordmark}<span class="topline"></span><span>PORT VELA &nbsp; / &nbsp; ISLAND RADIO</span>${icon('tower',18)}</header>
 <div class="title-copy"><div class="title-edition"><i></i> A PORT VELA CRIME STORY</div><h1>Sun<span>break<i>.</i></span></h1><p>One stolen ledger. An island for sale.</p>
 <div class="title-actions">${button('story','Begin story '+icon('arrow',19),'primary')}${button('roam','Free roam','secondary')}${g.save.available()?button('load','Continue','secondary'):''}</div>
 <div class="title-links">${button('help','Controls')}${button('journal','Island journal')}</div></div>
 <div class="title-place"><div class="location-line"></div><small>${icon('pin',14)} SAFFRON STRAND</small><b>Port Vela</b><span>18:34 &nbsp; / &nbsp; GOLDEN HOUR</span></div>
 <footer><span>${icon('tape',18)} <b>ISLAND TRANSMISSIONS</b></span><div>${key('WASD','Move')}${key('E','Enter vehicle')}${key('ESC','Pause')}</div></footer></div>`;
}
function ledger(g){
 const m=g.missions.m,p=g.p,story=islandStory(m.branch);
 return `<div class="ledger"><header class="paperhead"><span>${icon('book',17)} PORT VELA &nbsp; / &nbsp; FIELD RECORDS</span><b>${wordmark}</b></header><div class="ledger-body">
 <aside class="profile"><div class="eyebrow">DRIVER DOSSIER</div><img src="${contactPortrait(0)}" alt="Portrait of Inez Vale"><h3>Inez Vale</h3><div class="rank">${icon('badge',15)} ${rankName(p)}</div><p>${p.respect} RESPECT<br>$${p.cash.toLocaleString('en-US')} ON HAND</p>
 <div class="district-record"><small>DISTRICTS VISITED</small>${DISTRICTS.map((d,i)=>'<span class="'+(p.districts.includes(i)?'checked':'')+'">'+(p.districts.includes(i)?'◆':'◇')+' '+d.name+'</span>').join('')}</div></aside>
 <article><div class="ledger-heading"><div><small>PORT VELA &nbsp; / &nbsp; PROGRESS</small><h1>Island ledger<span>.</span></h1></div><b class="stamp">FIELD<br>JOURNAL</b></div>
 <div class="stats">${[[m.completed.length,9,'MISSIONS'],[p.owned.length,6,'VEHICLES'],[p.weapons.length,4,'WEAPONS'],[p.districts.length,4,'DISTRICTS']].map(([n,total,label])=>'<div><strong>'+n+'<i> / '+total+'</i></strong><small>'+label+'</small></div>').join('')}</div>
 <div class="chapter-grid">${CHAPTERS.map((ch,j)=>'<section><small>CHAPTER 0'+(j+1)+'</small><h3>'+ch+'</h3>'+story.slice(j*3,j*3+3).map((s,k)=>'<p class="'+(j*3+k<m.index?'done':'')+'"><b>'+(j*3+k<m.index?'✓':j*3+k===m.index?'◆':'○')+'</b>'+s.name+'</p>').join('')+'</section>').join('')}</div>
 <p class="fork"><b>${icon('tape',15)} MASTER TAPE</b> ${m.ending||({air:'Broadcast route · Sol has the tape.',cash:'Buyout route · Lio has the tape.'}[m.branch])||'Custody undecided'}</p>
 <div class="collection"><b>GARAGE</b><span>${p.owned.map(i=>VEHICLES[i].name).join(' · ')||'No vehicles claimed'}</span><b>WEAPON KIT</b><span>${p.weapons.map(i=>WEAPONS[i].name).join(' · ')}</span><b>SIDE JOBS</b><span>${['race','courier'].map((id,i)=>['Strand Sprint','Night Mail'][i]+' '+(g.activity.records[id]?g.activity.records[id].toFixed(1)+'s':'—')).join(' &nbsp; / &nbsp; ')}</span></div>
 </article></div><footer>${button('back','← &nbsp; Return')}<span>LOCAL TIME &nbsp; ${islandClock(g.time)}</span></footer></div>`;
}
export function menuController(g){
 const root=document.querySelector('#overlay');let previous='';
 function render(){root.innerHTML='';root.className=g.menu?'open '+g.menu:'';if(!g.menu)return;
  if(g.menu==='title'){root.innerHTML=title(g);return}
  if(g.menu==='journal'){root.innerHTML=ledger(g);return}
  let body='',heading='',label='';
  if(g.menu==='pause'){label='PORT VELA / SYSTEM';heading='Paused.';body='<div class="menu-buttons">'+[['resume','Resume driving'],['journal','Island journal'],['help','Controls'],['save','Save checkpoint'],['load','Load checkpoint']].map(([k,v])=>button(k,v+icon('arrow',16))).join('')+'</div>'}
  if(g.menu==='help'){label='FIELD MANUAL';heading='Controls.';body='<div class="bindings">'+CONTROLS.map(([k,v])=>'<div><kbd>'+k+'</kbd><span>'+v+'</span></div>').join('')+'</div>'}
  if(g.menu==='choice'){label='CHAPTER II / DOUBLE EXPOSURE';heading='One master tape.';body='<p>Choose who receives the only recording of the tide-gate deal.</p><div class="fork-options">'+[[1,'air','Go on air','Expose the deal with Sol.'],[3,'cash','Sell the tape','Take the buyout with Lio.']].map(([i,k,n,d])=>button(k,'<img src="'+contactPortrait(i)+'"><span><small>'+CONTACTS[i].name+'</small><strong>'+n+'</strong>'+d+'</span>')).join('')+'</div>'}
  if(g.menu==='shop'){label='MIRADOR MILE / WORKSHOP';heading='Palma Motors.';body='<div class="shop-balance">AVAILABLE CASH <b>$'+g.p.cash+'</b></div><div class="wares">'+COUNTER.map(i=>{const owned=i.id[0]==='w'&&g.p.weapons.includes(+i.id[1]),locked=g.p.respect<(i.rank||0);return button('buy-'+i.id,'<span><b>'+i.name+'</b><small>'+i.info+'</small></span><strong>'+(owned?'OWNED':locked?i.rank+' REP':'$'+i.price)+'</strong>',owned||locked?'dim':'')}).join('')+'</div>'}
  if(g.menu==='home'){label='MIRADOR MILE / SAFEHOUSE';heading='The spare room.';body='<p>A folding bed above the record shop. Rest here to restore health and write a checkpoint.</p>'+button('rest','Rest & save '+icon('arrow',17),'primary')}
  root.innerHTML='<section class="sheet"><header>'+wordmark+'<span>PORT VELA</span></header><article><small>'+label+'</small><h1>'+heading+'</h1>'+body+'</article><footer>'+(g.menu==='choice'?'TAPE CUSTODY / PERMANENT':button('back','← &nbsp; Return'))+'<span class="menu-status"></span></footer></section>';
 }
 function open(name){if(name==='choice')previous='';else if(name!==g.menu)previous=g.menu;g.menu=name;g.keys.clear();g.combat.trigger(false);render()}
 function close(){g.menu='';previous='';root.innerHTML='';root.className='';g.keys.clear()}
 function back(){if(g.menu==='choice')return;if(previous==='title'||previous==='pause'){g.menu=previous;previous='';render()}else close()}
 function act(cmd){g.sound.start();
  if(cmd==='story'||cmd==='roam'){close();g.snap();if(cmd==='story')g.missions.start();return}
  if(cmd==='resume'){close();return}if(cmd==='back'){back();return}
  if(['journal','help'].includes(cmd)){open(cmd);return}
  if(cmd==='air'||cmd==='cash'){g.missions.choose(cmd);return}
  if(cmd==='save'||cmd==='rest'){g.save.save(cmd==='rest');if(cmd==='rest')close();else render()}
  if(cmd==='load'){if(!g.save.restore())g.notify('No checkpoint available')}
  if(cmd.startsWith('buy-')){buyAtGarage(g,cmd.slice(4));render()}
  const status=root.querySelector('.menu-status');if(status&&g.toast)status.textContent=g.toast.text;
 }
 root.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b)act(b.dataset.act)});
 return {open,close,back,render,act};
}
