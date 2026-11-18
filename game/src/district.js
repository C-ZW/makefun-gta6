// Soundings are in street metres. Quay Road follows the northern seawall.
export const streetsX=[0,220,440,660], streetsY=[0,180,360,540];
export const blocks=[], buildings=[], props=[], walkers=[], vehicles=[];
export const home={x:92,y:-13}, air={x:6,y:365}, ferry={x:649,y:-8};
export const gate={x:329,y:88,w:6,d:33};
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let seed=934;
export function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const palettes=[
 ['#da9873','#a86354','#faac78','NARROWCAST'],['#9aaba0','#608782','#d6cbaa','ICE WORKS'],
 ['#e2bb89','#b28063','#eed2a0','FERRY OFFICE'],['#74aaa6','#427f80','#add2ba','UNION HALL'],
 ['#be847c','#8e5760','#dac19b','SALT HOTEL'],['#d69b65','#9f704e','#f3c18c','NET & LINE'],
 ['#d3b590','#ab8475','#e0c7a7','DRY GOODS'],['#a8a890','#768778','#d6cf9c','SPOOL CO.'],
 ['#d0937e','#a26c67','#ecc3a0','PALISADE']
];
for(let j=0;j<3;j++)for(let i=0;i<3;i++){
 const x=i*220+23,y=j*180+22,p=palettes[j*3+i];
 blocks.push({x,y,w:174,d:136});
 buildings.push({x:x+8,y:y+8,w:77,d:46,h:24+(i+j)%3*7,p,id:i+j*3,main:true});
 buildings.push({x:x+102,y:y+11,w:59,d:43,h:20+9*j,p,id:i+j*3});
 buildings.push({x:x+18,y:y+90,w:135,d:38,h:18+i*3,p,id:i+j*3});
 for(let k=0;k<4;k++){
   props.push({type:'tree',x:x+9+k*47,y:y+135,h:18+random()*6});
   props.push({type:'lamp',x:x+k*48,y:y-2});
 }
 for(let k=0;k<3;k++)walkers.push({x:x+random()*155,y:y-4,origin:x,t:random()*6,dir:k%2?1:-1,color:['#e4b346','#b65752','#60ada7'][k]});
 props.push({type:'crate',x:x+12,y:y+64},{type:'crate',x:x+21,y:y+66});
}
for(let i=-2;i<18;i++)props.push({type:'bollard',x:i*42,y:-29});
for(let i=0;i<4;i++)props.push({type:'crane',x:8+i*188,y:-46});
export function car(x,y,a,color,kind='traffic'){return {x,y,a,color,kind,v:0,vx:0,vy:0,steer:0};}
export function createFleet(){
 vehicles.length=0;
 vehicles.push(car(99,-6,0,'#ef704b','coupe'));
 for(let i=0;i<8;i++){
 let x=streetsX[i%3],y=streetsY[Math.floor(i/3)];
 let route=[{x:x+7,y:y+7},{x:x+213,y:y+7},{x:x+213,y:y+173},{x:x+7,y:y+173}];
 vehicles.push(Object.assign(car(x+32+(i*47)%127,y+7,0,['#ceb574','#659fa0','#cf8b82','#e8c2a0'][i%4]),{route,next:1,cruise:12+i%4*2}));
 }
}
export function obstacle(x,y,r,open){
 if(x<-22+r||x>684-r||y<-27+r||y>564-r)return true;
 return [...buildings,...(open?[]:[gate])].some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.d+r);
}
export function sight(a,b){
 return !buildings.some(o=>{
 let lo=0,hi=1;
 for(let [start,delta,min,max] of [[a.x,b.x-a.x,o.x,o.x+o.w],[a.y,b.y-a.y,o.y,o.y+o.d]]){
 if(Math.abs(delta)<.001){if(start<min||start>max)return false;continue}
 let t=(min-start)/delta,u=(max-start)/delta;
 lo=Math.max(lo,Math.min(t,u));hi=Math.min(hi,Math.max(t,u));
 }
 return lo<=hi;
 });
}
