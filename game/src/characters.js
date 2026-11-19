import * as T from '../vendor/three.module.min.js';
import { shadowDisc } from './scenery.js';

export const cast = {
  ren:{name:'Ren Aster', role:'Boathouse driver', skin:'#b77e59', hair:'#29262b', shirt:'#d99349', portrait:'#41636a', hairStyle:'crop'},
  nera:{name:'Nera Vale', role:'Repair co-op owner', skin:'#916044', hair:'#241d21', shirt:'#4c847e', portrait:'#c47f63', hairStyle:'braid'},
  silas:{name:'Silas Quill', role:'Private freight broker', skin:'#c08a6e', hair:'#353036', shirt:'#795878', portrait:'#647986', hairStyle:'crop'},
  tess:{name:'Tess Daro', role:'Harbor dispatcher', skin:'#db9b6d', hair:'#5b3931', shirt:'#de7f5b', portrait:'#897d67', hairStyle:'bob'}
};

const box=new T.BoxGeometry(1,1,1), round=new T.IcosahedronGeometry(1,1);
const materials=new Map();
function matte(color) {
  if(!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,roughness:.94}));
  return materials.get(color);
}
function part(group,kind,color,x,y,z,w,h,d) {
  const m=new T.Mesh(kind,matte(color));
  m.position.set(x,y,z); m.scale.set(w,h,d); group.add(m); return m;
}

export function makeCharacter(scene, palette=cast.ren, detail=false) {
  const group = new T.Group(), rig = new T.Group(), top=new T.Group();
  const {skin,hair,shirt}=palette;
  const pants=palette.pants??0x263944;
  const shoes=palette.shoes??0x243138;
  group.add(rig); rig.add(top);
  part(top,round,shirt,0,1.253,0,.339,.405,.20);
  part(top,box,shirt,0,1.115,0,.494,.388,.322);
  part(top,box,pants,0,.941,0,.443,.185,.291);
  part(top,round,skin,0,1.738,-.013,.161,.207,.152);
  part(top,round,hair,0,1.824,.022,.174,.144,.161);
  part(top,box,skin,0,1.522,0,.143,.196,.132);
  if(detail) {
    const y=1.29;
    part(top,box,0xead8b4,0,y,-.166,.102,.354,.028);
    part(top,box,0x4d5c57,0,1.117,.169,.36,.22,.086);
    part(top,box,0xf3bb70,0,1.359,.164,.25,.059,.035);
    part(top,box,0x363d3d,0,1.297,.168,.245,.023,.025);
    part(top,box,0x473d36,.19,1.273,.145,.052,.39,.073).rotation.z=-.21;
    part(top,box,0x473d36,-.19,1.273,.145,.052,.39,.073).rotation.z=.21;
    part(top,box,0x262c32,0,.982,-.172,.418,.07,.034);
  }
  const legs=[], arms=[];
  for(const side of [-1,1]) {
    const leg=new T.Group(); leg.position.set(side*.14,.91,0); rig.add(leg); legs.push(leg);
    part(leg,box,pants,0,-.211,0,.187,.441,.198);
    const calf=new T.Group(); calf.position.y=-.40; leg.add(calf); leg.calf=calf;
    part(calf,box,pants,0,-.168,0,.148,.354,.151);
    part(calf,box,shoes,0,-.397,-.051,.167,.13,.282);
    const arm=new T.Group(); arm.position.set(side*.293,1.43,0); top.add(arm); arms.push(arm);
    part(arm,round,shirt,0,-.098,0,.107,.189,.101);
    part(arm,box,skin,0,-.302,-.009,.128,.29,.13);
    part(arm,round,skin,0,-.448,-.019,.074,.10,.071);
  }
  const gun=part(arms[1],box,0x252b2d,0,-.469,-.12,.065,.075,.28);
  gun.visible=false;
  group.add(shadowDisc(.41,.36,.35));
  scene.add(group);
  return {group,rig,top,arms,legs,gun,stride:0,
    pose(x,z,yaw,speed,dt,aim=false,fallen=false) {
      group.position.set(x,.012,z); group.rotation.y=yaw;
      this.stride+=dt*(speed>1.0?speed*1.55:2);
      const weight=Math.min(speed*.15,.99), beat=Math.sin(this.stride)*weight;
      rig.rotation.x=fallen?-Math.PI/2:Math.min(speed*.012,.12);
      rig.position.y=fallen?.18:Math.abs(beat)*.044;
      top.rotation.y=beat*.06;
      gun.visible=aim&&!fallen;
      for(let i=0;i<2;i++) {
        const swing=beat*(i===0?1:-1);
        legs[i].rotation.x=swing;
        legs[i].calf.rotation.x=Math.min(0,swing*.82);
        arms[i].rotation.x=aim?1.47+swing*.16:-swing*.76;
        arms[i].rotation.z=i===0?-.1:.1;
      }
    }
  };
}

export function portraitFor(person) {
  const c=document.createElement('canvas'); c.width=120;c.height=120;
  const ctx=c.getContext('2d');
  const poly=(fill,points)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
  ctx.fillStyle=person.portrait;ctx.fillRect(0,0,120,120);
  for(let i=0;i<8;i++) poly('#ffffff17',[[i*20-50,0],[i*20-44,0],[i*20+42,120],[i*20+36,120]]);
  poly('#ffe1a45e',[[6,89],[104,22],[116,40],[18,107]]);
  poly(person.shirt,[[5,120],[13,99],[44,87],[82,90],[105,101],[119,120]]);
  poly(person.hair,[[33,31],[55,14],[84,19],[96,36],[94,67],[89,89],[38,90],[26,62]]);
  poly(person.skin,[[53,70],[74,69],[78,91],[66,108],[48,91]]);
  poly(person.skin,[[39,42],[71,29],[88,45],[84,69],[73,85],[59,87],[43,72],[34,58]]);
  poly('#573b3869',[[71,34],[88,45],[84,69],[73,85],[63,86],[72,70],[68,58]]);
  poly(person.hair,[[33,26],[54,15],[84,18],[92,34],[75,35],[60,41],[44,42],[38,55],[33,55]]);
  if(person.hairStyle==='braid') poly(person.hair,[[86,34],[96,49],[94,81],[83,103],[79,85],[86,65]]);
  if(person.hairStyle==='bob') poly(person.hair,[[33,25],[28,38],[28,73],[42,85],[38,57],[41,37]]);
  poly('#302c30',[[45,52],[57,49],[60,53],[47,56]]);
  poly('#302c30',[[69,48],[80,47],[83,51],[69,52]]);
  poly('#834b48',[[56,72],[69,71],[73,73],[66,76],[57,75]]);
  poly('#fff0bf',[[35,63],[40,63],[39,71],[35,70]]);
  return c.toDataURL();
}
