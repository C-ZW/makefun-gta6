import {ink} from './geometry.js';
export function palmTree(s,x,z,h,angle=0){
 const lean=h*.14,tx=x+Math.cos(angle)*lean,tz=z+Math.sin(angle)*lean;
 s.beam([x,.12,z],[tx,h,tz],h*.026,0x84685d,8);
 for(let i=1;i<7;i++){const k=i/7;s.tube(x+(tx-x)*k,h*k,z+(tz-z)*k,h*.029,h*.023,.12,0xaa8870,8)}
 for(let j=0;j<10;j++){
   const a=j*2.4+angle,L=h*(.48+.09*Math.sin(j*33)),dx=Math.cos(a),dz=Math.sin(a);
   const spine=t=>[tx+dx*L*t,h+L*(.59*Math.sin(t*Math.PI)-.28*t),tz+dz*L*t];
   for(let k=0;k<7;k++){
     const t=k/7,u=(k+1)/7,A=spine(t),B=spine(u),w=(.23+.77*Math.sin((t+.06)*Math.PI))*L*.155;
     for(const side of [-1,1]){const C=[B[0]+dx*.32-dz*w*side,B[1]-.25-w*.38,B[2]+dz*.32+dx*w*side];s.face([A,B,C],side<0?0x176658:0x398258)}
   }
 }
 s.tube(x,.125,z,.62,.7,.22,0xac8b72,10);
}
export function umbrella(s,x,z,shade){
 s.tube(x,1.5,z,.06,.09,3,0x725b52);
 for(let i=0;i<10;i++){const a=i*Math.PI/5,b=a+Math.PI/5;s.face([[x,3.8,z],[x+Math.cos(a)*2.8,2.8,z+Math.sin(a)*2.8],[x+Math.cos(b)*2.8,2.8,z+Math.sin(b)*2.8]],i%2?0xffdfab:shade)}
 s.box(x, .49,z+1.2,1.05,.16,2.2,shade,[-.15,0,0]);
}
export function streetLight(s,x,z,dir){
 s.tube(x,2.65,z,.07,.12,5.3,0x446269,8);s.beam([x,5.25,z],[x+dir*1.45,5.7,z],.07,0x446269);
 s.box(x+dir*1.65,5.68,z,.82,.20,.43,0x34505b);s.box(x+dir*1.65,5.56,z,.66,.05,.35,0xffe99f,undefined,ink);
}
