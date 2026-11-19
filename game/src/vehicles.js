import * as T from '../vendor/three.module.min.js';
import {sculpture,ink,drawingMaterial} from './geometry.js';
export const VEHICLES=[
 {name:'Marlin GT',class:'Targa sport',max:48,pull:14,turn:1.52,grip:5.4,w:2.04,l:4.55},
 {name:'Pico 3',class:'Compact',max:30,pull:9,turn:2.1,grip:7,w:1.58,l:3.12},
 {name:'Baron LX',class:'Muscle',max:41,pull:12,turn:1.3,grip:3.4,w:2.05,l:4.8},
 {name:'Parcel 88',class:'Panel van',max:26,pull:6,turn:1.18,grip:6,w:2.08,l:4.85},
 {name:'Dune Hauler',class:'Pickup',max:33,pull:8.4,turn:1.45,grip:4.5,w:2.03,l:4.67},
 {name:'Moth 500',class:'Motorbike',max:42,pull:15,turn:2.35,grip:6.8,w:.73,l:2.2}
];
export const paints=[0xf28042,0x30a39b,0xd25663,0xd1c393,0x626fa2,0xb2c27d];
const dark=0x232c39,chrome=0xc2c2ae,rubber=0x18212a;
const plate=drawingMaterial(128,48,c=>{c.fillStyle='#ffe0a2';c.fillRect(0,0,128,48);c.textAlign='center';c.fillStyle='#9e5f51';c.font='bold 9px sans-serif';c.fillText('P O R T   V E L A',64,10);c.fillStyle='#252f37';c.font='bold 30px monospace';c.fillText('SUN•079',64,39)});
const badge=drawingMaterial(256,64,c=>{c.fillStyle='#ebdfbd';c.fillRect(0,0,256,64);c.fillStyle='#25414d';c.textAlign='center';c.font='bold 48px sans-serif';c.fillText('POLICE',128,50)});
const cache=new Map();
function hull(s,rows,c){
 for(let i=0;i<rows.length-1;i++){
   const [z,w,b,t]=rows[i],[Z,W,B,H]=rows[i+1];
   s.face([[-w,t,z],[w,t,z],[W,H,Z],[-W,H,Z]],c);
   for(const k of [-1,1])s.face([[k*w,b,z],[k*W,B,Z],[k*W,H,Z],[k*w,t,z]],c);
 }
 for(const [z,w,b,t] of [rows[0],rows.at(-1)])s.face([[-w,b,z],[w,b,z],[w,t,z],[-w,t,z]],c);
}
function wheel(s,x,y,z,r,side){
 const rot=[0,0,Math.PI/2];s.tube(x,y,z,r,r,.22,rubber,16,rot);const X=x+.12*side;
 s.tube(X,y,z,r*.71,r*.71,.028,chrome,16,rot);s.tube(X+side*.02,y,z,r*.52,r*.52,.032,dark,12,rot);
 for(let j=0;j<5;j++)s.box(X+side*.044,y,z,.025,r*1.04,.042,chrome,[j*Math.PI/5,0,0]);
}
function bike(s,c){
 for(const z of [-.72,.73]){wheel(s,0,.34,z,.33,1);wheel(s,-.03,.34,z,.32,-1)}
 s.beam([0,.34,-.72],[0,1.06,-.42],.075,chrome);s.beam([0,.4,.73],[0,.62,-.45],.09,dark);
 s.oval(0,.74,-.18,.52,.52,.77,c);s.box(0,.89,.39,.45,.16,.65,dark);s.box(0,.54,.04,.4,.4,.45,chrome);
 s.beam([-.32,1.12,-.44],[.32,1.12,-.44],.055,dark);s.oval(0,.94,-.64,.29,.28,.15,0xffe8a3,undefined,ink);s.box(0,.81,.78,.31,.13,.10,0xff4847,undefined,ink);
}
function carBody(s,i,c,police){
 const spec=VEHICLES[i],w=spec.w/2,l=spec.l/2,van=i===3,pick=i===4,compact=i===1;
 const h=van?1.1:pick?1.02:i===0?.78:.86,r=(pick||van)?.43:.365;
 hull(s,[[-l,w*.84,.28,h*.72],[-l*.80,w,.24,h*.91],[-l*.36,w,.23,h],[l*.56,w,.25,h+.02],[l*.96,w*.95,.29,h],[l,w*.85,.37,h*.85]],c);
 hull(s,[[-l*.99,w*.85,.26,.38],[-l*.8,w*1.013,.22,.35],[l*.92,w*.98,.23,.36],[l,w*.87,.28,.39]],dark);
 const front=van?-.72:pick?-.52:compact?-.64:-.39,back=van?.90:pick?.11:compact?.68:.53;
 const top=van?2.02:pick?1.72:compact?1.52:i===0?1.26:1.40,topW=w*(van?.92:.77);
 hull(s,[[front*l,w*.94,h-.015,h+.02],[(front+.17)*l,topW,h,top],[(back-.13)*l,topW,h,top],[back*l,w*.93,h,h+.035]],van?c:0x395461);
 const f=(front+.17)*l,b=(back-.13)*l;
 for(const side of [-1,1]){
   const W=side*topW*1.007,V=side*w*.942,edge=van?f+(b-f)*.38:b-.045;
   s.face([[V,h+.055,front*l+.06],[V,h+.055,van?edge:back*l-.09],[W,top-.063,edge],[W,top-.063,f+.035]],0x476775);
   s.beam([V,h+.02,front*l],[W,top,f],.04,c);s.beam([W,top,b],[V,h+.02,back*l],.07,c);
   s.beam([W,top-.025,f+(b-f)*.52],[V,h+.025,f+(b-f)*.52],.045,dark);
   s.box(side*(w+.075),h+.12,front*l+.24,.21,.115,.26,c);
   s.box(side*w*1.004,h-.14,.14,.025,.04,.25,chrome);
   s.box(side*w*1.008,h-.27,.03,.035,.048,l*1.55,police?0xeee1c1:chrome);
   for(const z of [-l*.61,l*.61])wheel(s,side*(w-.075),r,z,r,side);
   if(police){const A=side*(w+.028);s.face([[A,.42,side*.87],[A,.42,-side*.87],[A,h+.008,-side*.87],[A,h+.008,side*.87]],0xffffff,badge)}
 }
 s.face([[-topW,top+.012,f],[topW,top+.012,f],[topW,top+.012,b],[-topW,top+.012,b]],police?0xe8dcb9:c);
 if(i===0){s.box(0,top+.026,(f+b)/2,topW*1.77,.025,(b-f)*.77,dark);for(let j=0;j<6;j++)s.box(0,h+.13-j*.017,l*.55+j*.095,w*1.27,.035,.042,dark)}
 if(pick){s.box(0,h+.015,l*.54,w*1.69,.08,l*.79,dark);for(const K of [-1,1])s.box(K*w*.91,h+.17,l*.56,.13,.32,l*.80,c);s.box(0,h+.15,l*.94,w*1.82,.27,.1,c)}
 s.box(0,h*.59,l*.994,w*1.72,.23,.07,dark);
 for(const side of [-1,1]){s.box(side*w*.62,h*.67,l*1.016,w*.57,.115,.042,0xff463d,undefined,ink);s.box(side*w*.65,h*.64,-l*1.002,w*.47,.13,.045,0xffedb5,undefined,ink)}
 s.face([[-.26,.33,l+.052],[.26,.33,l+.052],[.26,.52,l+.052],[-.26,.52,l+.052]],0xffffff,plate);
 for(const side of [-1,1])s.tube(side*w*.65,.24,l*.99,.07,.08,.18,chrome,8,[Math.PI/2,0,0]);
 if(i===0||i===2){for(const k of [-1,1])s.box(k*w*.62,h+.09,l*.83,.1,.24,.14,dark);s.box(0,h+.235,l*.84,w*2.03,.095,.30,c)}
 if(police){s.box(0,top+.09,.02,1.33,.1,.4,dark);for(const side of [-1,1])s.box(side*.41,top+.19,.02,.58,.17,.34,side<0?0x36aaff:0xff4155,undefined,ink)}
}
export function spawnVehicle(scene,type,x,z,yaw=0,color=paints[type],role='parked'){
 const police=role==='patrol'||role==='block',key=[type,color,police].join('-');
 if(!cache.has(key)){const s=sculpture();if(type===5)bike(s,color);else carBody(s,type,color,police);cache.set(key,s.finish())}
 const model=cache.get(key).clone();scene.add(model);model.position.set(x,0,z);model.rotation.y=-yaw;
 const sc=sculpture();sc.oval(.12,.025,.12,VEHICLES[type].w*1.11,.025,VEHICLES[type].l*1.08,0x514955,undefined,ink);sc.finish(model);
 return {type,model,x,z,yaw,color,speed:0,slip:yaw,health:100,role,active:true};
}
export function poseCar(c,world){
 c.model.position.set(c.x,world.height(c.x,c.z),c.z);c.model.rotation.y=-c.yaw;
 c.model.rotation.z=c.lean||0;
}
