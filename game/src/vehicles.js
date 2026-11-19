import * as T from '../vendor/three.module.min.js';
import { shadowDisc, glowTexture } from './scenery.js';

export const vehicleCatalog = {
  pica:    { name:'Pica C2', kind:'Compact',  max:28, push:10, brake:21, turn:2.15, grip:7.4, mass:.8,  w:1.62,l:3.55,roof:1.49,color:0x84bfae },
  kestrel: { name:'Kestrel S', kind:'Sport',  max:49, push:18, brake:28, turn:1.84, grip:9.9, mass:.94, w:1.92,l:4.34,roof:1.16,color:0xe05932 },
  brasa:   { name:'Brasa 440', kind:'Muscle', max:42, push:15, brake:21, turn:1.54, grip:4.7, mass:1.3, w:2.02,l:4.82,roof:1.31,color:0xeac268 },
  gull:    { name:'Gull Cargo',kind:'Van',    max:25, push:7,  brake:16, turn:1.27, grip:6.3, mass:1.8, w:2.04,l:4.94,roof:2.31,color:0xe3ddc7 },
  mesa:    { name:'Mesa Rook', kind:'Pickup',max:36, push:11, brake:19, turn:1.48, grip:5.7, mass:1.6, w:2.07,l:4.85,roof:1.88,color:0x7f999d },
  dart:    { name:'Dart Cielo',kind:'Bike',   max:43, push:20, brake:26, turn:2.55, grip:8.6, mass:.5,  w:.64,l:2.29,roof:1.18,color:0x3bafab }
};

const motorPool = {
  patrol: { ...vehicleCatalog.brasa, name:'Bellcove Patrol', kind:'Police', max:37,push:13,color:0x203750 },
  interceptor: { ...vehicleCatalog.kestrel, name:'Tideguard Interceptor', kind:'Police', max:50,push:19,color:0x203750 }
};
const box = new T.BoxGeometry(1,1,1);
const wheel = new T.CylinderGeometry(1,1,1,12);
wheel.rotateZ(Math.PI/2);
const mats = new Map();
let corona;
function matte(color) {
  if (!mats.has(color)) mats.set(color,new T.MeshStandardMaterial({color,roughness:.77}));
  return mats.get(color);
}
function lit(color) {
  if (!mats.has('g'+color)) mats.set('g'+color,new T.MeshBasicMaterial({color}));
  return mats.get('g'+color);
}
function part(root,shape,mat,x,y,z,w,h,d) {
  const mesh = new T.Mesh(shape,mat);
  mesh.position.set(x,y,z); mesh.scale.set(w,h,d); root.add(mesh);
  return mesh;
}

// Each section has an eight-corner cross section with sculpted shoulders.
function coachwork(rows) {
  const pos=[],col=[];
  const ring = ([z,w,low,high]) => [
    [-w*.76,low,z], [w*.76,low,z], [w,low+.16,z], [w,high-.16,z],
    [w*.79,high,z],[-w*.79,high,z],[-w,high-.16,z],[-w,low+.16,z]
  ];
  const paint=[.62,.73,.88,1.0,1.09,1.03,.90,.75];
  function triangle(a,b,c,shade) {
    pos.push(...a,...b,...c);
    for(let v=0;v<3;v++) col.push(shade,shade,shade);
  }
  const rings = rows.map(ring);
  for(let i=1;i<rings.length;i++) for(let j=0;j<8;j++) {
    const n=(j+1)%8, a=rings[i-1],b=rings[i];
    triangle(a[j],b[j],a[n],paint[j]);
    triangle(a[n],b[j],b[n],paint[j]);
  }
  for(let j=1;j<7;j++) {
    triangle(rings[0][0],rings[0][j],rings[0][j+1],.77);
    const end=rings.at(-1);
    triangle(end[0],end[j+1],end[j],.94);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new T.Float32BufferAttribute(col,3));
  g.computeVertexNormals();
  return g;
}

const plateCache = new Map();
function plate(text) {
  if(!plateCache.has(text)) {
    const cv = document.createElement('canvas'); cv.width=256; cv.height=64;
    const p=cv.getContext('2d'); p.fillStyle=text==='TIDEGUARD'?'#15364e':'#e9d6aa'; p.fillRect(0,0,256,64);
    p.fillStyle=text==='TIDEGUARD'?'#e6f4de':'#123c49'; p.font='900 48px Arial'; p.textAlign='center'; p.fillText(text,128,48,248);
    const map=new T.CanvasTexture(cv); map.colorSpace=T.SRGBColorSpace;
    plateCache.set(text,new T.MeshBasicMaterial({map}));
  }
  return plateCache.get(text);
}

export function makeVehicle(scene, type, x,z,yaw=0, options={}) {
  const model = vehicleCatalog[type] ?? motorPool[type];
  const root=new T.Group(), body=new T.Group();
  const paint=new T.MeshStandardMaterial({color:options.color??model.color,metalness:.19,roughness:.37,vertexColors:true,side:T.DoubleSide});
  const roofPaint=paint.clone();roofPaint.vertexColors=false;
  const w=model.w,l=model.l, bike=type==='dart', tall=type==='gull', pickup=type==='mesa', sport=type==='kestrel'||type==='interceptor';
  const h=bike?.77:(tall?.98:(pickup?1.05:(sport?.68:.79)));
  const axis=l*(bike?.39:.327), tire=bike?.31:(pickup?.42:(tall?.38:.32));
  const skin = new T.Mesh(coachwork([
    [-l*.5,w*.40,.28,h-.10], [-l*.43,w*.49,.24,h],[-l*.29,w*.5,.23,h+.015],
    [l*.29,w*.5,.23,h+.02],[l*.44,w*.485,.24,h-.035],[l*.5,w*.41,.27,h-.13]
  ]),paint);
  body.add(skin); root.add(body);
  const black=matte(0x17242d), silver=matte(0xa3b7b4), glass=matte(0x35525c);
  const frontGlow=lit(0xffe7b3), rearGlow=lit(0xfa4536);
  if (!bike) {
    const from=tall?-.365:(pickup?-.27:-.23), to=tall?.42:(pickup?.095:(sport?.21:.29));
    const windshield=new T.Mesh(coachwork([
      [l*from,w*.422,h-.08,h+.05],[l*(from+.11),w*.366,h+.04,model.roof],
      [l*(to-.13),w*.38,h+.05,model.roof-.012],[l*to,w*.43,h-.09,h+.035]
    ]),new T.MeshStandardMaterial({color:0x38606f,roughness:.23,metalness:.15,vertexColors:true,side:T.DoubleSide}));
    body.add(windshield);
    const roofLen=(to-from-.235)*l;
    part(body,box,roofPaint,0,model.roof-.01,l*(from+to)*.5,w*.67,.085,roofLen+.04);
    for (const side of [-1,1]) {
      const pillar=part(body,box,black,w*.395*side,(model.roof+h)/2,.16,w*.06,model.roof-h+.05,.083);
      pillar.rotation.z=-side*.20;
      part(body,box,silver,w*.465*side,h-.065,l*to*.6,.055,.055,.18);
      part(body,box,black,w*.516*side,h+.06,l*(from+.063),.224,.105,.19);
      part(body,box,frontGlow,w*.308*side,h-.164,-l*.49,w*.27,.109,.075);
      part(body,box,rearGlow,w*.313*side,h-.165,l*.491,w*.282,.118,.06);
      part(body,box,lit(0xfca07b),w*.314*side,h-.132,l*.5,w*.235,.026,.026);
      if(pickup) part(body,box,roofPaint,w*.43*side,h+.17,l*.315,.17,.35,l*.37);
      if (sport) part(body,box,black,w*.31*side,h+.09,l*.405,.085,.28,.14);
    }
    if(sport) part(body,box,matte(0x242b33),0,h+.24,l*.423,w*.93,.065,.36);
    part(body,box,black,0,h-.31,l*.481,w*.82,.23,.101);
    part(body,box,black,0,h-.33,-l*.477,w*.75,.22,.145);
    const id = type==='patrol'||type==='interceptor'?'BC · 09':sport?'KSTRL':'BC · 48';
    const badge=new T.Mesh(new T.PlaneGeometry(w*.31,.143),plate(id));
    badge.position.set(0,h-.266,l*.534); body.add(badge);
    if (tall) part(body,box,roofPaint,0,1.65,l*.19,w*.94,1.23,l*.53);
  } else {
    part(body,box,black,0,.82,l*.13,w*.76,.16,.63);
    part(body,box,glass,0,1.04,-l*.19,w*.65,.26,.24).rotation.x=-.34;
    part(body,box,black,0,1.13,-l*.20,.93,.05,.075);
    part(body,box,frontGlow,0,.82,-l*.42,.32,.18,.085);
    part(body,box,rearGlow,0,.65,l*.46,.31,.098,.09);
  }
  const tires=[];
  for(const zSide of [-1,1]) for(const xSide of bike?[0]:[-1,1]) {
    const x=w*.455*xSide,z=axis*zSide;
    const mount = new T.Group(); mount.position.set(x,tire,z); body.add(mount);
    const rub=part(mount,wheel,black,0,0,0,bike?.16:.27,tire,tire);
    const rim=part(mount,wheel,silver,0,0,0,bike?.168:.278,tire*.58,tire*.58);
    tires.push({mount,rub,rim,front:zSide<0});
  }
  const unmarked=type in vehicleCatalog;
  let flash, halos;
  if (!unmarked) {
    const label=plate('TIDEGUARD');
    for(const side of [-1,1]) {
      part(body,box,matte(0xe1e1cb),side*w*.487,h-.147,-.02,.04,.28,l*.52);
      const badge=new T.Mesh(new T.PlaneGeometry(l*.46,.22),label);
      badge.position.set(side*w*.519,h-.145,-.02); badge.rotation.y=side*Math.PI/2; body.add(badge);
    }
    const y=model.roof+.135,z=-.12;
    part(body,box,black,0,y-.065,z,w*.66,.07,.26);
    flash=[part(body,box,lit(0xff5149),-w*.157,y,z,w*.304,.135,.249),
      part(body,box,lit(0x62bdff),w*.157,y,z,w*.304,.135,.249)];
    corona??=glowTexture();
    halos=flash.map((bar,i)=>{
      const halo=new T.Sprite(new T.SpriteMaterial({map:corona,color:i?0x2e9dff:0xff301f,blending:T.AdditiveBlending,depthWrite:false,opacity:.75}));
      halo.position.copy(bar.position);halo.scale.set(1.68,1,1);body.add(halo);return halo;
    });
    const plateFront=new T.Mesh(new T.PlaneGeometry(w*.67,.15),label);
    plateFront.position.set(0,h-.245,-l*.503);plateFront.rotation.y=Math.PI;body.add(plateFront);
  }
  const shadow=shadowDisc(w*.70,l*.54,.43);
  root.add(shadow); scene.add(root);
  const car = {
    type, model, root, body, paint, tires, flash, x,z,yaw,
    speed:0,vx:0,vz:0, steer:0, spin:0, damage:0, contact:0, parked:options.parked??false,
    sync(dt=0,time=0) {
      root.position.set(this.x,0,this.z); root.rotation.y=this.yaw;
      this.spin-=this.speed*dt/(tire||.33);
      body.rotation.z=type==='dart'?this.steer*Math.min(Math.abs(this.speed)*.035,.4):this.steer*.035;
      body.rotation.x=-Math.min(Math.abs(this.speed)*.0012,.035);
      for(const {mount,rub,rim,front} of tires) {
        mount.rotation.y=front ? this.steer*.37 : 0;
        rub.rotation.x=rim.rotation.x=this.spin;
      }
      if(flash) {
        flash[0].visible=Math.floor(time*8)%4!==2;
        flash[1].visible=Math.floor(time*8+2)%4!==2;
        halos.forEach((halo,i)=>{halo.visible=flash[i].visible;});
      }
    },
    repaint(color) {
      paint.color.set(color);roofPaint.color.set(color);
      this.color=color;
    }
  };
  car.color=options.color??model.color;
  car.sync();
  return car;
}
