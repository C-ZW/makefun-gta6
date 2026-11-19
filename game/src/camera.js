import * as T from '../vendor/three.module.min.js';
export function chaseCamera(camera){
  const loc=new T.Vector3(),look=new T.Vector3(),focus=new T.Vector3();let yaw=0,orbit=0,pitch=0,linger=0;
  return {orbit(dx,dy){orbit-=dx*.005;pitch=Math.max(-2,Math.min(4,pitch+dy*.018));linger=2.5},
    update(p,dt,snap=false){
      linger-=dt;if(linger<0&&p.car){orbit*=Math.exp(-2*dt);pitch*=Math.exp(-2*dt)}
      const target=p.yaw+orbit;const delta=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));
      yaw+=delta*(snap?1:1-Math.exp(-6*dt));
      const drive=!!p.car,dist=drive?6.3:4.35,shoulder=drive?1.45:.95;
      const sx=Math.sin(yaw),cz=Math.cos(yaw),base=p.y||0;
      loc.set(p.x-sx*dist+cz*shoulder,base+(drive?2.62:2.25)+pitch,p.z+cz*dist+sx*shoulder);
      focus.set(p.x+sx*7+cz*.25,base+(drive?1.60:1.52),p.z-cz*7+sx*.25);
      const t=snap?1:1-Math.exp(-10*dt);camera.position.lerp(loc,t);look.lerp(focus,t);camera.lookAt(look);
    },reset(){orbit=0;pitch=0;linger=0},get heading(){return yaw}};
}
