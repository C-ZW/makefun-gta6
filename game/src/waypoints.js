import * as T from '../vendor/three.module.min.js';
import {sculpture,ink} from './geometry.js';
export function missionWaypoint(scene){
 const group=new T.Group();scene.add(group);const s=sculpture(),gold=0xffc457;
 for(let j=0;j<20;j++){let a=j*Math.PI/10,b=a+.21;s.face([[Math.cos(a)*2.3,.08,Math.sin(a)*2.3],[Math.cos(b)*2.3,.08,Math.sin(b)*2.3],[Math.cos(b)*2.08,.08,Math.sin(b)*2.08],[Math.cos(a)*2.08,.08,Math.sin(a)*2.08]],gold,ink)}
 s.finish(group);const gem=new T.Mesh(new T.OctahedronGeometry(.65),new T.MeshBasicMaterial({color:gold,wireframe:false}));gem.scale.y=1.28;group.add(gem);
 return (point,t)=>{group.visible=!!point;if(!point)return;group.position.set(point[0],.12,point[1]);gem.position.y=2.45+Math.sin(t*2.7)*.18;gem.scale.set(.65,.88,.65);gem.rotation.y=t*1.5};
}
