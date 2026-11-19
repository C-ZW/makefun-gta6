import { campaign, endings, sideJobs } from './story.js';
import { districts } from './districts.js';
import { weapons } from './weapons.js';
import { vehicleCatalog } from './vehicles.js';

export const saveKey = 'aftertide.bellcove.v1';

export function localCheckpoint() {
  const branches=['broadcast','bargain'];
  const number=(value,fallback,min,max)=>typeof value==='number'&&Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
  return {
    read() {
      try {
        const s=JSON.parse(localStorage.getItem(saveKey));
        return s?.version===1 ? s : null;
      } catch {return null;}
    },
    write(hero,missions,gear,atmosphere) {
      const owned=[...hero.owned].filter(key=>vehicleCatalog[key]);
      const car=hero.car??hero.recentCar;
      const parked=car&&owned.includes(car.type)?{type:car.type,color:car.color,damage:car.damage}:null;
      const save={
        version:1, x:hero.x,z:hero.z,yaw:hero.yaw,health:hero.health,armor:hero.armor,cash:hero.cash,
        respect:hero.respect,owned,discovered:[...hero.discovered],parked,
        completed:[...missions.completed],sideCompleted:[...missions.sideCompleted],branch:missions.branch,
        slot:gear.slot,inventory:gear.inventory,hour:atmosphere.hour
      };
      try {localStorage.setItem(saveKey,JSON.stringify(save));return true;}
      catch {return false;}
    },
    restore(s,hero,missions,gear,atmosphere,world) {
      if(!s) return false;
      hero.x=number(s.x,175,-315,215);hero.z=number(s.z,73,-262,260);
      if(!world.free(hero.x,hero.z,.44)) {hero.x=179;hero.z=100;}
      hero.yaw=number(s.yaw,0,-10000,10000);
      hero.health=number(s.health,100,1,100);hero.armor=number(s.armor,30,0,100);
      hero.cash=number(s.cash,380,0,1e8);hero.respect=number(s.respect,0,0,1e8);
      hero.owned=new Set(Object.keys(vehicleCatalog).filter(k=>Array.isArray(s.owned)&&s.owned.includes(k)));
      hero.discovered=new Set(districts.filter(v=>Array.isArray(s.discovered)&&s.discovered.includes(v.name)).map(v=>v.name));
      const done=Array.isArray(s.completed)?s.completed:[];
      const index=campaign.findIndex((job,i)=>job.id!==done[i]);
      missions.index=index<0?campaign.length:index;
      missions.completed=campaign.slice(0,missions.index).map(job=>job.id);
      missions.sideCompleted=sideJobs.filter(job=>Array.isArray(s.sideCompleted)&&s.sideCompleted.includes(job.id)).map(job=>job.id);
      missions.branch=missions.index>=5?(branches.includes(s.branch)?s.branch:'broadcast'):null;
      missions.ending=missions.index===campaign.length?endings[missions.branch]:null;
      gear.inventory={hands:{mag:0,ammo:0}};
      for(const w of weapons.slice(1)) if(s.inventory?.[w.id]) {
        const cache=s.inventory[w.id];
        gear.inventory[w.id]={mag:number(cache.mag,w.clip,0,w.clip),ammo:number(cache.ammo,w.pool,0,w.pool*4)};
      }
      gear.equip(0);gear.equip(number(s.slot,0,0,3));
      atmosphere.hour=number(s.hour,18.1,0,23.99);
      return true;
    }
  };
}
