import { weapons } from './weapons.js';

export const paintColors = [
  {name:'Papaya',color:0xe05932},{name:'Sea Glass',color:0x58b5a3},{name:'Marigold',color:0xe7b55d},
  {name:'Blue Hour',color:0x526f9d},{name:'Pearl',color:0xe9d8b7},{name:'Damson',color:0x795475}
];

export function makoCounter(hero,gear,nearest,notify) {
  const prices={ammo:95,armor:135,repair:170,paint:85};
  return {
    price(id) {
      return prices[id]!==undefined && hero.respect>=72 && (id==='repair'||id==='paint') ? 0 : prices[id]??weapons.find(w=>w.id===id)?.price;
    },
    options() {
      return weapons.filter(w=>w.clip).map(w=>({...w,owned:!!gear.inventory[w.id],locked:hero.respect<w.rank}));
    },
    car:nearest,
    buy(id, color) {
      const price=this.price(id);
      const w=weapons.find(item=>item.id===id);
      const car=nearest();
      let action, label;
      if(w?.clip&&!gear.inventory[id]&&hero.respect>=w.rank) {
        action=()=>gear.grant(id);label=w.name;
      } else if(id==='ammo'&&Object.keys(gear.inventory).length>1) {
        action=()=>gear.refill();label='Ammunition';
      } else if(id==='armor'&&hero.armor<100) {
        action=()=>{hero.armor=100;};label='Armor vest';
      } else if(id==='repair'&&car?.damage>0) {
        action=()=>{car.damage=0;};label='Full service';
      } else if(id==='paint'&&car&&paintColors.some(o=>o.color===color)) {
        action=()=>car.repaint(color);label=paintColors.find(o=>o.color===color).name+' respray';
      }
      if(!action) {notify('COUNTER',w&&hero.respect<w.rank?'Earn more respect':'Service unavailable','Check your inventory or park nearby');return false;}
      if(hero.cash<price) {notify('COUNTER','Insufficient cash','Earn cash from jobs around Bellcove');return false;}
      hero.cash-=price;action();
      notify('MAKO MOTOR & SUPPLY',label,price?'−$'+price:'Complimentary service');
      return true;
    }
  };
}
