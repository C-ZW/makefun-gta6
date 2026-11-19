import * as T from '../vendor/three.module.min.js';
export function sculpture(){return new Sculpture()}
export const surface=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
export const ink=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
const cube=new T.BoxGeometry(),ball=new T.SphereGeometry(.5,12,8);
const tubes=new Map(),color=new T.Color(),matrix=new T.Matrix4(),normalMatrix=new T.Matrix3();
const pt=new T.Vector3(),norm=new T.Vector3(),scale=new T.Vector3(),q=new T.Quaternion(),angles=new T.Euler(),axis=new T.Vector3(0,1,0);
export function textureCanvas(w,h,paint){
  const el=document.createElement('canvas');el.width=w;el.height=h;paint(el.getContext('2d'),w,h);
  const texture=new T.CanvasTexture(el);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function drawingMaterial(w,h,paint,lit=false){
  const opts={map:textureCanvas(w,h,paint),side:T.DoubleSide,vertexColors:true};
  return lit?new T.MeshLambertMaterial(opts):new T.MeshBasicMaterial(opts);
}
class Sculpture{
  constructor(){this.parts=new Map()}
  add(g,x,y,z,w,h,d,tint,rotation=[0,0,0],mat=surface){
    let batch=this.parts.get(mat);
    if(!batch){batch={pos:[],nor:[],uv:[],rgb:[],idx:[]};this.parts.set(mat,batch)}
    const base=batch.pos.length/3,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
    const rot=rotation.isQuaternion?rotation:q.setFromEuler(angles.set(...rotation));
    matrix.compose(pt.set(x,y,z),rot,scale.set(w,h,d));normalMatrix.getNormalMatrix(matrix);color.set(tint);
    for(let i=0;i<p.count;i++){
      pt.fromBufferAttribute(p,i).applyMatrix4(matrix);batch.pos.push(pt.x,pt.y,pt.z);
      norm.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);batch.nor.push(norm.x,norm.y,norm.z);
      batch.uv.push(u?u.getX(i):0,u?u.getY(i):0);batch.rgb.push(color.r,color.g,color.b);
    }
    const index=g.index;for(let i=0;i<(index?index.count:p.count);i++)batch.idx.push(base+(index?index.getX(i):i));
  }
  box(x,y,z,w,h,d,c,r,mat){this.add(cube,x,y,z,w,h,d,c,r,mat)}
  oval(x,y,z,w,h,d,c,r,mat){this.add(ball,x,y,z,w,h,d,c,r,mat)}
  tube(x,y,z,top,bottom,h,c,sides=12,r=[0,0,0],mat=surface){
    const key=[top,bottom,sides].join('/');
    if(!tubes.has(key))tubes.set(key,new T.CylinderGeometry(top,bottom,1,sides));
    this.add(tubes.get(key),x,y,z,1,h,1,c,r,mat);
  }
  beam(a,b,r,c,sides=7){
    const v=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),len=v.length();
    this.tube((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,r,len,c,sides,new T.Quaternion().setFromUnitVectors(axis,v.normalize()));
  }
  face(points,c,mat=surface,uv){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv||[0,0,1,0,1,1,0,1].slice(0,points.length*2),2));
    const indices=[];for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);
    g.setIndex(indices);g.computeVertexNormals();this.add(g,0,0,0,1,1,1,c,[0,0,0],mat);
  }
  finish(parent,shadow=false){
    const group=new T.Group();
    for(const [material,b] of this.parts){
      const g=new T.BufferGeometry();
      for(const [name,data,size] of [['position',b.pos,3],['normal',b.nor,3],['uv',b.uv,2],['color',b.rgb,3]])g.setAttribute(name,new T.Float32BufferAttribute(data,size));
      g.setIndex(b.idx);const mesh=new T.Mesh(g,material);mesh.castShadow=shadow;mesh.receiveShadow=true;group.add(mesh);
    }
    parent?.add(group);return group;
  }
}
export function seedRandom(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
