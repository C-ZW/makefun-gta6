export const SIZE=2400;
export const roads=[300,740,1180,1620,2060];
export const buildings=[];
const names=['PALM COURT','SALT / SUPPLY','SOL HOTEL','QUAY RECORDS','CITRUS CLUB','SUNSET LAUNDRY','MARINA MARKET','PELICAN FM','HARBOR AUTHORITY','CASA CORAL','TIDE MOTEL','SABLE MARINE','ORANGE CINEMA','EASTSIDE DINER','BLUE FINCH','RADIO WORKS'];
const paints=['#d9947c','#e4c397','#e5aa82','#86b9b1','#e6d6a7','#c99085'];
for(let row=0;row<4;row++)for(let col=0;col<4;col++){
 const x=roads[col]+100,y=roads[row]+100,i=row*4+col;
 buildings.push({x,y,w:230,h:145,z:40+(i%3)*18,color:paints[i%6],name:names[i],id:i});
 buildings.push({x:x+30,y:y+205,w:190,h:65,z:24,color:paints[(i+2)%6],name:i%2?'STUDIOS':'BODEGA',id:20+i});
}
export const hideouts=[{x:680,y:620,name:'Laundry courtyard'},{x:1110,y:1500,name:'Market courtyard'},{x:1980,y:1050,name:'Fishermen’s shelter'}];
export const landmarks={contact:{x:300,y:670},broadcast:{x:1620,y:350},sell:{x:2060,y:1750},garage:{x:300,y:1620}};
export const vehicleTypes=[{name:'MISTRAL COUPE',color:'#ed815c',length:57,width:29,max:340,accel:155,grip:3.2},{name:'LARGO SEDAN',color:'#e7d59e',length:62,width:31,max:270,accel:125,grip:2.8},{name:'CORMORANT VAN',color:'#72b8b2',length:72,width:34,max:235,accel:100,grip:2.3},{name:'RIPTIDE GT',color:'#d8adce',length:59,width:30,max:390,accel:180,grip:3.6}];
export function vehicle(x,y,a,type=0){return {x,y,a,type,speed:0,hp:100,...vehicleTypes[type],ai:false,stolen:false};}
export function createDistrict(){
 const cars=[vehicle(354,740,0,2),vehicle(260,820,-Math.PI/2,0),vehicle(780,690,Math.PI/2,3),vehicle(1200,1610,0,1)];
 for(let i=0;i<17;i++){const horizontal=i%2===0,road=roads[i%5],c=vehicle(horizontal?180+i*119:road+22,horizontal?road+22:180+i*113,horizontal?0:Math.PI/2,i%4);c.ai=true;c.axis=horizontal?'x':'y';if(Math.hypot(c.x-300,c.y-740)<180)c[c.axis]+=300;c.speed=50+i%4*12;cars.push(c);}
 const people=Array.from({length:46},(_,i)=>({x:roads[i%5]+(i%2?67:-67),y:180+(i*149)%2010,dir:i%2?1:-1,color:['#f18171','#fff0b8','#499ea7','#85556b','#cbe4c0'][i%5],panic:0,hp:3}));
 return {cars,people};
}
export function solid(x,y,r=12){if(x<100||y<130||x>2250||y>2270)return true;return buildings.some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r);}
export function lineClear(a,b){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/18);for(let i=1;i<n;i++){const t=i/n;if(solid(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,0))return false;}return true;}
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
export function moveBody(o,dx,dy,r=12){let hit=false;if(!solid(o.x+dx,o.y,r))o.x+=dx;else hit=true;if(!solid(o.x,o.y+dy,r))o.y+=dy;else hit=true;return hit;}
