import * as T from '../vendor/three.module.min.js';
import { cast, portraitFor } from './characters.js';
import { chapters, sideJobs } from './story.js';
import { responseTiers } from './wanted-level.js';
import { createMinimap } from './minimap.js';
import { signposts } from './districts.js';
import { nearestVehicle } from './vehicle-handling.js';
import { respectRank } from './progression.js';

export const mark = '<i class="tide-mark" aria-hidden="true"></i>';
export const money = value => '$'+Math.floor(value).toLocaleString('en-US');
const timeText = seconds => {
  const t=Math.max(0,Math.ceil(seconds));
  return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
};
const portraits = {};
export function portrait(key) {return portraits[key]??=(portraitFor(cast[key]));}

const setHTML=(element,html)=>{if(element.rendered!==html){element.innerHTML=html;element.rendered=html;}};
const delta=(actor,x,z)=>Math.hypot(actor.x-x,actor.z-z);

function drawWeapon(canvas,slot) {
  if(canvas.currentSlot===slot) return;
  canvas.currentSlot=slot;
  const c=canvas.getContext('2d'); c.clearRect(0,0,100,40);
  const silhouettes=[
    [[20,29],[24,21],[30,22],[31,14],[38,11],[43,14],[47,11],[53,14],[59,12],[64,17],[72,17],[78,22],[72,34],[44,35],[37,32],[25,35]],
    [[13,10],[80,10],[81,21],[60,21],[54,30],[45,30],[51,22],[43,22],[36,38],[25,38],[29,23],[15,22]],
    [[9,18],[22,18],[25,12],[63,12],[65,10],[77,10],[77,14],[95,14],[95,20],[73,20],[67,25],[59,25],[64,37],[52,37],[46,24],[33,24],[31,35],[22,35],[23,23],[9,26]],
    [[5,24],[24,19],[32,18],[38,14],[94,14],[94,20],[78,20],[78,23],[44,23],[36,30],[27,27],[9,34]]
  ];
  c.beginPath();silhouettes[slot].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.fillStyle='#f2dca9';c.fill();
  c.fillStyle='#a4ad96';
  if(slot===1) c.fillRect(19,13,52,3);
  if(slot===2) c.fillRect(26,15,42,3);
  if(slot===3) c.fillRect(43,17,31,2);
}

export function createHUD(element,world) {
  element.innerHTML=`
    <div class="hud-brand">${mark}<div><b>AFTERTIDE</b><small>BELLCOVE ISLAND</small></div></div>
    <section id="objective" class="hud-objective"></section>
    <section class="hud-heat" id="heat"></section>
    <section class="hud-police" id="dispatch"></section>
    <section class="hud-map"><header id="locale"></header><canvas id="radar" aria-label="District minimap"></canvas><footer id="map-key"></footer></section>
    <section class="hud-dash"><div id="speed"></div><div class="loadout"><canvas id="weapon-icon" width="100" height="40"></canvas><div id="weapon-text"></div></div><div id="vitals"></div></section>
    <div id="dialogue" class="hud-dialogue"></div>
    <div id="prompt" class="hud-prompt"></div>
    <div id="waypoint" class="hud-waypoint"></div>
    <div id="notice" class="hud-notice"></div>
    <div id="crosshair" class="hud-crosshair"></div>
    <div id="hurt" class="hud-hurt"></div>
    <div class="hud-keys"><kbd>J</kbd> Journal <kbd>Esc</kbd> Pause <kbd>Q</kbd> Radio</div>
  `;
  const nodes=Object.fromEntries([...element.querySelectorAll('[id]')].map(node=>[node.id,node]));
  const map=createMinimap(nodes.radar,world), projected=new T.Vector3();
  let lastMap=-1, notification=null;
  return {
    notice(kicker,title,detail) { notification={kicker,title,detail,until:performance.now()+3900}; },
    update({hero,missions,wanted,police,gear,combat,input,atmosphere,traffic,world,camera,elapsed,cars,radio,mode}) {
      element.classList.toggle('inactive',mode==='start');
      element.classList.toggle('dimmed',mode!=='play');
      const job=missions.contact, stage=missions.current, target=missions.targetPoint();
      const dist=target?Math.round(delta(hero,target.x,target.z)):0;
      const active=!!missions.active;
      const title=stage?.title??job?.name??'Free roam';
      const index=job?.chapter===-1?'SIDE JOB':job?'CHAPTER '+String(job.chapter+1).padStart(2,'0'):'STORY COMPLETE';
      const detail=active?job.name:job?chapters[job.chapter]:'Your island. Your rules.';
      let hint=stage?.hint??(job?'Meet '+cast[job.contact].name:'Races and deliveries are open');
      if(missions.subject&&stage?.type==='tail') hint+='  ·  SUSPICION '+Math.round(missions.suspicion/6.5*100)+'%';
      if(stage?.type==='fight'&&missions.started) hint=combat.count()+' CREW REMAINING  /  '+hint;
      if(stage?.type==='checkpoints') hint='GATE '+Math.min(missions.gate+1,stage.route.length)+' / '+stage.route.length+'  ·  '+hint;
      setHTML(nodes.objective,`<div class="kicker"><span>${index}</span><span>${active?'STAGE '+(missions.stage+1)+' / '+job.stages.length:job?'AVAILABLE':''}</span></div>
        ${active?'<div class="objective-job">'+detail+'</div>':''}<strong>${title}</strong><div class="objective-hint">${hint}</div>
        <div class="objective-meta">${missions.timer!==null?'<span class="clock">'+timeText(missions.timer)+'</span>':''}${target?'<span>◆ '+dist+' M</span>':''}</div>`);
      setHTML(nodes.heat,`<div class="wanted-stars" aria-label="${wanted.stars} of 5 wanted stars">${'★'.repeat(wanted.stars)}<i>${'★'.repeat(5-wanted.stars)}</i></div>
        <div class="wanted-state ${wanted.stars?'hot':''}"><span>${wanted.state}</span>${wanted.timer>0?'<b>'+timeText(wanted.timer)+'</b>':''}</div>`);
      nodes.dispatch.hidden=!wanted.stars;
      if(wanted.stars) {
        const patrol=police.units.filter(u=>u.active&&u.spec.unit==='PATROL').length, pursuing=Math.max(0,police.count-patrol);
        const timer=wanted.timer&&wanted.duration?Math.max(0,wanted.timer/wanted.duration):1;
        setHTML(nodes.dispatch,`<div class="kicker"><span>POLICE RESPONSE</span><span class="live-badge">● LIVE</span></div>
          <strong>${responseTiers[wanted.stars][0]}</strong>
          <div class="dispatch-units"><span>Patrol</span><b>${patrol}</b><span>Interceptor</span><b>${pursuing}</b>
          <span>Roadblock</span><b>${police.roadblock.active?'ACTIVE':'—'}</b><span>Helicopter</span><b>${police.air.on?'AIRBORNE':'—'}</b></div>
          <div class="signal"><i style="width:${Math.round(timer*100)}%"></i></div>`);
      }
      const district=world.districtAt(hero.x,hero.z), hours=Math.floor(atmosphere.hour), min=Math.floor((atmosphere.hour-hours)*60);
      setHTML(nodes.locale,`<span>${district.name}</span><b>${String(hours).padStart(2,'0')}:${String(min).padStart(2,'0')}</b>`);
      setHTML(nodes['map-key'],wanted.stars?'<i class="map-heat"></i> <span>POLICE SEARCH ZONE</span>':'<i></i> <span>'+(target?'GPS ROUTE':'FREE ROAM')+'</span>');
      if(elapsed-lastMap>.095||elapsed<lastMap) {map.draw(hero,target,wanted,police,missions,traffic);lastMap=elapsed;}
      const car=hero.car;
      const speed=car?Math.round(Math.abs(car.speed)*2.237):0;
      nodes.speed.hidden=!car;
      if(car) setHTML(nodes.speed,`<div class="speed-head"><span>${car.model.name}</span><b>${car.speed<-.5?'R':'D'}</b></div><div class="speed-read"><strong>${String(speed).padStart(2,'0')}</strong><span>MPH</span></div>
        <div class="speed-scale"><i style="width:${Math.min(100,Math.round(speed/(car.model.max*2.237)*100))}%"></i></div>
        <div class="speed-foot"><span>CONDITION ${Math.floor(100-car.damage)}%</span><span>${radio?.station??'RADIO OFF'}</span></div>`);
      drawWeapon(nodes['weapon-icon'],gear.slot);
      setHTML(nodes['weapon-text'],`<span>${gear.weapon.short}</span><strong>${gear.weapon.clip?String(gear.ammo.mag).padStart(2,'0'):'—'} <small>${gear.weapon.clip?'/ '+gear.ammo.ammo:'MELEE'}</small></strong>${gear.reload?'<em>RELOADING</em>':''}`);
      setHTML(nodes.vitals,`<div class="account"><strong>${money(hero.cash)}</strong><span>${respectRank(hero.respect).current.title}</span></div>
        <div class="meter"><label>HP</label><i><b style="width:${Math.ceil(hero.health)}%"></b></i><small>${Math.ceil(hero.health)}</small></div>
        <div class="meter armor"><label>AR</label><i><b style="width:${Math.ceil(hero.armor)}%"></b></i><small>${Math.ceil(hero.armor)}</small></div>`);
      const line=missions.message;
      nodes.dialogue.hidden=!line;
      if(line) setHTML(nodes.dialogue,`<img src="${portrait(line.speaker)}" alt=""><div><span>${cast[line.speaker].name}</span><p>${line.text}</p></div>`);
      let prompt='', key='F';
      if(!car&&dist<5.8&&stage?.type==='interact') prompt=stage.title;
      if(!car&&!active&&dist<5.4&&job) prompt='Start '+job.name;
      if(!car&&!prompt&&!wanted.stars&&delta(hero,signposts.safe.x,signposts.safe.z)<6) prompt='Heal & save at the Boathouse';
      if(!car&&!prompt&&delta(hero,signposts.shop.x,signposts.shop.z)<6.3) prompt='Browse Mako Motor & Supply';
      if(!car&&!prompt&&!active) prompt=sideJobs.find(side=>delta(hero,...side.start)<5.4)?.name??'';
      const near=car?null:nearestVehicle(hero,cars);
      if(!prompt&&near) {prompt='Drive '+near.model.name;key='E';}
      nodes.prompt.hidden=!prompt;
      if(prompt) setHTML(nodes.prompt,`<kbd>${key}</kbd> ${prompt}`);
      nodes.prompt.classList.toggle('raised',!!line);
      nodes.waypoint.hidden=true;
      if(target&&dist>3&&dist<115&&world.lineClear(hero.x,hero.z,target.x,target.z)) {
        projected.set(target.x,4.12,target.z).project(camera);
        if(projected.z<1&&Math.abs(projected.x)<.94&&Math.abs(projected.y)<.85) {
          nodes.waypoint.hidden=false;
          nodes.waypoint.style.left=(50+projected.x*50)+'%';nodes.waypoint.style.top=(50-projected.y*50)+'%';
          setHTML(nodes.waypoint,`<strong>${!active&&job?cast[job.contact].name:stage?.type==='tail'?'QUILL’S RUNNER':stage?.type==='chase'?'COURIER':stage?.type==='checkpoints'?'CHECKPOINT':'OBJECTIVE'}</strong><small>${dist} M</small>`);
        }
      }
      nodes.crosshair.hidden=!!car||!(input.aim||input.fire||combat.flash||missions.current?.type==='fight');
      nodes.crosshair.classList.toggle('hit',!!combat.lastHit);
      nodes.hurt.style.opacity=Math.min(.52,combat.lastHurt*1.35);
      nodes.notice.hidden=!notification||performance.now()>notification.until;
      if(!nodes.notice.hidden) setHTML(nodes.notice,`<span>${notification.kicker}</span><strong>${notification.title}</strong><small>${notification.detail}</small>`);
    }
  };
}
