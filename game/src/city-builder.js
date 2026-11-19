import { sceneryBatch, randomFrom, labelPlane } from './scenery.js';
import { buildFacade, streetFront, palm, lamp } from './architecture.js';
import { avenues, streets, rowEdges, blockEdges, districtAt, land } from './districts.js';

export function buildBellcove(scene) {
  const solids = [];
  const batch = sceneryBatch(scene), p=batch.part, rand=randomFrom(722089);
  const slab = (c,x,z,w,d,level=.02) => p('box',c,x,level-.047,z,w,.094,d);
  const paint = (c,x,z,w,d) => slab(c,x,z,w,d,.039);
  const side = 9.8;
  p('box',0xc7a685,-8.5,-.61,-1,381,1.18,524);
  p('box',0xdac095,199,-.47,-12,36,.81,480);
  p('box',0xe1cb9e,212,-.44,-12,15,.58,439);
  p('box',0x91a590,-269,-.50,-1,98,1,102);
  slab(0x54616a,-254,0,110,18,.05);
  for(let x=-302;x<-170;x+=5.5) paint(0xf6c365,x,-.1,2.8,.16);
  for(const z of [-9.5,9.5]) {
    p('box',0xe1bf9a,-242,.23,z,100,.48,.4);
    for(let x=-292;x<-194;x+=5) p('box',0xb66f5d,x,.85,z,.2,1.36,.23);
    p('box',0x79575c,-242,1.28,z,100,.13,.19);
  }
  for(const z of [-54,52]) p('ball',0x788c81,-275,-.21,z,49,4,14);

  for(const x of avenues) {
    const coastal=x===160;
    slab(coastal?0x58646d:0x535962,x,0,side*2,521);
    for(let z=-251;z<=252;z+=6) {
      if(streets.some(v=>Math.abs(v-z)<12.5)) continue;
      paint(0xf7bd66,x-.17,z,.106,3.55);
      paint(0xf7bd66,x+.17,z,.106,3.55);
      if(coastal) for(const offset of [-4.6,4.6]) paint(0xd8d4bb,x+offset,z,.11,2.45);
    }
    for(const offset of [-8.75,8.75]) paint(0xd9d0b4,x+offset,0,.105,519);
  }
  for(const z of streets) {
    slab(0x535962,-8.5,z,379,side*2,.026);
    for(let x=-192;x<170;x+=6) {
      if(avenues.some(v=>Math.abs(v-x)<13)) continue;
      paint(0xefc67f,x,z,.15*19,.15);
    }
    for(const x of avenues) {
      slab(0x56606a,x,z,19.62,19.62,.052);
      for(let i=-7.8;i<8;i+=1.52) {
        for(const s of [-1,1]) {
          slab(0xe2d3ba,x+i,z+s*11.5,.77,2.8,.065);
          slab(0xe2d3ba,x+s*11.5,z+i,2.8,.77,.049);
        }
      }
      for(const s of [-1,1]) {
        const px=x+s*10.4,pz=z-s*10.7;
        p('round',0x34484b,px,2,pz,.10,4,.10);
        p('box',0x263a3f,px,3.62,pz,.34,.83,.32);
        p('ball',(x+z)%3?0x80e9b9:0xff7662,px,3.49,pz+.19,.103,.095,.075,0,0,0,true);
      }
    }
  }
  const pastel=[0xf3ae90,0xe6c49b,0xe49d88,0xeac3af,0xb0c1ad,0xbeb8bf,0xe4b879];
  const downtown=[0x9a9ba9,0xb2b8b0,0x9ca7b1,0xbfabb4,0x83a4a8,0xe2c1ac];
  for(let col=0;col<blockEdges.length-1;col++) for(let row=0;row<rowEdges.length-1;row++) {
    const l=blockEdges[col],r=blockEdges[col+1],n=rowEdges[row],s=rowEdges[row+1];
    const cx=(l+r)/2,cz=(n+s)/2;
    const park=l===0&&n===-80, industrial=cz>130, hill=cz<-122, coastal=l===80;
    const sizeX=r-l-20, sizeZ=s-n-20;
    if(sizeX<9||sizeZ<9) continue;
    slab(industrial?0xaca594:hill?0xcac5a1:0xd4bca3,cx,cz,sizeX,sizeZ,.17);
    if(park) { buildPark(batch,cx,cz,rand); continue; }
    if(industrial) { buildWharf(batch,scene,solids,cx,cz,sizeX,sizeZ,rand); continue; }
    const wide=sizeX>40, deep=sizeZ>40;
    for(const ox of wide?[-14,14]:[0]) for(const oz of deep?[-14,14]:[0]) {
      const x=cx+ox+(rand()-.5)*3,z=cz+oz+(rand()-.5)*3;
      if (coastal && n===0 && ox>0 && oz>0) continue;
      const w=Math.min(sizeX-3,13+rand()*9),d=Math.min(sizeZ-3,14+rand()*10);
      const grade=coastal?'deco':hill?'villa':'glass';
      const h=coastal?9+rand()*10:hill?4.6+rand()*6:13+rand()*42;
      const palette=grade==='glass'?downtown:pastel;
      buildFacade(batch,solids,x,z,w,d,h,palette[Math.floor(rand()*palette.length)],grade,rand);
    }
  }
  buildFacade(batch,solids,134,118,25,26,22,0xedb79f,'deco',rand);
  labelPlane(scene,{text:'THE CALDER',sub:'M A R I G O L D   S T R A N D',x:134,y:16.2,z:131.24,w:21,h:5});
  labelPlane(scene,{text:'CALDER',x:146.72,y:16.7,z:116.2,w:19,h:3.65,yaw:Math.PI/2,ink:'#3c4e53'});
  streetFront(batch,scene,140.5,63,1,'MAKO','MOTOR & SUPPLY',0xd29379,0x527d7a);
  solids.push({x:140.5,z:63,w:5,d:5.5});
  streetFront(batch,scene,186,98,1,'BOATHOUSE','REPAIR CO-OP',0xa58e73,0xc57661);
  labelPlane(scene,{text:'BOATHOUSE',sub:'REPAIR CO-OP',x:180.94,y:4.36,z:98,w:9,h:1.9,yaw:-Math.PI/2});
  solids.push({x:186,z:98,w:5,d:5.5});
  labelPlane(scene,{text:'MARIGOLD STRAND',sub:'B E L L C O V E   C O R N I C H E',x:160,y:8.3,z:27,w:22,h:4.2,ink:'#264c50',plate:'#fcaf77'});
  for(const x of [148,172]) {
    p('box',0x92756c,x,4,27,.5,8,.53);
  }
  p('box',0x957e71,160,6.24,27,24,.42,.50);
  for(let z=-246;z<=240;z+=13) {
    if(streets.some(v=>Math.abs(v-z)<5)) continue;
    palm(batch,177+(rand()-.5)*4,z,6.2+rand()*3,rand()*7);
    if(z%3) palm(batch,146.5,z+3,5.8+rand()*2.7,rand()*7,1);
    if(z%2) lamp(batch,171,z-3,-Math.PI/2);
    if(z%3===0) lamp(batch,148,z+5,Math.PI/2);
    const c=z%2?0xc38f68:0xbd9075;
    slab(c,180,z,12,12.8,.135);
    paint(0xeed1a5,174.4,z,.15,12.4);
  }
  for(let z=-235;z<233;z+=3.2) {
    p('box',0xdbc3a9,196,.08,z,.55,.65,3.2);
    p('box',0x385b60,196,.69,z,.15,.75,.14);
    p('box',0x486972,196,1.04,z,.13,.13,3.3);
    if(z%5<1) p('box',0xf2d3a6,196,1.11,z,.2,.09,.26,0,0,0,true);
  }
  for(let z=-210;z<222;z+=16) {
    const x=202+rand()*5;
    p('round',0xd4b094,x,.77,z,.065,1.57,.065);
    p('roof',z%3?0xe37d65:0x60a5a0,x,1.63,z,2.18,.51,2.18,Math.PI/4);
    p('box',0xf3ddae,x,.13,z+1.5,1.1,.15,2,.3);
  }
  for(let x=-160;x<135;x+=20) for(const z of [-87,87,153,-153]) {
    if(avenues.every(a=>Math.abs(x-a)>10)) lamp(batch,x,z,z>0?0:Math.PI);
  }
  coastline(batch,scene,rand);
  batch.bake();

  function onLand(x,z) {
    return (x>land.left&&x<216&&z>land.top&&z<land.bottom) ||
      (x>-310&&x<land.left&&Math.abs(z)<8.9) ||
      (x>-317&&x<-222&&Math.abs(z)<49);
  }
  return {
    solids, height:()=>0, districtAt,
    free(x,z,radius=.4) {
      return onLand(x,z) && !(x>194.9&&x<196.7&&Math.abs(z)<235) &&
        !solids.some(o=>Math.abs(x-o.x)<o.w+radius&&Math.abs(z-o.z)<o.d+radius);
    },
    lineClear(x,z,xx,zz) {
      const dx=xx-x,dz=zz-z;
      for(const o of solids) {
        const u1=(o.x-o.w-x)/(dx||.00001),u2=(o.x+o.w-x)/(dx||.00001);
        const v1=(o.z-o.d-z)/(dz||.00001),v2=(o.z+o.d-z)/(dz||.00001);
        if(Math.max(0,Math.min(u1,u2),Math.min(v1,v2))<Math.min(1,Math.max(u1,u2),Math.max(v1,v2))) return false;
      }
      return true;
    }
  };
}

function buildPark(batch,x,z,rand) {
  const p=batch.part;
  p('box',0x879b65,x,.16,z,56,.32,56);
  for(const [w,d] of [[54,5],[5,54]]) p('box',0xe2c49d,x,.33,z,w,.12,d);
  p('round',0xc9a683,x,.41,z,8,.63,8);
  p('round',0x5d9a9d,x,.75,z,7.4,.08,7.4);
  p('taper',0xe2bc90,x,1,z,2,1.35,2);
  p('ball',0x91d3bd,x,1.9,z,.6,1,.6);
  for(let i=0;i<14;i++) {
    const a=rand()*7,r=13+rand()*11,px=x+Math.sin(a)*r,pz=z+Math.cos(a)*r;
    p('round',0x826953,px,1.48,pz,.33,2.96,.32);
    p('ball',i%2?0x81965c:0xa1a167,px,4.1,pz,3.8,2.7,3.3);
  }
}

function buildWharf(batch,scene,solids,x,z,w,d,rand) {
  const p=batch.part, palette=[0xb5624d,0x577b7d,0xb3985b,0x658477];
  if(w>35&&d>35) {
    buildFacade(batch,solids,x-12,z+7,18,22,6,0x9b9491,'villa',rand);
    if(x>24&&x<130&&z<228) labelPlane(scene,{text:'GULLWORKS',sub:'B E L L C O V E   F R E I G H T',x:x-12,y:5,z:z+18.07,w:16,h:3.5});
  }
  for(let i=0;i<(d>40?6:2);i++) {
    const xx=x+w*.21+(i%2)*5.4, zz=z-d*.26+Math.floor(i/2)*11.6;
    if(xx+2>x+w/2) continue;
    const layers=1+(rand()>.46?1:0);
    solids.push({x:xx,z:zz,w:2.1,d:4.2});
    for(let layer=0;layer<layers;layer++) {
      const y=1.48+layer*2.77;
      p('box',palette[(i+layer)%4],xx,y,zz,4.15,2.76,8.3);
      for(let k=-3;k<=3;k++) p('box',0x88847e,xx+2.09,y,zz+k*.96,.07,2.6,.06);
      for(const top of [-1,1]) p('box',0xc1a482,xx,y+top*1.32,zz+4.19,4.14,.11,.12);
    }
  }
  if(w>42&&d>42&&(x>35||x<-100)) {
    const xx=x-14, zz=z-17;
    for(const k of [-4,4]) {
      p('box',0xca9b63,xx+k,7.5,zz,.44,15,.44);
      p('box',0xb8835e,xx+k,13,zz, .25,8,.22,0,0,k*.16);
    }
    p('box',0xc99a68,xx,16.2,zz,22,1.15,.72,0,0,.17);
    p('box',0x846864,xx+8,11,zz,.08,12,.08);
  }
}

function coastline(batch,scene,rand) {
  const p=batch.part;
  for(let i=0;i<17;i++) {
    const x=-212+i*25, h=14+Math.sin(i*.7)**2*26;
    p('ball',i%2?0x879080:0x929586,x,-3,-284-rand()*30,40,h,29);
    p('ball',0xb6a48c,x-12,-7,-277,23,h*.48,15);
  }
  for(const [x,z,w,h,d] of [[273,-247,43,20,38],[322,-289,66,23,28],[393,-320,65,28,42],[462,-361,67,22,48]]) {
    p('ball',0xc4a892,x,-3,z,w,h,d);
    p('ball',0x899778,x-6,-.7,z-6,w*.94,h*.86,d*.9);
  }
  p('round',0xd5a28a,276,23,-263,1.85,11,1.85);
  p('round',0xf2cfaa,276,23.6,-263,1.98,3.45,1.98);
  p('round',0xffcf8a,276,29.1,-263,1.84,1.35,1.84,0,0,0,true);
  p('roof',0xbe6b55,276,30.6,-263,2.5,2.4,2.5,Math.PI/4);
  for(let i=0;i<8;i++) {
    const x=221+rand()*105,z=-202+rand()*402;
    p('ball',0xdac2a9,x,-.18,z,1.55,.53,4);
    p('round',0xe9c8aa,x,3.14,z,.06,7.2,.06);
    p('leaf',i%2?0xffc091:0xf3e3bb,x,3.5,z,7.3,7.8,6.8,Math.PI/2,0,Math.PI/2);
  }
  labelPlane(scene,{text:'WEST REACH',sub:'FERRY & WETLANDS',x:-277,y:4.3,z:-12,w:13,h:3,yaw:Math.PI/2});
}
