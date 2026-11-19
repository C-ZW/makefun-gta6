import {drawingMaterial,ink} from './geometry.js';
import {landmarks} from './districts.js';
export function hillsideVilla(s,x,z,index,blocks){
 const plaster=[0xe4bc98,0xefcea8,0xd8b0a3][index%3],tile=0xb96d55;
 s.box(x,.65,z,25,1.2,15,0xcba98b);s.box(x,3.4,z,18,4.5,12,plaster);blocks.push({x,z,w:18,d:12});
 for(const side of [-1,1]){
  s.face([[x-10,5.7,z+side*7],[x+10,5.7,z+side*7],[x+10,8.6,z],[x-10,8.6,z]],tile);
  for(let dx=-9.7;dx<10;dx+=.62)s.beam([x+dx,5.74,z+side*7],[x+dx,8.65,z],.07,0xd18a65,5);
  s.face([[x+side*9,5.62,z-6],[x+side*9,8.2,z],[x+side*9,5.62,z+6]],plaster);
  for(let j=-1;j<=1;j++){s.box(x+j*5,3.4,z+side*6.05,2.8,2.1,.12,0x58878a);for(let k of [-1,1])s.box(x+j*5+k*1.72,3.4,z+side*6.12,.55,2.14,.15,0x388478)}
  s.box(x+side*10,1.37,z+9,.45,1.0,5.8,plaster);s.oval(x+side*10,3.0,z+9,2.4,4.3,2.1,0x648964);
 }
 for(let j=0;j<4;j++)s.box(x,1.1-j*.25,z+6.5+j*.75,4.7,.35,1,0xd9bca1);
}
const containerInk=drawingMaterial(256,96,c=>{c.fillStyle='#2c6265';c.fillRect(0,0,256,96);c.strokeStyle='#e9d9a6';c.lineWidth=2;c.strokeRect(4,4,248,88);c.fillStyle='#e9d9a6';c.font='italic 900 38px sans-serif';c.fillText('V E L A',16,48);c.font='bold 12px monospace';c.fillText('ISLAND SHIPPING   /   04',17,75)});
export function cargoStencil(s,x,z){s.face([[x-2,1.02,z+2.47],[x+2,1.02,z+2.47],[x+2,2.47,z+2.47],[x-2,2.47,z+2.47]],0xffffff,containerInk)}
export function quayGantry(s){
 const x=-48,z=-104,gold=0xdc9d51,steel=0x674f4c;
 for(const k of [-1,1]){
  const X=x+k*9.5;s.box(X,.48,z,2.3,.78,5.7,steel);
  for(const dz of [-2,2])s.beam([X,.8,z+dz],[X+k*.44,10,z+dz],.24,gold);
  for(let j=1;j<9;j+=2)s.beam([X,j,z-2],[X+k*.35,j+1.75,z+2],.105,steel);
 }
 for(const dz of [-2,2]){s.beam([x-11,9.2,z+dz],[x+11,9.2,z+dz],.20,gold);s.beam([x-11,10.8,z+dz],[x+11,10.8,z+dz],.24,gold);
  for(let j=-10;j<10;j+=2)s.beam([x+j,9.2,z+dz],[x+j+1.3,10.8,z+dz],.095,gold)}
 const mat=drawingMaterial(512,96,c=>{c.fillStyle='#294c55';c.fillRect(0,0,512,96);c.fillStyle='#f5dfab';c.textAlign='center';c.font='900 41px sans-serif';c.fillText('COPPER   QUAY',256,50);c.font='bold 14px monospace';c.fillText('PORT   AUTHORITY      /      CARGO   GATE   04',256,79)});
 s.face([[x-6.3,8.85,z+2.24],[x+6.3,8.85,z+2.24],[x+6.3,11.15,z+2.24],[x-6.3,11.15,z+2.24]],0xffffff,mat);
 for(const k of [-1,1]){s.box(x+k*7.6,9,z+2.22,1.6,.9,.42,steel);s.box(x+k*7.6,8.99,z+2.45,1.37,.61,.055,0xffe2a0,undefined,ink)}
}
export function serviceKiosks(s){
 for(const [name,letter,text] of [['shop','$','PALMA MOTORS'],['home','H','SAFEHOUSE'],['race','R','STRAND SPRINT'],['courier','P','NIGHT MAIL']]){
  const [x,z]=landmarks[name],accent=name==='home'?'#3d7972':'#b56954';
  const mat=drawingMaterial(160,192,c=>{c.fillStyle=accent;c.fillRect(0,0,160,192);c.strokeStyle='#fce2a7';c.lineWidth=4;c.strokeRect(5,5,150,182);c.fillStyle='#ffe7ab';c.textAlign='center';c.font='900 104px sans-serif';c.fillText(letter,80,120);c.font='bold 14px monospace';c.fillText(text,80,163,142)});
  s.box(x,1.6,z,.12,3.2,.12,0x505e60);s.box(x,2.7,z,1.1,1.32,.13,0x596460);s.face([[x-.52,2.07,z+.075],[x+.52,2.07,z+.075],[x+.52,3.32,z+.075],[x-.52,3.32,z+.075]],0xffffff,mat);
 }
}
