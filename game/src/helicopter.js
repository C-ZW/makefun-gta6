import * as T from '../vendor/three.module.min.js';
import {sculpture,ink,drawingMaterial} from './geometry.js';
export function airWatch(scene){
 const s=sculpture(),hull=0x344b55,trim=0xf3d5a1,glass=0x65a9ad;
 s.oval(0,0,0,2.1,1.75,4.35,hull);s.oval(0,.12,-1.15,1.95,1.58,2.18,glass);
 s.oval(0,-.47,-.15,2.04,.68,3.87,trim);
 for(const k of [-1,1]){
  s.box(k*1.015,.04,.17,.05,.56,1.2,glass);s.beam([k*.79,-.5,-.87],[k*1.04,-1.05,-.87],.075,hull);s.beam([k*.75,-.5,.8],[k*1.04,-1.05,.8],.075,hull);
  s.beam([k*1.04,-1.06,-1.47],[k*1.04,-1.06,1.53],.095,hull);s.oval(k*1.06,.23,.98,.12,.13,.19,k>0?0xff5b50:0x65fee0,undefined,ink);
  const X=k*1.073;s.face([[X,-.48,k*1.08],[X,-.48,-k*.70],[X,-.12,-k*.70],[X,-.12,k*1.08]],0xffffff,airInsignia);
  s.beam([k*.91,.05,-1.79],[k*.73,.62,-1.22],.055,trim);s.beam([k*.79,.04,-1.98],[k*.55,.58,-1.58],.035,hull);
 }
 s.beam([0,.18,1.3],[0,.59,5.15],.25,hull);s.face([[0,.40,4.3],[0,1.90,5.1],[0,1.93,5.55],[0,.27,5.1]],trim);
 for(const z of [3.43,3.88])s.beam([0,.18+(z-1.3)*.106,z],[0,.18+(z-1.1)*.106,z+.2],.256,0xe8b46e);
 s.box(0,.67,3.9,2.1,.11,.42,hull);s.box(0,.97,.15,.94,.54,1.75,hull);s.tube(0,1.42,.05,.085,.1,.7,trim);
 const body=s.finish(scene),r=sculpture();for(let j=0;j<4;j++){let a=j*Math.PI/2;r.box(Math.sin(a)*2.42,0,Math.cos(a)*2.42,.18,.065,4.95,hull,[0,a,0]);r.box(Math.sin(a)*4.74,0,Math.cos(a)*4.74,.2,.07,.46,trim,[0,a,0])}
 const rotor=r.finish(body);rotor.position.set(0,1.76,.05);const tail=sculpture();
 for(let i=0;i<3;i++){const a=i*Math.PI/3;tail.box(0,0,0,.08,.105,1.48,hull,[a,0,0])}const tr=tail.finish(body);tr.position.set(.23,.83,5.13);
 const glow=new T.Mesh(new T.ConeGeometry(3.15,14,24,1,true),new T.MeshBasicMaterial({color:0xffe7ab,transparent:true,opacity:.135,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));glow.position.set(.28,-7.35,-1.6);glow.rotation.x=.12;body.add(glow);
 const lens=sculpture();lens.oval(.25,-.73,-.92,.48,.28,.48,0xfffac8,undefined,ink);lens.finish(body);
 body.visible=false;return {body,update(p,heat,dt,time){
  const active=heat.level>=4,was=body.visible;body.visible=active;if(!active)return;
  const heading=heat.heading,sx=Math.sin(heading),cz=Math.cos(heading),anchor=heat.center;
  const offset=-1.8+Math.sin(time*.38)*3,range=28+Math.cos(time*.21)*3;
  const dest=new T.Vector3(anchor.x+sx*range+cz*offset,9.7+Math.sin(time*.37),anchor.z-cz*range+sx*offset);
  body.position.lerp(dest,was?1-Math.exp(-1.2*dt):1);body.rotation.set(.035,1.03-heading+Math.sin(time*.3)*.2,.085*Math.sin(time*.65));rotor.rotation.y+=dt*29;tr.rotation.x+=dt*38;
 }};
}
const airInsignia=drawingMaterial(192,50,c=>{c.fillStyle='#efdcb2';c.fillRect(0,0,192,50);c.fillStyle='#29484f';c.textAlign='center';c.font='900 28px sans-serif';c.fillText('AIR  •  04',96,36)});
