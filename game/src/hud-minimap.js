import {roads,buildings,landmarks,distance,hideouts} from './district.js';
import {objective,target} from './story.js';
const map=document.querySelector('#map'),c=map.getContext('2d');
const el=Object.fromEntries(['heat','wallet','mission','radio','telemetry','prompt'].map(k=>[k,document.getElementById(k)]));
export function updateHUD(s){
 const p=s.police,w=Math.ceil(p.wanted);el.heat.innerHTML='★'.repeat(w)+'<span style="opacity:.25">'+'☆'.repeat(5-w)+'</span><small>'+(p.mode==='clear'?'OFF THE RADAR':p.mode==='pursuit'?'PURSUIT · BREAK LINE OF SIGHT':'SEARCH · '+Math.ceil(p.remaining)+'s UNSEEN')+'</small>';
 el.wallet.innerHTML='$'+s.money.toLocaleString()+'<small>'+(s.completed?'DEAD AIR COMPLETE':'MARA VALE / COURIER')+'</small>';
 el.mission.innerHTML='<b>'+(s.stage==='done'?'SOUTH QUAY / YOUR CITY':'DEAD AIR / '+({meet:'01 · THE CONTACT',steal:'02 · THE GETAWAY',deliver:'03 · '+(s.branch==='broadcast'?'THE TRUTH':'THE PAYDAY'),escape:'04 · DISAPPEAR'}[s.stage]))+'</b>'+objective(s);
 el.radio.textContent=s.time<s.messageUntil?s.message:'';
 el.telemetry.innerHTML=(s.car?Math.round(Math.abs(s.car.speed)*.32)+' <span style="font-size:13px">KM/H</span>':'ON FOOT')+'<small>'+(s.car?s.car.name:'MARA / '+(s.branch==='broadcast'&&s.delivered?'NEIGHBORHOOD ALLY':'SOUTH QUAY'))+'</small><div class="bar"><i style="width:'+Math.max(0,s.car?s.car.hp:s.health)+'%"></i></div><small>'+(s.car?'VEHICLE':'HEALTH')+' '+Math.round(s.car?s.car.hp:s.health)+'%</small>';
 let prompt='';const t=target(s);if(t&&distance(t,s.player)<100)prompt=s.stage==='steal'?'E · Steal the tape van':s.stage==='done'?'F · Repair & heal / $100':'F · '+(s.stage==='meet'?'Talk to Ivo':'Deliver the tape');else if(!s.car&&s.cars.some(c=>distance(c,s.player)<85&&c.hp>0))prompt='E · Steal nearby vehicle';else if(s.car&&Math.abs(s.car.speed)<30)prompt='W · Accelerate   S · Brake / reverse   E · Exit';if(s.choosing)prompt='';el.prompt.textContent=prompt;
 c.fillStyle='#183943';c.fillRect(0,0,190,174);const scale=.07,ox=8,oy=5;c.fillStyle='#9dbaaa';c.fillRect(ox,oy,157,162);c.fillStyle='#559e9e';c.fillRect(166,0,24,174);
 c.strokeStyle='#49646a';c.lineWidth=7;for(const r of roads){c.beginPath();c.moveTo(ox+r*scale,oy+8);c.lineTo(ox+r*scale,oy+159);c.moveTo(ox+8,oy+r*scale);c.lineTo(ox+157,oy+r*scale);c.stroke();}c.fillStyle='#c8c7a1';for(const b of buildings)c.fillRect(ox+b.x*scale,oy+b.y*scale,b.w*scale,b.h*scale);
 function dot(o,col,r=3){c.beginPath();c.arc(ox+o.x*scale,oy+o.y*scale,r,0,Math.PI*2);c.fillStyle=col;c.fill();}
 if(p.mode==='search'){c.beginPath();c.arc(ox+p.last.x*scale,oy+p.last.y*scale,24,0,Math.PI*2);c.fillStyle='#ffcd7450';c.fill();}
 for(const u of p.units)dot(u,p.mode==='pursuit'?'#ff6f65':'#93d9f0',3);if(s.branch==='broadcast'&&s.delivered)for(const h of hideouts)dot(h,'#7df8bc',4);if(t)dot(t,'#ffce73',5);dot(s.player,'#fff6da',4);
 c.strokeStyle='#fff4da';c.lineWidth=1.5;c.beginPath();c.moveTo(ox+s.player.x*scale,oy+s.player.y*scale);c.lineTo(ox+s.player.x*scale+Math.cos(s.player.a)*9,oy+s.player.y*scale+Math.sin(s.player.a)*9);c.stroke();
}
