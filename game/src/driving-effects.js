import * as T from '../vendor/three.module.min.js';
import {textureCanvas} from './geometry.js';
export function tireEffects(scene){
 const marks=new T.InstancedMesh(new T.PlaneGeometry(.15,1),new T.MeshBasicMaterial({color:0x39343c,transparent:true,opacity:.48,depthWrite:false,side:T.DoubleSide}),160);
 marks.count=0;marks.frustumCulled=false;scene.add(marks);const stamp=new T.Object3D(),puffs=[];
 const tex=textureCanvas(64,64,c=>{const g=c.createRadialGradient(32,32,1,32,32,30);g.addColorStop(0,'#fff9');g.addColorStop(.5,'#fff5');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,64,64)});
 for(let i=0;i<12;i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,color:0xe4d6bd,transparent:true,depthWrite:false}));sprite.visible=false;scene.add(sprite);puffs.push({sprite,age:2})}
 let last=null,cursor=0,index=0,cool=0;
 return (g,dt)=>{const c=g.p.car;cool-=dt;
  for(const part of puffs)if(part.age<1){part.age+=dt;const sp=part.sprite;sp.visible=part.age<1;sp.position.y+=dt*.62;sp.scale.setScalar(.4+part.age*2);sp.material.opacity=(1-part.age)*.6}
  if(!c||Math.abs(c.speed)<6||(!g.keys.has('Space')&&Math.abs(Math.sin(c.yaw-c.slip))<.28)){last=null;return}
  const x=c.x-Math.sin(c.yaw)*1.34,z=c.z+Math.cos(c.yaw)*1.34;
  if(last){const dx=x-last.x,dz=z-last.z,length=Math.hypot(dx,dz);if(length<.12)return;
   if(length<4){for(const k of [-1,1]){stamp.position.set((x+last.x)/2+Math.cos(c.yaw)*k*.76,.063,(z+last.z)/2+Math.sin(c.yaw)*k*.76);stamp.rotation.order='YXZ';stamp.rotation.set(-Math.PI/2,Math.atan2(dx,dz),0);stamp.scale.set(1,length+.06,1);stamp.updateMatrix();marks.setMatrixAt(cursor++%160,stamp.matrix)}
    marks.count=Math.min(160,cursor);marks.instanceMatrix.needsUpdate=true;
    if(cool<=0){cool=.075;const part=puffs[index++%12];part.age=0;part.sprite.visible=true;part.sprite.position.set(x,.27,z)}
   }
  }last={x,z};
 };
}
