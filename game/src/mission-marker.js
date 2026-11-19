import * as T from '../vendor/three.module.min.js';

export function objectiveBeacon(scene) {
  const root=new T.Group(), columns=new T.Group();
  const core=new T.MeshBasicMaterial({color:0xffd279,transparent:true,opacity:.73,depthWrite:false});
  const soft=new T.MeshBasicMaterial({color:0xf6c863,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
  const ring=new T.Mesh(new T.RingGeometry(1.72,1.87,40),core);
  ring.rotation.x=-Math.PI/2; ring.position.y=.073;root.add(ring);
  const floor=new T.Mesh(new T.CircleGeometry(1.71,40),soft);
  floor.rotation.x=-Math.PI/2;floor.position.y=.064;root.add(floor);
  const column=new T.Mesh(new T.CylinderGeometry(1.85,1.85,2.6,12,1,true),soft.clone());
  column.material.opacity=.10;column.position.y=1.3;columns.add(column);
  const diamond=new T.Mesh(new T.OctahedronGeometry(.50),core);
  diamond.position.y=3.18;root.add(diamond,columns);
  scene.add(root);
  return {
    root,
    update(point,time,isContact) {
      root.visible=!!point;
      if(!point) return;
      root.position.set(point.x,0,point.z);
      root.scale.setScalar(isContact?1:.88);
      diamond.position.y=3.18+Math.sin(time*2.5)*.18;
      diamond.rotation.y=time*.82;
      diamond.visible=isContact;
      core.opacity=.77+Math.sin(time*3)*.18;
    }
  };
}
