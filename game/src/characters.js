import * as T from '../vendor/three.module.min.js';
import {sculpture,drawingMaterial} from './geometry.js';
export const ISLAND_CAST=['Inez Vale','Sol Arco','Paz Orta','Lio Fen'];
const patch=drawingMaterial(128,128,c=>{
 c.fillStyle='#20766e';c.fillRect(0,0,128,128);c.strokeStyle='#ffe1a0';c.lineWidth=5;c.beginPath();c.arc(64,51,34,Math.PI,2*Math.PI);c.stroke();c.fillStyle='#ffad64';c.beginPath();c.arc(64,53,22,Math.PI,2*Math.PI);c.fill();
 for(let i=0;i<4;i++){c.fillStyle=i%2?'#ff8b62':'#ffd482';c.fillRect(30+i*3,57+i*6,68-i*6,3)}c.textAlign='center';c.fillStyle='#fff1c2';c.font='900 20px sans-serif';c.fillText('SUNBREAK',64,102);
});
const coats=[0x258a82,0xf09768,0xc9b279,0xc45f6f,0x68a5ac,0xede0bd,0xb493b0,0x5b6667],skins=[0xb87c53,0xca926c,0x945f45,0xd9a57a];
const cache=new Map();
function sculptHuman(kind){
 const body=sculpture(),skin=skins[kind%4],coat=coats[kind%8],hero=kind===0,gang=kind===7,slacks=hero?0x334557:kind%3===1?0x546166:0x3e4557;
 body.tube(0,1.17,0,.244,.185,.58,coat,8);body.box(0,.91,0,.38,.09,.29,0x41434b);
 body.tube(0,1.50,0,.095,.107,.17,skin,9);body.oval(0,1.67,-.018,.31,.39,.30,skin);
 body.oval(0,1.79,.025,.33,.23,.32,0x3b302e);body.oval(0,1.68,.104,.31,.25,.15,0x3b302e);
 body.oval(0,1.66,-.167,.072,.09,.088,skin);
 for(const k of [-1,1]){body.oval(k*.147,1.66,0,.059,.096,.067,skin);body.box(k*.063,1.70,-.151,.067,.018,.017,0x332e34)}
 if(hero){body.oval(0,1.62,.137,.21,.22,.15,0x352d2c);body.tube(0,1.48,0,.15,.172,.072,0xe9654d,10);body.box(-.1,1.34,.175,.084,.25,.035,0xe86a4b,[0,0,-.23]);body.face([[-.156,1.04,.207],[.156,1.04,.207],[.156,1.39,.218],[-.156,1.39,.218]],0xffffff,patch)}
 if(gang||kind===2){body.tube(0,1.795,0,.125,.177,.09,gang?0xcb7753:0xeee1ae);body.tube(0,1.78,-.06,.194,.194,.018,gang?0xcb7753:0xeee1ae)}
 const root=new T.Group();body.finish(root);
 for(const k of [-1,1]){
  const leg=sculpture();leg.beam([0,0,0],[k*.019,-.39,.01],.087,slacks);leg.beam([k*.019,-.39,.01],[k*.02,-.75,.032],.074,slacks);leg.oval(k*.02,-.77,-.042,.173,.14,.31,hero?0xe3ccab:0x453e40);
  const limb=leg.finish(root);limb.position.set(k*.105,.85,0);
  const arm=sculpture();arm.beam([0,0,0],[k*.074,-.235,.018],.083,coat);arm.beam([k*.074,-.235,.018],[k*.071,-.431,-.044],.055,skin);arm.oval(k*.07,-.46,-.05,.105,.139,.12,skin);
  const sleeve=arm.finish(root);sleeve.position.set(k*.202,1.40,0);
 }
 return root;
}
export function createHuman(scene,kind=0){
 if(!cache.has(kind))cache.set(kind,sculptHuman(kind));const root=cache.get(kind).clone();scene.add(root);return root;
}
export function animateHuman(h,t,pace=0,aim=false){
 const wave=Math.sin(t)*Math.min(.80,pace*.22);
 h.children[1].rotation.x=wave;h.children[3].rotation.x=-wave;h.children[2].rotation.x=-wave*.77;
 h.children[4].rotation.x=aim?1.30:wave*.77;
 h.children[0].position.y=Math.abs(Math.cos(t))*.023*Math.min(1,pace);
}
