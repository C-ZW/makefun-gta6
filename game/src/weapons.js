export const weapons = [
  {id:'hands',name:'Bare Knuckles',short:'HANDS',clip:0,pool:0,damage:34,delay:.43,range:2.7,spread:0,price:0,rank:0},
  {id:'pistol',name:'Signet .38',short:'PISTOL',clip:10,pool:52,damage:47,delay:.26,range:71,spread:.012,price:240,rank:0},
  {id:'smg',name:'Lockjaw 9',short:'SMG',clip:26,pool:100,damage:27,delay:.097,range:63,spread:.025,price:850,rank:18},
  {id:'shotgun',name:'Breakwater 12',short:'SHOTGUN',clip:6,pool:32,damage:104,delay:.66,range:27,spread:.072,price:1350,rank:36}
];

export function equipment() {
  return {
    slot:0, inventory:{hands:{mag:0,ammo:0}}, reload:0,cooldown:0,
    get weapon() {return weapons[this.slot];},
    get ammo() {return this.inventory[this.weapon.id];},
    equip(index) {
      if(this.inventory[weapons[index]?.id]) {this.slot=index;this.reload=0;return true;}
      return false;
    },
    grant(id,equip=true) {
      const w=weapons.find(w=>w.id===id);
      if(!w) return;
      if(!this.inventory[id]) this.inventory[id]={mag:w.clip,ammo:w.pool};
      else this.inventory[id].ammo=Math.min(w.pool*3,this.inventory[id].ammo+w.pool);
      if(equip) this.equip(weapons.indexOf(w));
    },
    refill() {
      for(const w of weapons) if(w.clip&&this.inventory[w.id]) {
        this.inventory[w.id].mag=w.clip;
        this.inventory[w.id].ammo=Math.max(this.inventory[w.id].ammo,w.pool);
      }
    },
    startReload() {
      if(this.weapon.clip&&this.ammo.mag<this.weapon.clip&&this.ammo.ammo&&!this.reload) this.reload=this.slot===3?1.32:.88;
    },
    update(dt) {
      this.cooldown=Math.max(0,this.cooldown-dt);
      if(!this.reload) return;
      this.reload=Math.max(0,this.reload-dt);
      if(!this.reload) {
        const count=Math.min(this.weapon.clip-this.ammo.mag,this.ammo.ammo);
        this.ammo.mag+=count;this.ammo.ammo-=count;
      }
    }
  };
}
