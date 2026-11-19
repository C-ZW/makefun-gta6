import {drawingMaterial,ink} from './geometry.js';
export function islandLandmarks(s){
 const ivory=0xffe5af,red=0xd76850,teal=0x296c73;
 const letters=(text,bg,fg,sub)=>drawingMaterial(160,640,c=>{
   c.fillStyle=bg;c.fillRect(0,0,160,640);c.strokeStyle=fg;c.lineWidth=5;c.strokeRect(9,9,142,622);c.fillStyle=fg;c.textAlign='center';c.font='bold 16px sans-serif';c.fillText(sub,80,41);c.font='italic 900 104px sans-serif';
   for(let i=0;i<text.length;i++)c.fillText(text[i],78,139+i*(465/Math.max(1,text.length-1)));
 });
 function blade(x,z,y,h,w,mat,color){
  s.box(x,y+h/2,z,w+.32,h+.36,.72,color);s.face([[x-w/2,y,z+.38],[x+w/2,y,z+.38],[x+w/2,y+h,z+.38],[x-w/2,y+h,z+.38]],0xffffff,mat);
  for(const side of [-1,1])s.box(x+side*(w/2+.095),y+h/2,z+.03,.11,h,.88,0xffbd79,undefined,ink);
 }
 const brisa=letters('BRISA','#983f58','#ffdc88','H O T E L'),lido=letters('LIDO','#21726d','#fff0b3','C I N E M A');
 blade(-11.5,30,3.4,15.5,3.4,brisa,0xad716b);blade(84.8,47,2.8,14,3,lido,teal);blade(12,-17,3.2,10.5,2.5,lido,teal);
 const CX=123,CZ=6,CY=15,R=12;
 s.box(CX,.38,CZ,26,.8,16,0xae7c62);
 for(const z of [CZ-2.1,CZ+2.1]){
  for(const k of [-1,1])s.beam([CX+k*7,.7,z],[CX,CY,z],.31,teal);
  for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
   for(const rad of [R,R-.72])s.beam([CX+Math.cos(a)*rad,CY+Math.sin(a)*rad,z],[CX+Math.cos(b)*rad,CY+Math.sin(b)*rad,z],.105,ivory);
   if(i%2===0)s.beam([CX,CY,z],[CX+Math.cos(a)*R,CY+Math.sin(a)*R,z],.068,ivory);
  }
 }
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=CX+Math.cos(a)*R,y=CY+Math.sin(a)*R;
  s.beam([x,y,CZ-2.2],[x,y,CZ+2.2],.09,red);s.box(x,y-1.2,CZ,1.65,.85,2.55,i%2?red:teal);s.box(x,y-.38,CZ,1.8,.15,2.68,ivory);
  for(const k of [-1,1])s.beam([x+k*.74,y-1.05,CZ+1.15],[x+k*.74,y-.42,CZ+1.15],.045,ivory);
 }
 // A copper crown and fluted setbacks distinguish the downtown radio tower.
 for(const [x,z,height] of [[-25,-25,48],[24,-71,59],[-67,-68,33]]){
  s.box(x,height/2,z,9,height,10,0xb78179);
  for(let i=-3;i<=3;i+=1.5){s.box(x+i,height*.53,z+5,.52,height*.96,.6,ivory);s.box(x+4.6,height*.54,z+i,.48,height*.95,.5,ivory)}
  for(let j=0;j<4;j++)s.box(x,height+j*1.45,z,9-j*1.8,2,10-j*1.8,j%2?teal:ivory);
  s.tube(x,height+8,z,.05,.24,8,ivory);
 }
 for(let i=0;i<4;i++){
  const z=101-i*53;for(const k of [-1,1])s.beam([114+k*1.42,.05,z-1.2],[114+k*1.42,2.1,z-1.2],.095,ivory);
  s.box(114,2.15,z,4.25,.35,3.5,ivory);s.box(114,3.11,z,3.5,1.7,2.7,i%2?0x5eafae:0xe68c77);s.box(114,3.49,z+1.36,2.9,.64,.08,teal);s.box(114,4.12,z,4.35,.26,3.5,ivory,[-.08,0,0]);
 }
}
