import { avenues, streets } from './districts.js';

export const nearestTo = (values,value) => values.reduce((best,p)=>Math.abs(p-value)<Math.abs(best-value)?p:best);

export function streetRoute(a,b,world) {
  if(Math.hypot(a.x-b.x,a.z-b.z)<33 && world.lineClear(a.x,a.z,b.x,b.z)) return [[a.x,a.z],[b.x,b.z]];
  const ax=nearestTo(avenues,a.x), az=nearestTo(streets,a.z);
  const bx=nearestTo(avenues,b.x), bz=nearestTo(streets,b.z);
  if(a.x<-198||b.x<-198) {
    const bridge=[];
    if(a.x>-198) bridge.push([ax,az],[ax,0]);
    bridge.push([-160,0],[-251,0]);
    if(a.x<-198) {
      bridge.reverse();
      if(b.x>-198) bridge.push([bx,0],[bx,bz]);
    }
    return [[a.x,a.z],...bridge,[b.x,b.z]];
  }
  if(Math.abs(a.x-ax)+Math.abs(b.z-bz)<Math.abs(a.z-az)+Math.abs(b.x-bx)) {
    return [[a.x,a.z],[ax,a.z],[ax,bz],[b.x,bz],[b.x,b.z]];
  }
  return [[a.x,a.z],[a.x,az],[bx,az],[bx,b.z],[b.x,b.z]];
}
