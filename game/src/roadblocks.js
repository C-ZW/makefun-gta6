import {sculpture,drawingMaterial,ink} from './geometry.js';
export function closeLanes(car){
 const s=sculpture();
 for(const k of [-1,1]){
  const x=k*3.22;
  for(const end of [-1,1]){s.beam([x+end*.75,0,-.36],[x+end*.75,.95,0],.055,0x6a7067);s.beam([x+end*.75,0,.36],[x+end*.75,.95,0],.055,0x6a7067)}
  s.box(x,.74,0,2.1,.52,.14,0xfce0b0);s.face([[x-1.04,.49,.078],[x+1.04,.49,.078],[x+1.04,.99,.078],[x-1.04,.99,.078]],0xffffff,stripes);
  s.face([[x+1.04,.49,-.078],[x-1.04,.49,-.078],[x-1.04,.99,-.078],[x+1.04,.99,-.078]],0xffffff,stripes);
  s.oval(x,1.10,0,.22,.23,.22,0xffae4d,undefined,ink);s.box(x,.055,1.25,.5,.10,.5,0xab694f);s.tube(x,.33,1.25,.04,.19,.62,0xf08e55,8);s.tube(x,.36,1.25,.091,.12,.10,0xffe2b2,8);
 }return s.finish(car.model);
}
const stripes=drawingMaterial(256,64,c=>{
 c.fillStyle='#ffdfa3';c.fillRect(0,0,256,64);c.fillStyle='#b95242';for(let x=-15;x<280;x+=35){c.beginPath();c.moveTo(x,0);c.lineTo(x+17,0);c.lineTo(x-5,34);c.lineTo(x-22,34);c.fill()}
 c.fillStyle='#254149';c.fillRect(0,35,256,29);c.fillStyle='#fff0bd';c.textAlign='center';c.font='bold 16px sans-serif';c.fillText('PVPD   •   ROAD CLOSED',128,56);
});
