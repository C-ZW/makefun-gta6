import {draw} from './harbor.js';
import {s,actor,keys,tick,start,choose,interact,save,resumeSave,retry,reset,shove,say,destination} from './simulation.js';
import {wake,mix,toggle} from './sound.js';
import {blocks,vehicles,streetsX,streetsY,dist} from './district.js';
const $=id=>document.getElementById(id),menu=$('overlay'),rad=$('radar').getContext('2d');
let previous='',muted=false;
function button(key,title,note=''){return '<button data-act="'+key+'">'+title+(note?'<small>'+note+'</small>':'')+'</button>'}
function hasSave(){try{return !!localStorage.getItem('lowtide-4')}catch{return false}}
function menus(){
 if(previous===s.mode)return;previous=s.mode;
 document.body.classList.toggle('menu',s.mode!=='play');
 if(s.mode==='play'){menu.innerHTML='';return}
 let body='';
 if(s.mode==='title')body='<h1>LOW<br>TIDE <em>FM</em></h1><p>One stolen payroll tape. A harbor full of people who earned it. Someone wants the only copy gone before the tide turns.</p>'+button('start','↗  TUNE IN   [ENTER]')+(hasSave()?button('load','Resume saved game'):'');
 if(s.mode==='choice')body='<h2>One master copy.</h2><p>Nix slides the reel across the seat. “Proof the port skimmed our wages. Union radio will play it. Vale will pay to bury it.” A patrol rounds the quay.</p>'+button('air','1  /  Put it on air','Union Hall · $80 in gas money · yard gate opens')+button('cash','2  /  Sell the silence','East Ferry · $900 cash · yard gate stays locked');
 if(s.mode==='pause')body='<h2>Off the air.</h2>'+button('back','Continue   [ESC]')+button('save','Save & continue')+(hasSave()?button('load','Load saved game'):'')+button('fresh','Start a fresh story');
 if(s.mode==='caught')body='<h2>Boxed in.</h2><p>Harbor Patrol held you at the curb. The reel is back at the quay.</p>'+button('retry','Replay the getaway   [ENTER]');
 menu.innerHTML='<article class="sheet"><div class="eyebrow"><span>PORT SABLE &nbsp;/&nbsp; 88.6 MHz</span><span class="signal">▂▄▆█▆▄▂</span></div>'+body+'<div class="controls">WASD / arrows · move or drive &nbsp; F · enter / exit / deliver<br>Space · handbrake / shove &nbsp; Shift · run &nbsp; Esc · menu &nbsp; M · audio</div></article>';
}
function action(id){wake();if(id==='start')start();if(id==='fresh'){reset();start()}if(id==='air'||id==='cash')choose(id);if(id==='load'&&!resumeSave())say('Save unreadable.');if(id==='retry')retry();if(id==='back')s.mode='play';if(id==='save'){s.mode='play';save()}menus()}
menu.onclick=e=>{let b=e.target.closest('button');if(b)action(b.dataset.act)};
addEventListener('keydown',e=>{
 let k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright','tab'].includes(k)&&k!=='tab')e.preventDefault();keys.add(k);if(e.repeat)return;
 if(k==='enter'&&document.activeElement?.tagName==='BUTTON')return;
 if(s.mode==='title'&&k==='enter')action('start');else if(s.mode==='choice'&&['1','2'].includes(k))action(k==='1'?'air':'cash');
 else if(s.mode==='caught'&&k==='enter')action('retry');
 else if(k==='escape'&&['pause','play'].includes(s.mode)){s.mode=s.mode==='pause'?'play':'pause';keys.clear()}
 else if(s.mode==='play'){if(k==='f'||k==='e')interact();if(k===' ')shove();if(k==='m'){muted=toggle();say(muted?'Radio muted.':'Radio live.')}}
 menus();
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();if(s.mode==='play')s.mode='pause'});
function minimap(){
 let g=rad,p=actor(),X=x=>10+x*.302,Y=y=>12+y*.237;
 g.fillStyle='#558982';g.fillRect(0,0,220,152);g.fillStyle='#526365';g.fillRect(3,6,214,144);
 g.fillStyle='#acae96';for(let b of blocks)g.fillRect(X(b.x),Y(b.y),b.w*.302,b.d*.237);
 g.strokeStyle='#d8c99f';g.lineWidth=.65;for(let x of streetsX){g.beginPath();g.moveTo(X(x),8);g.lineTo(X(x),147);g.stroke()}for(let y of streetsY){g.beginPath();g.moveTo(4,Y(y));g.lineTo(216,Y(y));g.stroke()}
 function dot(o,r,col){g.fillStyle=col;g.beginPath();g.arc(X(o.x),Y(o.y),r,0,7);g.fill()}
 if(s.phase==='pickup'||s.phase==='drop'){let o=s.phase==='pickup'?vehicles[0]:destination();g.strokeStyle='#ffdb6b';g.lineWidth=2;g.strokeRect(X(o.x)-4,Y(o.y)-4,8,8)}
 if(s.heat==='search'){g.strokeStyle='#ffce72';g.beginPath();g.arc(X(s.last.x),Y(s.last.y),12,0,7);g.stroke()}
 dot(s.cop,3.4,s.heat==='search'?'#ffcc69':s.heat==='chase'?'#ff684b':'#92bccc');
 g.save();g.translate(X(p.x),Y(p.y));g.rotate(p.a);g.beginPath();g.moveTo(7,0);g.lineTo(-4,4);g.lineTo(-2,0);g.lineTo(-4,-4);g.closePath();g.fillStyle='#fff4cc';g.fill();g.strokeStyle='#25383b';g.lineWidth=1.2;g.stroke();g.restore();
}
function hud(){
 let p=actor(),driving=s.ride!==null;
 let task={pickup:'Steal the reel car',run:s.heat==='search'?'Stay out of sight':'Lose Harbor Patrol',drop:s.branch==='air'?'Broadcast the reel':'Meet Vale at the ferry',done:'Free roam'}[s.phase];
 $('chapter').textContent=s.phase==='done'?'SIDE B   /   EPILOGUE':'SIDE A   /   THE PAYROLL REEL';
 $('task').textContent=task;
 $('hint').textContent={pickup:'Find the orange coupe on Quay Road.',run:s.heat==='search'?'Keep a building between you and the beam.':s.branch==='air'?'Break sight around a warehouse. Union yard is open.':'Turn off the quay. Use a warehouse as cover.',drop:(s.branch==='air'?'Union Hall · west side':'East Ferry · waterfront')+' · '+Math.round(dist(p,destination()))+' m',done:(s.branch==='air'?'Union radio is live.':'The tape left on the ferry.')+'   $'+s.cash}[s.phase];
 let h=$('heat');h.className=s.heat==='chase'?'hot':s.heat==='search'?'search':'';
 h.textContent=s.heat==='chase'?(s.pin>1?'■  BOXED IN · MOVE!':'●  PATROL  /  IN PURSUIT'):s.heat==='search'?'◌  SEARCHING  /  '+Math.ceil(s.timer)+'s':'○  CHANNEL CLEAR';
 $('machine').textContent=driving?s.ride===0?'KESTREL / SPORT':'HARBOR SEDAN':'NIX’S COURIER';
 $('speed').textContent=driving?String(Math.round(Math.abs(p.v)*1.48)).padStart(2,'0'):'Foot';$('unit').textContent=driving?'KM/H':'PATROL';
 $('area').textContent=p.y<53?'QUAY ROAD':p.x>510?'EAST FERRY':p.y>310?'UNION WARD':'SALT YARDS';
 $('radio').textContent=s.msgTime>0?s.msg:'';
 $('actions').textContent=s.phase==='drop'&&dist(p,destination())<22?'F   HAND OVER REEL':!driving&&vehicles.some(c=>dist(c,p)<16)?'F   TAKE THE WHEEL':driving?'W/S  THROTTLE/BRAKE   ·   A/D  STEER   ·   SPACE  SLIDE':'WASD  WALK   ·   SHIFT  RUN   ·   F  TAKE CAR';
 minimap();
}
let last=performance.now();
function frame(now){let dt=Math.min(.09,(now-last)/1000);last=now;for(let n=0;n<3;n++)tick(dt/3);draw(dt);menus();if(s.mode==='play')hud();mix(s.ride===null?null:actor().v,s.heat,s.clock,s.mode==='play');requestAnimationFrame(frame)}
requestAnimationFrame(frame);
