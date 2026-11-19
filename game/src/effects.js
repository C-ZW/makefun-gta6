import * as T from '../vendor/three.module.min.js';

export function createEffects(scene) {
  const points=[];
  const line=new T.BoxGeometry(1,1,1);
  const spark=new T.IcosahedronGeometry(1,0);
  const dust=new T.IcosahedronGeometry(1,1);
  const halo=new T.MeshBasicMaterial({color:0xffd48a,transparent:true,opacity:.91});
  const powder=new T.MeshBasicMaterial({color:0xd0ae8e,transparent:true,depthWrite:false});
  const hit=new T.MeshBasicMaterial({color:0xff985d,transparent:true,depthWrite:false});
  const up=new T.Vector3(0,0,1);
  function add(geometry,mat,x,y,z,w,h,d,life) {
    if(points.length>=64) {
      const oldest=points.shift();scene.remove(oldest.mesh);oldest.mesh.material.dispose();
    }
    const mesh=new T.Mesh(geometry,mat.clone());mesh.position.set(x,y,z);mesh.scale.set(w,h,d);scene.add(mesh);
    const fx={mesh,life,total:life,vy:0,vx:0,vz:0,spread:0,opacity:mat.opacity};
    points.push(fx);return fx;
  }
  return {
    muzzle(x,y,z,size=.20) {add(spark,halo,x,y,z,size,size,size,.14);},
    tracer(x,y,z,toX,toY,toZ,thick=.031) {
      const a=new T.Vector3(x,y,z),b=new T.Vector3(toX,toY,toZ).sub(a),distance=b.length();
      const f=add(line,halo,x+b.x/2,y+b.y/2,z+b.z/2,thick,thick,distance,.105);
      f.mesh.quaternion.setFromUnitVectors(up,b.normalize());
    },
    impact(x,y,z,count=5) {
      for(let i=0;i<count;i++) {
        const a=i*2.399;
        const f=add(spark,hit,x,y,z,.065,.04,.079,.29+i*.031);
        f.vx=Math.sin(a)*(1.5+i*.52);f.vz=Math.cos(a)*(1.5+i*.52);f.vy=2.6-i*.24;
      }
    },
    dust(x,z,puff=1) {
      const f=add(dust,powder,x,.22,z,.26*puff,.18*puff,.26*puff,.72);
      f.spread=1.15;f.vy=.42;f.opacity=.21;
    },
    update(dt) {
      for(let i=points.length-1;i>=0;i--) {
        const f=points[i];
        f.life-=dt;
        if(f.life<=0) {scene.remove(f.mesh);f.mesh.material.dispose();points.splice(i,1);continue;}
        f.mesh.material.opacity=f.opacity*f.life/f.total;
        f.mesh.position.x+=f.vx*dt;f.mesh.position.z+=f.vz*dt;f.mesh.position.y+=f.vy*dt;
        f.mesh.scale.multiplyScalar(1+dt*f.spread);
        if(f.vx) f.vy-=dt*9;
      }
    }
  };
}
