import {sculpture} from './geometry.js';
export const WEAPONS=[
 {name:'Dock baton',short:'BATON',range:2.7,damage:35,cool:.39,price:0,rank:0,clip:0},
 {name:'Kite .38',short:'KITE .38',range:62,damage:32,cool:.24,price:140,rank:0,clip:12},
 {name:'Vela 9',short:'VELA 9',range:55,damage:21,cool:.095,price:490,rank:18,clip:30},
 {name:'Brine 12',short:'BRINE 12',range:29,damage:63,cool:.72,price:720,rank:36,clip:6}
];
export function heldWeapon(parent,slot){
 const s=sculpture(),steel=0x374953;
 if(slot===0){s.beam([0,0,0],[0,.09,-.48],.055,0x916c4c);s.oval(0,.07,-.48,.12,.14,.14,steel)}
 else{s.box(0,.035,-.10,.093,.10,slot===1?.27:slot===2?.45:.68,steel);s.box(0,-.052,.012,.085,.15,.092,0x574a44,[-.19,0,0]);if(slot===3)s.box(0,-.017,-.25,.104,.078,.22,0xaf784e)}
 const model=s.finish(parent);model.position.set(.284,1.30,-.425);return model;
}
