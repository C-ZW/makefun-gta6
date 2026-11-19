import * as T from '../vendor/three.module.min.js';
import {textureCanvas} from './geometry.js';
import {streetsX,streetsZ} from './districts.js';
import {glazing} from './street-art.js';
import {VEHICLES} from './vehicles.js';
export function streetLighting(scene){
 const fade=textureCanvas(64,64,c=>{const g=c.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'#ffffffdc');g.addColorStop(.45,'#ffffff99');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,64,64)});
 const shadow=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:fade,color:0x302a36,transparent:true,depthWrite:false,opacity:.64}),160);
 const lamps=new T.InstancedMesh(new T.PlaneGeometry(8,9),new T.MeshBasicMaterial({map:fade,color:0xffc575,transparent:true,depthWrite:false,blending:T.AdditiveBlending}),streetsX.length*streetsZ.length);
 const stamp=new T.Object3D();stamp.rotation.x=-Math.PI/2;let i=0;
 for(const x of streetsX)for(const z of streetsZ){stamp.position.set(x+6.8,.186,z+11);stamp.updateMatrix();lamps.setMatrixAt(i++,stamp.matrix)}
 const spot=new T.Mesh(new T.PlaneGeometry(6.9,8),new T.MeshBasicMaterial({map:fade,color:0xffe4b0,transparent:true,depthWrite:false,opacity:.48,blending:T.AdditiveBlending}));spot.rotation.x=-Math.PI/2;
 shadow.frustumCulled=lamps.frustumCulled=false;shadow.count=0;scene.add(shadow,lamps,spot);
 glazing.emissiveMap=glazing.map;glazing.emissive.set(0xffd7aa);glazing.emissiveIntensity=.025;
 return g=>{i=0;stamp.rotation.set(-Math.PI/2,0,0,'YXZ');const draw=(x,y,z,sz)=>{if(i>=160)return;stamp.scale.set(1.05*sz,1.45*sz,1);stamp.position.set(x+.12,y+.016,z-.14);stamp.updateMatrix();shadow.setMatrixAt(i++,stamp.matrix)};
  if(!g.p.car)draw(g.p.x,g.p.y+.044,g.p.z,1);
  for(const n of g.people)if(n.model.visible)draw(n.x,.172,n.z,n.health>0?.82:1.13);
  for(const n of g.combat.foes)draw(n.x,.05,n.z,.85);
  for(const car of g.cars){if(!car.model.visible||i>=160)continue;const spec=VEHICLES[car.type];stamp.rotation.set(-Math.PI/2,-car.yaw,0,'YXZ');stamp.scale.set(spec.w*1.84,spec.l*1.35,1);stamp.position.set(car.x+.35,g.world.height(car.x,car.z)+.059,car.z-.21);stamp.updateMatrix();shadow.setMatrixAt(i++,stamp.matrix)}
  shadow.count=i;shadow.instanceMatrix.needsUpdate=true;
  const night=Math.max(0,Math.min(1,(Math.cos((g.time/620+18.5667/24)*Math.PI*2)-.1)*1.18));lamps.material.opacity=.02+night*.32;glazing.emissiveIntensity=.025+.43*night;
  spot.visible=g.police.heli.body.visible;if(spot.visible){const pos=g.police.heli.body.position;spot.position.set(pos.x,.20,pos.z-1.2)}
 };
}
