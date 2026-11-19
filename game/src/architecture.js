import { labelPlane } from './scenery.js';

export function buildFacade(batch, solids, x,z,w,d,h, color, mood, rand) {
  const p = batch.part;
  const trim = mood==='deco' ? 0xffe3b2 : 0xf4d3a6;
  const footing = mood==='glass' ? 0x727e91 : 0xc3a386;
  p('box',color,x,h*.5,z,w,h,d);
  p('box',footing,x,.55,z,w+.6,1.1,d+.6);
  solids.push({x,z,w:w*.5+.22,d:d*.5+.22});
  p('shade',0x342749,x-h*.28,.056,z+h*.44,w+h*.1,d+h*.64,-.25,-Math.PI/2);
  if (mood==='villa') {
    p('roof',0xb24e39,x,h+.75,z,w*.74,1.6,d*.76,Math.PI*.25);
    p('box',0xffdaba,x,h-.2,z,w+.8,.32,d+.8);
  } else {
    p('box',trim,x,h,z,w+.6,.49,d+.6);
    p('box',color,x,h+1.35,z,w*.68,2.7,d*.74);
    p('box',trim,x,h+2.68,z,w*.69,.22,d*.75);
    if (mood==='deco') {
      p('box',color,x,h+3.7,z,w*.27,2,d*.4);
      p('box',0xffbc74,x,h+4.72,z,w*.29,.19,d*.42,0,0,0,true);
    }
    if (mood==='glass') {
      p('box',0x536a76,x,h+3.1,z+.2,w*.38,2.9,d*.54);
      p('round',0xe9c1a1,x,h+6.6,z, .15,5,.15);
      p('ball',0xf89080,x,h+9.1,z,.25,.25,.25,0,0,0,true);
    }
  }
  const glass = mood==='glass' ? [0x376b7d,0x487c86,0x598999,0x355970] : [0x406d73,0x48757a,0x315761,0x805e65];
  for (let face=0; face<4; face++) {
    const alongX = face<2, side = face%2 ? -1 : 1;
    const span = alongX ? w : d;
    const cols = Math.max(2,Math.floor(span/(mood==='glass'?2.8:4.3)));
    const vertical = mood==='glass' ? 2.65 : 3.45;
    const position = (u, offset) => alongX ? [x+u,z+side*(d/2+offset)] : [x+side*(w/2+offset),z+u];
    const strip = (color,u,y,wide,high,deep,offset,glow=false) => {
      const [px,pz] = position(u,offset);
      p('box',color,px,y,pz,alongX?wide:deep,high,alongX?deep:wide,0,0,0,glow);
    };
    for (let col=0; col<cols; col++) {
      const u = (col+.5)*span/cols-span*.5;
      const wide = span/cols*(mood==='glass'?.84:.48);
      for (let y=mood==='villa'?1.75:1.9; y<h-.55; y+=vertical) {
        const lit = rand()<.105;
        const tint = lit ? (rand()<.45?0xffae5f:0xffdd9f) : glass[Math.floor(rand()*glass.length)];
        strip(tint,u,y,wide,mood==='glass'?1.9:1.57,.09,.051,lit);
        if (mood!=='glass') strip(trim,u,y-.84,wide+.38,.15,.23,.13);
      }
      if (mood==='deco') strip(trim,u-span/cols*.33,h*.57,.33,h*.83,.42,.15);
    }
    if (mood==='deco') {
      strip(trim,0,3.35,span+.4,.27,1.12,.47);
      strip(0xff9665,0,3.33,span+.4,.09,.11,1.05,true);
      strip(trim,0,h-.73,span+.23,.25,.44,.24);
    }
  }
}

export function streetFront(batch, scene, x,z, side, text, sub, color, roofColor) {
  const p=batch.part;
  p('box',color,x,2.5,z,10,5,11);
  p('box',0x243c43,x+4.97,1.64,z, .15,2.7,8);
  for(let i=-3;i<=3;i+=2) p('box',0xc6bd9b,x+5.1,1.64,z+i,.13,2.75,.11);
  p('box',roofColor,x+5.16,3.55,z,2.5,.17,11.35,0,0,.12);
  for(let i=-5;i<=5;i++) {
    p('box',i%2?roofColor:0xffdfba,x+5.17,3.57,z+i,2.51,.18,.86,0,0,.12);
  }
  labelPlane(scene,{text,sub,x:x+5.12,y:4.4,z,w:10.1,h:2.23,yaw:side*Math.PI/2,ink:'#263d3e'});
}

export function palm(batch,x,z,h,angle,variant=0) {
  const p = batch.part;
  for(let i=0;i<4;i++) {
    const y=(i+.5)*h*.25;
    p('taper',i%2?0x997859:0xa9886b,x+y*.075,y,z,.23-i*.017,h*.27,.25-i*.017,0,0,-.076);
  }
  p('ball',0x516946,x+h*.075,h,z,.43,.42,.41);
  for(let f=0;f<9;f++) {
    const a=angle+f*Math.PI*2/9;
    const length=h*(.44+(f%3)*.045);
    const color=(variant+f)%3===0?0x8da45d:(f%2?0x477b59:0x587f53);
    p('leaf',color,x+h*.075,h+.08,z,length*.78,length,length,a,-.1+(f%3)*.19);
  }
  p('shade',0x33253a,x-h*.41,.053,z+h*.72,1.7,h*1.45,-.54,-Math.PI/2);
}

export function lamp(batch,x,z,yaw=0) {
  const p = batch.part, dx=Math.sin(yaw), dz=Math.cos(yaw);
  p('round',0x374a49,x,2.66,z,.09,5.32,.09);
  p('box',0x374a49,x+dx*.65,5.24,z+dz*.65,.13,.12,1.42,yaw);
  p('box',0xffce7d,x+dx*1.28,5.17,z+dz*1.28,.36,.16,.55,yaw,0,0,true);
  p('round',0x374a49,x,.22,z,.17,.44,.17);
}
