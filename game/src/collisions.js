import {VEHICLES,poseCar} from './vehicles.js';
import {inside} from './vehicle-handling.js';
export function separateVehicles(a,b,world){
 const dx=a.x-b.x,dz=a.z-b.z;if(dx*dx+dz*dz>27)return false;
 const A=VEHICLES[a.type],B=VEHICLES[b.type],sa=Math.sin(a.yaw),ca=Math.cos(a.yaw),sb=Math.sin(b.yaw),cb=Math.cos(b.yaw),axes=[[ca,sa],[sa,-ca],[cb,sb],[sb,-cb]];
 let depth=Infinity,nx=0,nz=0;
 for(const [x,z] of axes){
  const lengthA=Math.abs(ca*x+sa*z)*A.w*.49+Math.abs(sa*x-ca*z)*A.l*.49,lengthB=Math.abs(cb*x+sb*z)*B.w*.49+Math.abs(sb*x-cb*z)*B.l*.49,projection=dx*x+dz*z,overlap=lengthA+lengthB-Math.abs(projection);
  if(overlap<=0)return false;if(overlap<depth){depth=overlap;nx=x*(projection>=0?1:-1);nz=z*(projection>=0?1:-1)}
 }
 const push=(c,k)=>{const x=c.x+nx*k,z=c.z+nz*k;if(inside(x,z)&&world.clear(x,z,.85)){c.x=x;c.z=z;poseCar(c,world);return true}return false};
 const share=b.role==='block'||b.role==='parked'?.94:.49,moved=push(a,(depth+.025)*share);push(b,-(depth+.025)*(moved?1-share:1));
 return true;
}
