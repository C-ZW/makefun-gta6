import { signposts } from './districts.js';

export function boathouseSafehouse(hero,save,notice) {
  return {
    nearby() {return !hero.car&&Math.hypot(hero.x-signposts.safe.x,hero.z-signposts.safe.z)<6;},
    use() {
      hero.health=100;
      if(hero.respect>=108) hero.armor=100;
      const saved=save();
      notice('THE BOATHOUSE',saved?'Healed & saved':'Healed',saved?'Local checkpoint updated':'Browser storage unavailable');
      return saved;
    }
  };
}
