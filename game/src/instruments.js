import {actor,s,destination} from './simulation.js';
import {vehicles,dist} from './district.js';
// Radio fascia, folded chart and dash are painted into the same frame as the harbor.
export function paintInstruments(g,radar,info){
 const w=innerWidth,h=innerHeight,u=Math.max(.76,Math.min(1.1,w/1180,h/690)),ww=w/u,hh=h/u;
 const navy='#233b3c',cream='#ffe8bf',gold='#ffd070',muted='#c6cdb7';
 g.save();g.scale(u,u);g.textAlign='left';g.textBaseline='alphabetic';
 function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
 function label(str,x,y,size,color=cream,font='bold monospace'){
 g.fillStyle=color;g.font=font.replace(' ', ' '+size+'px ');g.fillText(str,x,y);
 }
 function panel(x,y,w,h){rect(x+3,y+4,w,h,'#23343940');rect(x,y,w,h,navy)}
 panel(20,20,244,43);rect(25,25,33,33,gold);
 for(let j=0;j<3;j++){g.beginPath();g.strokeStyle=navy;g.lineWidth=2.5;for(let i=0;i<24;i++){let y=34+j*6+Math.sin(i*.28)*2;i?g.lineTo(30+i,y):g.moveTo(30+i,y)}g.stroke()}
 label('LOW TIDE FM',67,43,20,cream,'900 Arial');label('PORT SABLE PIRATE RADIO',68,55,8,muted);rect(199,26,1,31,'#a4ad93');label('88.6',209,46,17,gold,'bold Georgia');
 let wide=Math.min(335,ww*.52);
 panel(20,73,wide,80);rect(20,73,3,80,gold);
 label(info.chapter,34,89,10,gold);label(info.task,33,113,22,cream,'bold Georgia');
 let words=info.hint.split(' '),row='',yy=132;g.font='12px Arial';
 for(let word of words){let next=row?row+' '+word:word;if(g.measureText(next).width>wide-27&&row){label(row,34,yy,12,muted,'normal Arial');yy+=14;row=word}else row=next}label(row,34,yy,12,muted,'normal Arial');
 let hot=s.heat==='chase',search=s.heat==='search',light=hot?'#ff9c75':search?gold:'#b9d3b5';
 g.font='bold 12px monospace';let hw=g.measureText(info.heat).width+26;rect(ww-20-hw,20,hw,32,hot?'#833f32':search?'#63512e':navy);rect(ww-20-hw,20,hw,3,light);
 label(info.heat,ww-7-hw,41,12,light);
 let mw=176,mh=151,mx=20,my=hh-20-mh;
 panel(mx,my,mw,mh);label('PORT SABLE',mx+8,my+15,10);label('N ↑',mx+mw-27,my+15,9,gold);
 g.drawImage(radar,mx+7,my+21,mw-14,109);label(info.area,mx+8,my+144,9,muted);
 const dx=ww-159,dy=hh-100;panel(dx,dy,139,80);rect(dx,dy+77,139,3,gold);label(info.machine,dx+11,dy+17,10,gold);
 label(info.speed,dx+10,dy+57,40,cream,'900 Arial');label(info.unit,dx+86,dy+56,10,muted);
 for(let i=0;i<18;i++)rect(dx+12+i*6.6,dy+67,1,i%3?3:6,'#b2bba4');
 g.textAlign='center';function center(str,base,size,font,col){
 g.font=font.replace(' ',' '+size+'px ');let width=g.measureText(str).width+24;
 rect((ww-width)/2,base-17,width,26,navy);label(str,ww/2,base+1,size,col,font);
 }
 center(info.actions,hh-29,10,'bold monospace',cream);
 if(s.msgTime>0)center(s.msg,hh-63,15,'italic Georgia',gold);
 g.restore();
}
