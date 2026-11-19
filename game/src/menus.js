import { mark, money, portrait } from './hud.js';
import { controlGuide } from './controls.js';
import { cast } from './characters.js';
import { campaign, chapters, resolveMission, sideJobs, storyChoice } from './story.js';
import { districts } from './districts.js';
import { vehicleCatalog } from './vehicles.js';
import { weapons } from './weapons.js';
import { paintColors } from './shop.js';
import { respectRank } from './progression.js';

export const menuScreens = ['start','pause','controls','journal','shop','choice','ending'];
const button=(id,label,style='',disabled=false)=>`<button data-action="${id}" class="${style}" ${disabled?'disabled':''}>${label}</button>`;
const closed=(title,desc,content)=>`
  <section class="menu-window">
    <header class="menu-top"><div class="menu-id">${mark}<span>AFTERTIDE <small>BELLCOVE ISLAND</small></span></div>${button('resume','<kbd>ESC</kbd> RETURN','quiet')}</header>
    <div class="menu-main"><div class="menu-caption">${desc}</div><h1>${title}</h1>${content}</div>
  </section>`;

export function createMenus(element,state,action) {
  element.addEventListener('click',event=>{
    const target=event.target.closest('button[data-action]');
    if(target) action(target.dataset.action);
  });
  return {
    mode:'',
    render(mode) {
      this.mode=mode;
      element.className=mode==='play'?'':'is-'+mode;
      if(mode==='play'){element.innerHTML='';return;}
      const {hero,missions,gear,shop,save,ending}=state();
      const saveExists=!!save.read();
      if(mode==='start') {
        element.innerHTML=`
          <section class="title-screen">
            <div class="title-label">${mark}<div>BELLCOVE ISLAND<small>02 / COASTAL DISTRICT</small></div></div>
            <div class="title-body">
              <div class="title-eyebrow">A BELLCOVE CRIME STORY</div>
              <h1>AFTER<span>TIDE</span></h1>
              <p>A stolen deed. A city for sale. One summer to take it back.</p>
              <div class="title-actions">
                ${saveExists?button('load','Continue <small>LOCAL CHECKPOINT</small>','primary'):''}
                ${button('new',saveExists?'New story':'Start story <small>ENTER</small>',saveExists?'':'primary')}
                ${button('controls','Controls','quiet')}
              </div>
            </div>
            <div class="title-footer"><span>CHAPTER I <b>A Favor at Low Tide</b></span><span>OPEN WORLD / STORY CAMPAIGN</span></div>
          </section>`;
        return;
      }
      if(mode==='pause') {
        element.innerHTML=closed('On hold','PAUSED / BELLCOVE',`
          <div class="pause-grid">${button('resume','Resume','primary')}${button('journal','Journal')}${button('save','Save checkpoint')}
          ${button('load','Load checkpoint','',!saveExists)}${button('controls','Controls')}${button('title','Title screen','quiet')}</div>`);
        return;
      }
      if(mode==='controls') {
        element.innerHTML=closed('Controls','KEYBOARD & MOUSE',`
          <div class="controls-grid">${controlGuide.map(([keys,label])=>`<div><kbd>${keys}</kbd><span>${label}</span></div>`).join('')}</div>
          <p class="menu-note">Click the game to capture the mouse. Hold the right button for precise aim. Slow down before stepping out of a vehicle.</p>`);
        return;
      }
      if(mode==='choice') {
        element.innerHTML=closed('The original deed','CHAPTER 02  /  THE DEED',`
          <div class="decision-person"><img src="${portrait('nera')}" alt=""><div><b>${cast.nera.name}</b><p>Everyone in this town wants that piece of paper. You know what each of them will do with it.</p></div></div>
          <div class="decision-grid">${storyChoice.map((choice,i)=>button('choose-'+choice.id,`<kbd>${i+1}</kbd><strong>${choice.name}</strong><span>${choice.description}</span>`)).join('')}</div>
          <p class="menu-note">Your choice changes later jobs and the ending.</p>`);
        return;
      }
      if(mode==='ending') {
        element.innerHTML=closed(ending.title,'THE DEED / CASE CLOSED',`<p class="end-text">${ending.text}</p>${button('resume','Return to free roam','primary')}${button('journal','Open journal','quiet')}`);
        return;
      }
      if(mode==='shop') {
        const car=shop.car();
        element.innerHTML=closed('Mako Motor & Supply','MARIGOLD STRAND / GARAGE',`
          <div class="counter-info"><span>SUPPLY COUNTER</span><strong>${money(hero.cash)}</strong></div>
          <div class="shop-grid">
            <div class="shop-list">
              ${shop.options().map(w=>button('buy-'+w.id,`<span>${w.name}<small>${w.short} · ${w.clip} ROUNDS</small></span><b>${w.owned?'OWNED':w.locked?w.rank+' RESPECT':money(w.price)}</b>`,'shop-row',w.owned||w.locked)).join('')}
              ${button('buy-ammo','<span>Ammunition<small>REFILL ALL WEAPONS</small></span><b>'+money(shop.price('ammo'))+'</b>','shop-row',Object.keys(gear.inventory).length===1)}
              ${button('buy-armor','<span>Armor vest<small>FULL PROTECTION</small></span><b>'+money(shop.price('armor'))+'</b>','shop-row',hero.armor>=100)}
            </div>
            <div class="shop-list">
              <div class="garage-car"><span>GARAGE BAY</span><strong>${car?.model.name??'Bay empty'}</strong><p>${car?'Condition '+Math.floor(100-car.damage)+'%':'Park a car by the shop to service it.'}</p></div>
              ${button('buy-repair','<span>Repair damage</span><b>'+money(shop.price('repair'))+'</b>','shop-row',!car?.damage)}
              <div class="swatch-caption">PAINT / ${money(shop.price('paint'))}</div>
              <div class="paint-options">${paintColors.map(p=>button('paint-'+p.color,`<i style="background:#${p.color.toString(16).padStart(6,'0')}"></i><small>${p.name}</small>`,'swatch',!car)).join('')}</div>
            </div>
          </div>`);
        return;
      }
      const rank=respectRank(hero.respect);
      const totalOwned=hero.owned.size, totalArmed=Object.keys(gear.inventory).length;
      const branch=storyChoice.find(choice=>choice.id===missions.branch);
      const stats=[
        [campaign.length,'STORY MISSIONS',missions.completed.length+' completed'],
        [Object.keys(vehicleCatalog).length,'VEHICLE MODELS',totalOwned+' acquired'],
        [weapons.length,'WEAPONS',totalArmed+' in locker'],
        [districts.length,'DISTRICTS',hero.discovered.size+' discovered']
      ];
      element.innerHTML=closed('Field journal','REN ASTER / BOATHOUSE CASE',`
        <div class="journal-metrics">${stats.map(([n,label,sub])=>`<div><strong>${String(n).padStart(2,'0')}</strong><div><b>${label}</b><small>${sub}</small></div></div>`).join('')}</div>
        <div class="journal-grid">
          <aside>
            <div class="journal-person"><img src="${portrait('ren')}" alt=""><div><small>STREET RESPECT</small><strong>${rank.current.title}</strong><b>${hero.respect} RP</b></div></div>
            <div class="rank-bar"><i style="width:${rank.next?Math.round((hero.respect-rank.current.at)/(rank.next.at-rank.current.at)*100):100}%"></i></div>
            <p>${rank.next?'Next: '+rank.next.title+' · '+rank.next.perk:rank.current.perk}</p>
            <div class="journal-label">THE DEED</div>
            <strong class="journal-branch">${branch?.name??'Decision pending'}</strong>
            <div class="journal-label">STREET JOBS &nbsp; ${missions.sideCompleted.length} / 2</div>
            ${sideJobs.map(s=>`<small class="journal-side">${missions.sideCompleted.includes(s.id)?'✓':'◇'} &nbsp; ${s.name}</small>`).join('')}
          </aside>
          <div class="journal-chapters">${chapters.map((chapter,ch)=>`
            <article><small>CHAPTER 0${ch+1}</small><h2>${chapter}</h2>
            ${campaign.map((base,i)=>({job:resolveMission(base,missions.branch),i})).filter(v=>v.job.chapter===ch).map(({job,i})=>{
              const done=missions.completed.includes(job.id), live=i===missions.index;
              const status=done?'COMPLETE':live?'CURRENT':baseStatus(job);
              return `<div class="journal-job ${done?'done':live?'live':''}"><strong>${String(i+1).padStart(2,'0')} &nbsp; ${job.name}</strong><small>${status}</small></div>`;
            }).join('')}</article>`).join('')}</div>
        </div>
        <div class="journal-ledger">
          <section><strong>DISTRICTS</strong><p>${districts.map(d=>`<span class="${hero.discovered.has(d.name)?'owned':''}" style="--district:${d.color}">${d.name}</span>`).join('')}</p></section>
          <section><strong>GARAGE</strong><p>${Object.entries(vehicleCatalog).map(([id,v])=>`<span class="${hero.owned.has(id)?'owned':''}">${v.name}</span>`).join('')}</p></section>
          <section><strong>LOCKER</strong><p>${weapons.map(w=>`<span class="${gear.inventory[w.id]?'owned':''}">${w.name}</span>`).join('')}</p></section>
        </div>`);
    }
  };
}

function baseStatus(job) {
  return job.routes?'BRANCH JOB':'LOCKED';
}
