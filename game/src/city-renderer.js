import {roads,buildings,hideouts,landmarks} from './district.js';
import {target} from './story.js';
const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
export const camera={x:600,y:820,zoom:1,w:1280,h:800};
export function project(x,y,z=0){return {x:camera.w/2+(x-camera.x+(y-camera.y)*.18)*camera.zoom,y:camera.h*.52+(y-camera.y)*.72*camera.zoom-z*camera.zoom};}
export function unproject(x,y){const wy=(y-camera.h*.52)/(.72*camera.zoom)+camera.y;return {x:(x-camera.w/2)/camera.zoom+camera.x-(wy-camera.y)*.18,y:wy};}
function polygon(points,fill,stroke){ctx.beginPath();for(let i=0;i<points.length;i++){const p=project(...points[i]);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function slab(x,y,w,h,color,z=0){polygon([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],color);}
function line(x,y,x2,y2,color,width=1,z=0){const a=project(x,y,z),b=project(x2,y2,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width*camera.zoom;ctx.stroke();}
function label(text,x,y,size=12,color='#fff2cf',z=0){const p=project(x,y,z);ctx.font=`bold ${size*camera.zoom}px Arial`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,p.x,p.y);}
function ellipse(x,y,rx,ry,color,z=0){const p=project(x,y,z);ctx.beginPath();ctx.ellipse(p.x,p.y,rx*camera.zoom,ry*camera.zoom,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function box(x,y,w,h,z,color){slab(x+20,y+17,w,h,'#203f4240');polygon([[x,y+h,0],[x+w,y+h,0],[x+w,y+h,z],[x,y+h,z]],color);polygon([[x+w,y,0],[x+w,y+h,0],[x+w,y+h,z],[x+w,y,z]],'#957d68');slab(x,y,w,h,'#f2d6a4',z);}
function renderGround(s){
 ctx.fillStyle='#73b6ae';ctx.fillRect(0,0,camera.w,camera.h);
 slab(55,60,2210,2300,'#dfd2a8');slab(2140,60,126,2300,'#f1d9a1');slab(2266,60,150,2300,'#9ed0b4');
 for(let y=100;y<2400;y+=80){line(2290,y,2450,y-20,'#c3e0c8',2);line(2370,y+20,2570,y,'#abd5c0',1);}
 for(const r of roads){slab(100,r-65,2130,130,'#e7dec2');slab(r-65,100,130,2200,'#e7dec2');slab(100,r-49,2130,98,'#52656a');slab(r-49,100,98,2200,'#52656a');}
 for(const r of roads){for(let q=125;q<2230;q+=47){if(roads.some(n=>Math.abs(q-n)<66))continue;slab(q,r-1,23,2,'#d9ba78');slab(r-1,q,2,23,'#d9ba78');}line(110,r-45,2220,r-45,'#a2aaa0');line(r-45,110,r-45,2240,'#a2aaa0');}
 for(const x of roads)for(const y of roads){for(let i=-34;i<=34;i+=13){slab(x+i,y-66,7,16,'#e2ddc5');slab(x-66,y+i,16,7,'#e2ddc5');}slab(x-46,y-46,92,92,'#53666b');}
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=roads[col]+76,y=roads[row]+76;slab(x,y,288,288,'#c4c39a');slab(x+7,y+170,275,26,'#e6d3ad');for(let k=0;k<4;k++)slab(x+8+k*64,y+277,48,3,'#f4e6bd');}
 label('P E L I C A N   A V E N U E',1110,727,12,'#e3d6ae');label('S O U T H   Q U A Y',1120,1170,13,'#d8cba5');label('O C E A N   D R I V E',2020,2060,12,'#e3d6ae');
 for(let y=420;y<2180;y+=340){slab(2220,y,155,24,'#a78059');for(let i=0;i<12;i++)line(2220+i*12,y,2220+i*12,y+24,'#d8b682');ellipse(2382,y+25,20,40,'#eff0d0');slab(2374,y+5,16,35,'#6d9da5');}
 for(const skid of s.skids){line(skid.x-9,skid.y-5,skid.x-9-Math.cos(skid.a)*20,skid.y-5-Math.sin(skid.a)*20,'#233d4266',3);line(skid.x+9,skid.y+5,skid.x+9-Math.cos(skid.a)*20,skid.y+5-Math.sin(skid.a)*20,'#233d4266',3);}
 if(s.branch==='broadcast'&&s.delivered)for(const h of hideouts){ellipse(h.x,h.y,48,29,'#9ee8b85a');label('SAFE COURTYARD',h.x,h.y-32,10,'#214f43');}
 if(s.roadblocks){for(let x=1860;x<1950;x+=28){slab(x,1610,20,20,'#ebbd79');line(x,1610,x+20,1630,'#38484c',5);}label('POLICE ROADBLOCK',1900,1585,10,'#bd563f');}
}
function renderBuilding(b,s){
 const {x,y,w,h,z}=b;const near=s.player.x>x-12&&s.player.x<x+w+12&&s.player.y>y-80&&s.player.y<y+h;
 ctx.globalAlpha=near?.48:1;
 polygon([[x,y,0],[x+w,y,0],[x+w+55,y+h+40,0],[x+55,y+h+40,0]],'#354b4938');
 box(x,y,w,h,z,b.color);
 slab(x+7,y+7,w-14,h-14,'#e5c897',z+1);slab(x+12,y+12,w-24,h-24,'#d8bb92',z+2);
 for(let n=18;n<w-12;n+=38){polygon([[x+n,y+h,11],[x+n+22,y+h,11],[x+n+22,y+h,z-10],[x+n,y+h,z-10]],'#41666b');line(x+n+10,y+h,x+n+10,y+h,'#b7d8c2',1,z-13);slab(x+n-2,y+h-1,26,8,'#f1dcad',z-7);}
 for(let n=18;n<h-15;n+=34)polygon([[x+w,y+n,13],[x+w,y+n+16,13],[x+w,y+n+16,z-12],[x+w,y+n,z-12]],'#647d78');
 if(b.id<20){box(x+25,y+25,47,32,z+12,'#b7b3a0');slab(x+28,y+27,41,26,'#9aa49a',z+13);for(let i=0;i<5;i++)line(x+32,y+31+i*4,x+64,y+31+i*4,'#677d78',1,z+14);
  slab(x+95,y+45,92,36,'#2e5961',z+3);label(b.name,x+w/2,y+71,12,'#f8deb0',z+5);
  for(let n=0;n<5;n++)slab(x+8+n*(w-16)/5,y+h-2,(w-16)/5,24,n%2?'#f6d2a1':'#e28c70',21);
  if(b.id===7){line(x+175,y+20,x+175,y+20,'#2a525e',3,z+95);const p=project(x+175,y+20,z+62);ctx.strokeStyle='#f2d9b7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,18,Math.PI*.2,Math.PI*1.7);ctx.stroke();}
 }
 ctx.globalAlpha=1;
}
function renderPalm(x,y,seed){
 ellipse(x+22,y+12,32,10,'#284e4533');line(x,y,x+6,y-6,'#9b8b61',7,0);const root=project(x,y),top=project(x+6,y-6,65);ctx.strokeStyle='#8b8057';ctx.lineWidth=5*camera.zoom;ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.quadraticCurveTo(root.x-3,top.y+22,top.x,top.y);ctx.stroke();
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7+seed;const dx=Math.cos(a)*37*camera.zoom,dy=Math.sin(a)*20*camera.zoom;ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.quadraticCurveTo(top.x+dx*.65,top.y+dy-14,top.x+dx,top.y+dy+9);ctx.quadraticCurveTo(top.x+dx*.4,top.y+dy+3,top.x,top.y);ctx.fillStyle=i%2?'#4c9476':'#36775f';ctx.fill();}
}
function renderCar(c,s){
 const p=project(c.x,c.y),z=c.hp<=0?0:7;ctx.save();ctx.translate(p.x,p.y);ctx.transform(camera.zoom,0,.18*camera.zoom,.72*camera.zoom,0,0);ctx.rotate(c.a);const l=c.length,w=c.width;
 ctx.fillStyle='#183d4555';ctx.fillRect(-l/2+9,-w/2+10,l,w);ctx.fillStyle='#243c40';ctx.fillRect(-l*.34,-w/2-3,14,w+6);ctx.fillRect(l*.25,-w/2-3,12,w+6);
 ctx.translate(0,-z);ctx.fillStyle=c.hp<=0?'#53534e':c.color;ctx.beginPath();ctx.roundRect(-l/2,-w/2,l,w,5);ctx.fill();ctx.fillStyle='#f5e5c177';ctx.fillRect(-l/2+4,-w/2+2,l-9,3);ctx.fillStyle='#244d59';ctx.fillRect(l*.04,-w/2+4,12,w-8);ctx.fillRect(-l*.28,-w/2+4,8,w-8);ctx.fillStyle=c.police?'#244550':c.color;ctx.fillRect(-l*.15,-w/2+3,l*.19,w-6);ctx.fillStyle='#fae6b0';ctx.fillRect(l/2-3,-w/2+3,4,6);ctx.fillRect(l/2-3,w/2-9,4,6);ctx.fillStyle='#e86756';ctx.fillRect(-l/2,-w/2+3,3,5);ctx.fillRect(-l/2,w/2-8,3,5);
 if(c.police){ctx.fillStyle='#e1e5d7';ctx.fillRect(-7,-w/2+4,9,w-8);ctx.fillStyle=Math.sin(s.time*12)>0?'#fb705f':'#62d7f5';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=s.police.wanted?15:0;ctx.fillRect(-3,-11,5,22);ctx.shadowBlur=0;}
 ctx.restore();if(c===s.car){ellipse(c.x,c.y,4,3,'#ffe1a1',26);}if(c.hp<35){ellipse(c.x-8,c.y-6,12,15,'#565f5c77',20+Math.sin(s.time*8)*8);}
}
function renderPerson(p,s,player=false){
 const q=project(p.x,p.y);if(p.hp<=0){ellipse(p.x,p.y,12,5,'#6e7160');return;}ellipse(p.x+5,p.y+5,10,4,'#233e4f44');const walk=Math.sin(s.time*(p.panic?18:9))*3;ctx.strokeStyle='#2f4951';ctx.lineWidth=4*camera.zoom;ctx.beginPath();ctx.moveTo(q.x-3,q.y-8);ctx.lineTo(q.x-4-walk,q.y);ctx.moveTo(q.x+3,q.y-8);ctx.lineTo(q.x+4+walk,q.y);ctx.stroke();ctx.fillStyle=player?'#f28065':p.color;ctx.fillRect(q.x-6*camera.zoom,q.y-21*camera.zoom,12*camera.zoom,14*camera.zoom);ellipse(p.x,p.y,5,5,'#d6a273',26);
 if(player){const a=p.a,hand=project(p.x+Math.cos(a)*20,p.y+Math.sin(a)*20,15),body=project(p.x,p.y,15);ctx.strokeStyle='#183d4a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(body.x,body.y);ctx.lineTo(hand.x,hand.y);ctx.stroke();label('MARA',p.x,p.y,9,'#fff1bf',43);}
 if(p.panic)label('!',p.x,p.y,15,'#f66f50',42);
}
function renderPoliceCones(s){for(const c of s.police.units){if(c.hp<=0)continue;const range=s.police.mode==='search'?260:350;const a=c.a;polygon([[c.x,c.y,0],[c.x+Math.cos(a-.62)*range,c.y+Math.sin(a-.62)*range,0],[c.x+Math.cos(a+.62)*range,c.y+Math.sin(a+.62)*range,0]],s.police.mode==='pursuit'?'#f26a5d19':'#ffdf8d20');if(s.police.wanted)label(c.sees?'VISUAL / PURSUIT':s.police.mode==='search'?'SEARCHING':'PATROL',c.x,c.y,9,c.sees?'#ffb091':'#fff0ad',44);}}
function renderMarker(o,text,s,color='#ffd582'){if(!o)return;ellipse(o.x,o.y,34+Math.sin(s.time*3)*3,20,color+'44');const p=project(o.x,o.y,56+Math.sin(s.time*3)*4);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(p.x,p.y+12);ctx.lineTo(p.x-10,p.y-6);ctx.lineTo(p.x+10,p.y-6);ctx.closePath();ctx.fill();label(text,o.x,o.y,10,color,78);}
export function renderCity(s,dt){
 const w=innerWidth,h=innerHeight;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}camera.w=w;camera.h=h;camera.zoom=Math.min(w/1180,h/740);const look=s.car?80:0;camera.x+=(s.player.x+Math.cos(s.player.a)*look-camera.x)*Math.min(1,dt*4);camera.y+=(s.player.y+Math.sin(s.player.a)*look-camera.y)*Math.min(1,dt*4);
 renderGround(s);renderPoliceCones(s);
 const items=buildings.map(b=>({y:b.y+b.h,draw:()=>renderBuilding(b,s)}));
 for(const x of roads)for(let y=200;y<2280;y+=200)items.push({y,draw:()=>renderPalm(x-77,y,x+y)});
 for(const c of [...s.cars,...s.police.units])items.push({y:c.y+15,draw:()=>renderCar(c,s)});
 for(const p of s.people)items.push({y:p.y,draw:()=>renderPerson(p,s)});
 if(!s.car)items.push({y:s.player.y,draw:()=>renderPerson(s.player,s,true)});
 items.sort((a,b)=>a.y-b.y);for(const item of items)item.draw();
 renderMarker(target(s),s.stage==='meet'?'IVO / F':s.stage==='steal'?'THE TAPE / E':s.stage==='deliver'?(s.branch==='broadcast'?'RADIO PELICAN / F':'SABLE / F'):'QUAY CUSTOMS / F',s);
 if(s.police.mode==='search'){const p=s.police.last;ellipse(p.x,p.y,38,24,'#f6ce7933');label('LAST SEEN',p.x,p.y,10,'#f5ce8a',12);}
 for(const b of s.bullets){line(b.x,b.y,b.tx,b.ty,'#fff4a5',2,16);ellipse(b.x,b.y,9,7,'#ffcc73',16);if(b.hit)ellipse(b.tx,b.ty,8,8,'#ffe7a7',15);}
 const tint=ctx.createLinearGradient(0,0,w,h);tint.addColorStop(0,'#ffba6314');tint.addColorStop(1,'#123b4b12');ctx.fillStyle=tint;ctx.fillRect(0,0,w,h);
 if(!s.car&&!s.paused){const m=project(s.aim.x,s.aim.y);ctx.strokeStyle='#fff5d0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(m.x,m.y,7,0,Math.PI*2);ctx.moveTo(m.x-13,m.y);ctx.lineTo(m.x-4,m.y);ctx.moveTo(m.x+4,m.y);ctx.lineTo(m.x+13,m.y);ctx.stroke();}
}
