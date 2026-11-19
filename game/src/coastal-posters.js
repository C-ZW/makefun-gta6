import {drawingMaterial,ink} from './geometry.js';
export function pierSignage(s){
 const print=(radio)=>drawingMaterial(640,320,(c,w,h)=>{
  const bg=radio?'#193f4d':'#f4bd78',paper='#fae1ae',orange='#e97955',aqua='#388984',inkColor='#204e56';
  c.fillStyle=bg;c.fillRect(0,0,w,h);
  const shape=(v,color)=>{c.beginPath();v.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill()};
  c.save();c.beginPath();c.rect(13,13,614,294);c.clip();
  c.fillStyle=radio?orange:paper;c.beginPath();c.arc(486,114,104,0,Math.PI*2);c.fill();
  for(let i=0;i<7;i++){c.fillStyle=bg;c.fillRect(378,127+i*12,216,3+i*.7)}
  for(let j=0;j<4;j++)shape([[0,232+j*19],[91,220+j*20],[179,226+j*15],[296,193+j*28],[394,221+j*11],[499,194+j*19],[640,173+j*23],[640,320],[0,320]],[aqua,'#527e7c','#315e66',inkColor][j]);
  if(radio){
   for(let k=0;k<3;k++){c.strokeStyle=paper;c.lineWidth=5;c.beginPath();c.arc(500,154,31+16*k,-1.2,.5);c.stroke()}
   shape([[441,244],[477,117],[491,117],[526,243],[506,237],[484,157],[458,240]],inkColor);
   for(let i=0;i<4;i++){c.fillStyle=inkColor;c.fillRect(466-i*5,163+i*18,35+i*8,6)}
  }else{
   shape([[373,213],[516,208],[494,230],[396,230]],paper);shape([[460,204],[460,83],[396,202]],'#f9e4b5');shape([[467,101],[467,205],[510,204]],orange);
   c.strokeStyle=inkColor;c.lineWidth=4;c.beginPath();c.moveTo(463,83);c.lineTo(463,213);c.stroke();
  }
  c.textAlign='left';c.fillStyle=radio?paper:inkColor;c.font='bold 19px monospace';c.fillText(radio?'PIRATE RADIO   /   88.3 FM':'PORT VELA   /   BEACH CLUB',30,48);
  c.font='italic 1000 85px sans-serif';c.fillText(radio?'SOL':'SAFFRON',25,137,radio?220:371);c.font='italic bold 66px Georgia';c.fillText(radio?'on air.':'Strand',32,191);
  c.fillStyle=paper;c.font='bold 16px monospace';c.fillText(radio?'INDEPENDENT ISLAND TRANSMISSIONS':'THE SOUTH COAST   •   PIER NINE',31,289);
  for(let y=13;y<307;y+=5)for(let x=13+(y%2);x<627;x+=5){c.fillStyle='rgba(42,43,40,.065)';c.fillRect(x,y,1,1)}
  c.restore();c.strokeStyle=paper;c.lineWidth=4;c.strokeRect(9,9,622,302);
 });
 const beach=print(false),radio=print(true);
 function billboard(x,y,z,w,h,mat){
  for(const k of [-1,1]){s.beam([x+k*w*.36,y-4,z-.8],[x+k*w*.36,y+1,z-.8],.15,0x47626a);s.beam([x+k*w*.36,y,z-.8],[x+k*w*.36,y+h-1,z],.105,0x47626a)}
  s.box(x,y+h/2,z,w+.28,h+.29,.42,0x795c56);s.face([[x-w/2,y,z+.24],[x+w/2,y,z+.24],[x+w/2,y+h,z+.24],[x-w/2,y+h,z+.24]],0xffffff,mat);
  s.box(x,y-.17,z+.48,w+.7,.16,1.0,0x666965);
 }
 billboard(78,10.1,33.8,15,7.5,beach);billboard(-22,11,35.2,14,7,radio);billboard(20,11,-12,11.8,5.9,beach);
 const sign=drawingMaterial(512,90,c=>{c.fillStyle='#276763';c.fillRect(0,0,512,90);c.strokeStyle='#f7e6b9';c.lineWidth=3;c.strokeRect(4,4,504,82);c.fillStyle='#ffebc2';c.textAlign='center';c.font='bold 37px sans-serif';c.fillText('SAFFRON   PIER',256,47);c.font='bold 14px monospace';c.fillText('B O A R D W A L K    •    N I N E',256,72)});
 for(const x of [108,121]){s.box(x,3.4,47,.45,6.8,.62,0xf7cf94);s.box(x,.7,47,.85,1.4,.95,0x559a91)}
 s.box(114.5,6.55,47,14.2,2,.66,0xf5c997);s.face([[107.5,5.73,47.36],[121.5,5.73,47.36],[121.5,7.37,47.36],[107.5,7.37,47.36]],0xffffff,sign);
 for(let j=0;j<21;j++)s.oval(107.65+j*.68,7.53,47.34,.16,.16,.16,0xfff0aa,undefined,ink);
}
export function sailboats(s){
 for(const [x,z,scale,c] of [[151,64,1.1,0xf2b96e],[176,24,1.52,0xde826c],[150,-48,.9,0x89cdc1],[144,120,.83,0xef8d6c]]){
  const y=-.96;s.oval(x,y,z,2.8*scale,1.2*scale,7.4*scale,0xffe5b2);s.beam([x,y,z],[x,y+8*scale,z],.065,0x8b766b);
  s.face([[x-.08,y+1*scale,z+.2],[x-.08,y+7.7*scale,z+.2],[x+1.5*scale,y+.9*scale,z+3.4*scale]],c);
  s.face([[x,y+.85*scale,z-.14],[x,y+6.8*scale,z-.14],[x-.7*scale,y+.9*scale,z-3.3*scale]],0xffe2af);
 }
}
