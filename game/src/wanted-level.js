import * as T from '../vendor/three.module.min.js';
export const POLICE_STATES=['CLEAR','IN SIGHT','SEARCHING'];
export const RESPONSE=['Channel quiet','Patrol dispatched','Two-unit pursuit','Intercept & ram','Air support','Island lockdown'];
export function wantedLevel(scene){
 const mat=new T.MeshBasicMaterial({color:0xff9761,transparent:true,opacity:.52,side:T.DoubleSide,depthWrite:false});
 const ring=new T.Mesh(new T.RingGeometry(.985,1,96),mat);ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
 return {level:0,state:'CLEAR',timer:0,lost:0,cooldown:0,center:{x:0,z:0},heading:0,radius:30,ring,
  crime(severity,p){if(this.cooldown>0&&severity<=this.level)return;this.level=Math.min(5,Math.max(severity,this.level+(severity<=1?1:0)));this.cooldown=4;this.state='IN SIGHT';this.lost=0;this.timer=0;this.center={x:p.x,z:p.z};this.heading=p.yaw},
  clear(){this.level=0;this.state='CLEAR';this.timer=0;this.lost=0;this.ring.visible=false},
  track(seen,p,dt){this.cooldown=Math.max(0,this.cooldown-dt);if(!this.level)return;
   if(seen){this.lost=0;this.state='IN SIGHT';this.timer=0;this.center={x:p.x,z:p.z};this.heading=p.yaw}
   else{this.lost+=dt;if(this.lost>1.1){if(this.state!=='SEARCHING'){this.state='SEARCHING';this.timer=5.5+this.level*1.5}this.timer-=dt;if(this.timer<=0){this.clear();p.notify?.('Dispatch lost contact · free roam');return}}}
   this.radius=19+this.level*4;ring.visible=this.state==='SEARCHING';ring.position.set(this.center.x,.19,this.center.z);ring.scale.setScalar(this.radius);
  }};
}
export function lineOfSight(a,b,world){
 const dx=b.x-a.x,dz=b.z-a.z,n=Math.ceil(Math.hypot(dx,dz)/2.2);
 for(let i=1;i<n;i++){if(!world.clear(a.x+dx*i/n,a.z+dz*i/n,-.12))return false}return true;
}
