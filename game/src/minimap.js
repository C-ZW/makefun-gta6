import {streetsX,streetsZ,landmarks,nearest} from './districts.js';
export function drawMinimap(canvas,g){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=g.p,heat=g.police.heat,zoom=1.84;
 const X=x=>w*.5+(x-p.x)*zoom,Z=z=>h*.52+(z-p.z)*zoom;
 c.clearRect(0,0,w,h);c.fillStyle='#537d79';c.fillRect(0,0,w,h);
 c.fillStyle='#d4b68b';c.fillRect(X(-114),Z(-156),243*zoom,315*zoom);c.fillStyle='#b8aa89';c.fillRect(X(-106),Z(-151),212*zoom,302*zoom);
 for(const x of streetsX.slice(0,-1))for(const z of streetsZ.slice(0,-1)){c.fillStyle=x===-96&&z===0?'#91a683':'#988e7d';c.fillRect(X(x+11),Z(z+11),26*zoom,26*zoom)}
 function line(points,color,width){c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';points.forEach(([x,z],i)=>i?c.lineTo(X(x),Z(z)):c.moveTo(X(x),Z(z)));c.stroke()}
 for(const x of streetsX)line([[x,-152],[x,152]],'#e7dbc1',9);for(const z of streetsZ)line([[-103,z],[103,z]],'#e7dbc1',9);line([[-155,-96],[-93,-96]],'#e8dcbc',5);
 if(heat.level){c.fillStyle=heat.state==='SEARCHING'?'#d7664c50':'#e06c6335';c.strokeStyle='#a64d44';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();c.arc(X(heat.center.x),Z(heat.center.z),heat.radius*zoom,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([])}
 const target=g.activity.target()||g.missions.target();if(target){const [x,z]=target,sx=nearest(p.x,streetsX),tx=nearest(x,streetsX),j=nearest(z,streetsZ);
  const pts=[[p.x,p.z],[sx,p.z],[sx,j],[tx,j],[tx,z],[x,z]];line(pts,'#815a26',5);line(pts,'#ffce59',3);
  const a=Math.max(9,Math.min(w-9,X(x))),b=Math.max(9,Math.min(h-9,Z(z)));c.save();c.translate(a,b);c.rotate(Math.PI/4);c.fillStyle='#ffe08a';c.strokeStyle='#795027';c.fillRect(-4.5,-4.5,9,9);c.strokeRect(-4.5,-4.5,9,9);c.restore();
 }
 for(const [key,pt] of Object.entries(landmarks)){if(key==='park')continue;const x=X(pt[0]),z=Z(pt[1]);c.fillStyle=key==='home'?'#3d746b':'#68556a';c.fillRect(x-5,z-5,11,11);c.fillStyle='#fff0c7';c.textAlign='center';c.font='bold 9px sans-serif';c.fillText({home:'H',shop:'$',race:'R',courier:'P'}[key],x+.5,z+3.5)}
 if(heat.level)for(const u of g.police.units){const x=X(u.x),z=Z(u.z);c.fillStyle='#31667e';c.fillRect(x-3,z-3,6,6);c.fillStyle='#ef7464';c.fillRect(x,z-3,3,6)}
 c.save();c.translate(X(p.x),Z(p.z));c.rotate(p.yaw);c.beginPath();c.moveTo(0,-8);c.lineTo(6.5,6);c.lineTo(0,3);c.lineTo(-6.5,6);c.closePath();c.fillStyle='#193c40';c.strokeStyle='#fff7d7';c.lineWidth=2;c.fill();c.stroke();c.restore();
 c.textAlign='center';c.fillStyle='#24464a';c.beginPath();c.arc(w-13,14,9,0,Math.PI*2);c.fill();c.font='bold 10px sans-serif';c.fillStyle='#fff2cb';c.fillText('N',w-13,17.5);
}
