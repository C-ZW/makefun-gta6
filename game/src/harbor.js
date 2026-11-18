import {blocks,buildings,props,walkers,vehicles,streetsX,streetsY,gate,dist,clamp} from './district.js';
import {s,actor,destination,gateOpen} from './simulation.js';
const cv=document.querySelector('#city'),g=cv.getContext('2d');
let W,H,Z,cx=96,cy=-3,t=0;
const ink='#323e42',ivory='#ffe7b3',sea='#428887';
function pt(x,y,h=0){return [W*.5+((x-cx)*.91-(y-cy)*.56)*Z,H*.52+((x-cx)*.34+(y-cy)*.55-h*.88)*Z]}
function poly(ps,color,stroke){g.beginPath();ps.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.fillStyle=color;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=.8;g.stroke()}}
function flat(x,y,w,d,z,color){poly([pt(x,y,z),pt(x+w,y,z),pt(x+w,y+d,z),pt(x,y+d,z)],color)}
function line(a,b,color,width=1){g.beginPath();g.moveTo(...a);g.lineTo(...b);g.strokeStyle=color;g.lineWidth=width;g.stroke()}
function wire(x,y,h,X,Y,H,col,w){line(pt(x,y,h),pt(X,Y,H),col,w)}
function box(x,y,w,d,h,p,z=0){
 const a=pt(x,y,z+h),b=pt(x+w,y,z+h),c=pt(x+w,y+d,z+h),e=pt(x,y+d,z+h);
 poly([e,c,pt(x+w,y+d,z),pt(x,y+d,z)],p[0]);
 poly([c,b,pt(x+w,y,z),pt(x+w,y+d,z)],p[1]);
 poly([a,b,c,e],p[2]);
}
function circle(p,r,col){g.beginPath();g.arc(...p,r,0,Math.PI*2);g.fillStyle=col;g.fill()}
function sign(x,y,h,w,ht,str,bg,fg,side=false){
 const a=pt(x,y,h);g.save();g.transform(side?-.56*Z:.91*Z,side?.55*Z:.34*Z,0,.88*Z,...a);
 g.fillStyle=bg;g.fillRect(0,0,w,ht);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='900 '+(ht*.81)+'px Arial';g.fillText(str,w/2,ht*.55,w*.93);g.restore();
}
function roofType(x,y,z,scale,str,color){
 let p=pt(x,y,z);g.save();g.transform(.91*Z,.34*Z,-.56*Z,.55*Z,...p);
 g.textAlign='left';g.textBaseline='alphabetic';g.font='900 '+scale+'px Arial';g.fillStyle=color;g.fillText(str,0,0);g.restore();
}
function tank(x,y,z,r,h){
 const sides=16,ring=(i,H)=>pt(x+Math.cos(i*2*Math.PI/sides)*r,y+Math.sin(i*2*Math.PI/sides)*r,H);
 for(let i=0;i<sides;i++){let a=(i+.5)*2*Math.PI/sides;if(Math.cos(a)*.55+Math.sin(a)*.91<0)continue;
 poly([ring(i,z),ring(i+1,z),ring(i+1,z+h),ring(i,z+h)],['#6b9188','#769b90','#87a699','#9db2a2'][Math.floor((1+Math.cos(a))*1.95)]);
 for(let k of [.2,.78])line(ring(i,z+h*k),ring(i+1,z+h*k),'#496e68',1)}
 poly(Array.from({length:sides},(_,i)=>ring(i,z+h)),'#c7c9aa');
}
function shadow(x,y,w,d,h){poly([pt(x,y),pt(x+w,y),pt(x+w+h*.63,y+d+h*.23),pt(x+h*.63,y+d+h*.23),pt(x,y+d)],'#384c501f')}
function building(b){
 let {x,y,w,d,h,p,id,main}=b;
 box(x,y,w,d,h,p);
 // Painted concrete piers, recessed windows and corrugated loading shutters.
 const rows=h>27?2:1;
 for(let k=4;k<w-6;k+=12){
 for(let j=0;j<rows;j++){
 const z=h-6-j*9;
 poly([pt(x+k,y+d,z),pt(x+k+8,y+d,z),pt(x+k+8,y+d,z-5),pt(x+k,y+d,z-5)],'#425b5d');
 wire(x+k+1,y+d,z-1,x+k+6,y+d,z-1,'#acc4b2',1.2);
 wire(x+k+4,y+d,z,x+k+4,y+d,z-5,p[0],1.1);
 }
 }
 for(let k=4;k<d-5;k+=13){
 poly([pt(x+w,y+k,12),pt(x+w,y+k+9,12),pt(x+w,y+k+9,1),pt(x+w,y+k,1)],'#53676a');
 for(let j=2;j<12;j+=2)wire(x+w,y+k,j,x+w,y+k+9,j,'#81908a',.8);
 }
 box(x-1,y-1,w+2,d+2,1.6,[p[1],p[1],p[2]],h);
 flat(x+2,y+2,w-4,d-4,h+1.7,p[0]);
 for(let k=4;k<w-2;k+=6)wire(x+k,y+3,h+1.8,x+k,y+d-3,h+1.8,'#f3d3a455',1);
 for(let k=0;k<2;k++){
 let X=x+7+k*16,Y=y+7;
 box(X,Y,11,8,3,['#99a398','#707f7a','#ccc8ad'],h+1.8);
 for(let l=1;l<9;l+=2)wire(X+l,Y+1,h+4.9,X+l,Y+6,h+4.9,ink,.8);
 }
 if(main){
 if(id===1||id===5){for(let k=0;k<3;k++)tank(x+15+k*22,y+26,h+2,8.5,9+k%2*3)}
 else if(id===4||id===8){let X=x+49,Y=y+21;for(let u of [-4,4])for(let v of [-4,4])wire(X+u,Y+v,h+2,X+u,Y+v,h+12,ink,Z);tank(X,Y,h+12,8,10)}
 else roofType(x+6,y+d-6,h+2,16,id===0?'88.6':id===6?'UNION':'PSA', '#ffe1ab');
 for(let k=0;k<3;k++){
 let X=x+5+k*19,Y=y+d;poly([pt(X,Y,8),pt(X+15,Y,8),pt(X+15,Y+4,6),pt(X,Y+4,6)],id%2?'#4f837c':'#c86853');
 for(let n=0;n<14;n+=4)poly([pt(X+n,Y,8.1),pt(X+n+2,Y,8.1),pt(X+n+2,Y+4,6.1),pt(X+n,Y+4,6.1)],'#e7ce9f');
 }
 let label=p[3];sign(x+2,y+d+1,h+4,w-4,7,label,id===0?'#af4e39':'#345659',ivory);
 if(id===0||id===6){
 let X=x+w*.76,Y=y+d*.42,z=h+2;
 wire(X-4,Y,z,X,Y,z+34,ink,2);wire(X+4,Y,z,X,Y,z+34,ink,2);
 for(let k=2;k<27;k+=5){wire(X-3,Y,z+k,X+2,Y,z+k+4,ink,1);wire(X-5,Y,z+k,X+5,Y,z+k,'#d9c4a4',1)}
 circle(pt(X,Y,z+34),2.5,Math.sin(t*4)>0?'#ffde86':'#db6443');
 }
 }else if(w>100){sign(x+5,y+d+.2,12,37,6,'PORT   /   0'+(id+1),'#d7be97','#544c46')}
}
function crane(o){
 let x=o.x,y=o.y;
 const yellow='#e9a53e',dark='#8b663d';
 box(x-4,y-4,18,23,2,['#806f5d','#6b6e62','#bdab89']);
 for(let k=0;k<22;k+=3)wire(x-4,y-4+k,2.1,x+14,y-4+k,2.1,'#948771',.8);
 for(let u of [0,8])for(let v of [0,7])wire(x+u,y+v,0,x+u,y+v,32,dark,2*Z);
 for(let k=1;k<32;k+=8){wire(x,y+7,k,x+8,y+7,k+7,yellow,1.25*Z);wire(x+8,y,k,x+8,y+7,k+7,yellow,1.25*Z)}
 box(x-2,y-1,12,10,5,['#bb7136',dark,yellow],30);
 for(let h of [35,39])wire(x-12,y+4,h,x+33,y+4,h,yellow,2*Z);
 for(let k=-12;k<32;k+=5)wire(x+k,y+4,35,x+k+4,y+4,39,dark,Z);
 wire(x+27,y+4,35,x+27,y+4,15,ink,1);wire(x+27,y+4,15,x+29,y+4,16,ink,2);
}
function tree(o){
 let p=pt(o.x,o.y,o.h);wire(o.x,o.y,0,o.x+1,o.y,o.h,'#78644b',2.3*Z);
 // Wind-cut umbrella pines.
 for(let k=0;k<8;k++){let a=k*2.4,r=(k%3+1)*1.6;
 circle([p[0]+Math.cos(a)*r*Z,p[1]+Math.sin(a)*r*Z],(3.6+k%2)*Z,['#547969','#3d695e','#759377'][k%3]);}
}
function person(o,player){
 const {x,y}=o,a=player?o.a:o.dir>0?0:Math.PI,stride=Math.sin(t*(player?7:3)+x)*1.3;
 const f=(v,z,lat=0)=>pt(x+Math.cos(a)*v-Math.sin(a)*lat,y+Math.sin(a)*v+Math.cos(a)*lat,z);
 line(f(-stride,0,-.6),f(0,3.3,-.5),ink,1.1*Z);line(f(stride,0,.6),f(0,3.3,.6),ink,1.1*Z);
 line(f(0,3),f(0,6),player?'#c45438':o.color,2.8*Z);
 line(f(0,5.6),f(player&&s.shove>0?3.5:1.3,player&&s.shove>0?5:3.6), '#d4a57c',Z);
 circle(f(0,7),1.35*Z,'#daaf8b');circle(f(-.2,7.8),1.15*Z,player?'#e7c875':ink);
}
function vehicle(c){
 let {x,y,a,color,kind}=c;let cs=Math.cos(a),sn=Math.sin(a);
 let P=(u,v,h=0)=>pt(x+(u*cs-v*sn)*1.12,y+(u*sn+v*cs)*1.12,h*1.14);
 const face=(points,col)=>poly(points.map(v=>P(...v)),col);
 const quad=(u,v,U,V,h,col)=>face([[u,v,h],[U,v,h],[U,V,h],[u,V,h]],col);
 const length=kind==='coupe'?7.3:7,wide=3.25;
 quad(-length+.5,-wide+.6,length+1,wide+1,0,'#263a3f73');
 const sides=[-1,1].sort((a,b)=>(a-b)*(-sn*.34+cs*.55));
 const ends=[-1,1].sort((a,b)=>(a-b)*(cs*.34+sn*.55));
 for(let i of sides)for(let u of [-4.4,4.6]){
 const p=P(u,wide*i,1.35);circle(p,1.58*Z,'#253034');circle(p,.76*Z,'#acae9f')}
 for(let i of sides)face([[-length,wide*i,1],[length,wide*i,1],[length,wide*i,3.3],[-length,wide*i,3.3]],color);
 for(let i of ends)face([[length*i,-wide,1],[length*i,wide,1],[length*i,wide,3.3],[length*i,-wide,3.3]],i<0?'#93574c':color);
 quad(-length,-wide,length,wide,3.35,color);
 face([[3.4,-2.9,3.4],[3.4,2.9,3.4],[1.8,2.4,5.5],[1.8,-2.4,5.5]],'#98bcba');
 face([[-4.6,-2.9,3.4],[-4.6,2.9,3.4],[-3,2.4,5.5],[-3,-2.4,5.5]],'#668b8d');
 for(let i of sides){face([[-4.6,2.9*i,3.4],[3.4,2.9*i,3.4],[1.8,2.4*i,5.5],[-3,2.4*i,5.5]],'#354e56');line(P(-1,2.8*i,3.5),P(-1,2.4*i,5.4),color,Z*.5)}
 quad(-3,-2.4,1.8,2.4,5.5,kind==='police'?'#394d57':color);
 for(let i of [-1,1]){line(P(length,1.4*i,2.8),P(length,2.9*i,2.8),'#ffe6a4',Z);line(P(-length,1.5*i,2.5),P(-length,3*i,2.5),'#ff6348',Z)}
 if(kind==='coupe'){quad(3.5,-1.5,7,-.8,3.45,ivory);quad(-7,-1.5,-4.7,-.8,3.45,ivory)}
 if(kind==='police'){for(let i of sides){face([[-3.5,wide*i,1.8],[2.5,wide*i,1.8],[2.5,wide*i,3.3],[-3.5,wide*i,3.3]],'#304b58')}
 quad(3.5,-wide,length,wide,3.42,'#365461');let hot=s.heat!=='clear',flip=Math.sin(t*13)>0;
 quad(-1,-2,0,0,5.8,hot&&flip?'#fe553d':'#ad4945');quad(-1,0,0,2,5.8,hot&&!flip?'#75edff':'#4d8dba');
 if(hot){let p=P(0,flip?-2:2,6);let glow=g.createRadialGradient(...p,0,...p,Z*11);glow.addColorStop(0,flip?'#ff684ec9':'#70d7ffc9');glow.addColorStop(1,'transparent');circle(p,Z*11,glow)}
 }
}
function ship(x,y,k){
 let hull=[[-40,-8],[26,-8],[41,0],[26,8],[-40,8]].map(([u,v])=>pt(x+u,y+v,1));
 poly(hull,'#254e56');poly(hull.map(([a,b])=>[a,b-2*Z]),'#b87459');
 box(x-32,y-6,14,12,8,['#d5c6a5','#a69276','#e9d8af'],2);
 for(let i=0;i<3;i++){let X=x-15+i*13;box(X,y-5,11,10,4,['#ad7057','#7b6959',i%2?'#cf9c6b':'#809a8a'],2);for(let j=1;j<11;j+=2)wire(X+j,y-4,6.1,X+j,y+4,6.1,'#b4ad8d',.8)}
 for(let i=0;i<4;i++)sign(x-31+i*3,y+6,8.4,2,2,'','#38616a',ivory);
 box(x-32,y-6,14,12,1,['#627c78','#5d746f','#e3d3b3'],10);
 box(x-28,y-1,3,4,4,['#b86547','#8c5042','#614c43'],11);
 sign(x-12,y+8,2,19,2.1,'SABLE  /  '+(k+3),'#9e6350','#fff3c5');
 wire(x-27,y,10,x-27,y,19,ink,1.3);
}
function ground(){
 g.fillStyle=sea;g.fillRect(0,0,W,H);
 for(let j=-65;j<0;j++)for(let i=-15;i<43;i++){
 let x=i*23+Math.sin(i*53+j*31)*10,y=j*10+Math.sin(i+j)*4;
 let p=pt(x,y);if(p[0]<-40||p[1]<-10||p[0]>W||p[1]>H)continue;
 wire(x+Math.sin(t*.6+j),y,0,x+4+(i+30)%5,y,0,(i+j)%4?'#87b2a35e':'#c3d2b489',1.35);
 }
 for(let i=-2;i<6;i++)ship(i*165+Math.sin(t*.15+i)*2,-98-i%2*39,i);
 flat(-31,-34,725,611,0,'#495b5d');
 flat(-31,-34,725,4,1,'#d1bba0');flat(-31,-30,725,8,0,'#b3a991');
 for(let i=-25;i<690;i+=7)flat(i,-29,3,.8,.1,'#eee1ba');
 for(let y of streetsY){for(let x=-20;x<675;x+=19){if(streetsX.some(X=>Math.abs(X-x)<18))continue;flat(x,y,8,.55,.05,'#cfb78c')}}
 for(let x of streetsX){for(let y=18;y<550;y+=18){if(streetsY.some(Y=>Math.abs(Y-y)<17))continue;flat(x,y,.55,7,.05,'#c7b48e')}}
 for(let x of streetsX)for(let y of streetsY){
 for(let k=-12;k<13;k+=4){flat(x+k,y+14,1.7,4,0,'#c2b9a3');flat(x+15,y+k,4,1.7,0,'#c2b9a3')}
 }
 for(let b of blocks){
 flat(b.x-3,b.y-3,b.w+6,b.d+6,.2,'#d4c7a9');flat(b.x,b.y,b.w,b.d,.25,'#a5a59a');
 flat(b.x,b.y+62,b.w,23,.3,'#717c79');
 for(let k=0;k<b.w;k+=14)flat(b.x+k,b.y+61,8,1,.31,'#edc37c');
 }
 for(let b of buildings)shadow(b.x,b.y,b.w,b.d,b.h);
 for(let k of s.trail){let a=k.a;for(let d of [-2.4,2.4]){let x=k.x-Math.sin(a)*d,y=k.y+Math.cos(a)*d;wire(x,y,.1,x+Math.cos(a)*2.5,y+Math.sin(a)*2.5,.1,'#333d40',1.7)}}
}
function marker(p,label){
 let a=pt(p.x,p.y,.5);g.strokeStyle='#ffda79';g.lineWidth=2;g.beginPath();g.ellipse(...a,12*Z,6*Z,.25,0,7);g.stroke();
 const [x,y]=pt(p.x,p.y,15+Math.sin(t*3));
 g.font='bold 11px monospace';let width=g.measureText(label).width+16;
 g.fillStyle='#263b3c';g.fillRect(x-width/2,y-18,width,19);g.fillStyle='#ffde89';g.textAlign='center';g.fillText(label,x,y-5);poly([[x-4,y+2],[x+4,y+2],[x,y+7]],'#ffde89')
}
function beams(){
 const c=s.cop;if(s.heat==='clear')return;
 let a=c.a+(s.heat==='search'?Math.sin(s.clock*2.5)*.45:0),wide=s.heat==='search'?.43:.23,L=s.heat==='search'?57:31;
 poly([pt(c.x,c.y,2),...[-wide,0,wide].map(d=>pt(c.x+Math.cos(a+d)*L,c.y+Math.sin(a+d)*L))],s.heat==='search'?'#ffe69e58':'#acd5d641');
}
export function draw(dt){
 W=innerWidth;H=innerHeight;const dpr=Math.min(devicePixelRatio,1.6);
 if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 g.setTransform(dpr,0,0,dpr,0,0);t+=dt;
 let p=actor(),v=p.v||0;
 Z=clamp(W/395,1.65,3.8)*(s.ride===null?1.11:1)/(1+Math.abs(v)*.0015);
 let f=1-Math.exp(-dt*5);cx+=(p.x+Math.cos(p.a)*v*.23-cx)*f;cy+=(p.y+Math.sin(p.a)*v*.23-cy)*f;
 ground();beams();
 let items=[];
 function add(x,y,z,fn){const p=pt(x,y);if(p[0]>-360&&p[0]<W+360&&p[1]>-140&&p[1]<H+290)items.push({key:x*.34+y*.55+z,fn})}
 for(let b of buildings)add(b.x+b.w/2,b.y+b.d/2,0,()=>building(b));
 for(let o of props)add(o.x,o.y,0,()=>{
 if(o.type==='crane')crane(o);else if(o.type==='tree')tree(o);
 else if(o.type==='lamp'){wire(o.x,o.y,0,o.x,o.y,15,'#566762',1.4*Z);wire(o.x,o.y,15,o.x,o.y-4,15,ink,Z);circle(pt(o.x,o.y-4,15),1.4*Z,ivory)}
 else if(o.type==='crate'){box(o.x,o.y,6,5,4,['#b98a5f','#916c50','#dbab77']);wire(o.x,o.y+5,0,o.x+6,o.y+5,4,'#80684f',1)}
 else box(o.x,o.y,1.5,1.5,2,['#8e7e68','#5e665d','#edd19b']);
 });
 add(gate.x,gate.y+16,0,()=>{for(let k=0;k<(gateOpen()?5:33);k+=3)box(gate.x,gate.y+k,2,3,4,k%2?['#343f42','#414b48','#5a6157']:['#dd9d3c','#b08136','#f4c267'])});
 for(let w of walkers)add(w.x,w.y,0,()=>person(w,false));
 for(let c of [...vehicles,s.cop])add(c.x,c.y,0,()=>vehicle(c));
 if(s.ride===null)add(s.foot.x,s.foot.y,0,()=>person(s.foot,true));
 items.sort((a,b)=>a.key-b.key);for(let item of items)item.fn();
 if(s.phase==='done'&&s.branch==='air'){
 let p=pt(89,409,60),r=(t*12)%22;g.strokeStyle='#ffe6a9';g.lineWidth=1.7;g.beginPath();g.arc(...p,r*Z,-1.9,-.65);g.stroke()}
 if(s.phase==='pickup')marker(vehicles[0],'REEL CAR');else if(s.phase==='drop')marker(destination(),s.branch==='air'?'UNION RADIO':'FERRY SLIP');
 if(s.heat==='search')marker(s.last,'LAST VISUAL');
}
