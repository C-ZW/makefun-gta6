import {drawingMaterial,seedRandom} from './geometry.js';
export const SHOPFRONTS=['HOTEL BRISA','SOL  CLUB','RADIO  VELA','MARÉ   CAFÉ','POOL  ROOM','LUZ  FILMS','SALT  &  LIME','PALMA  MOTORS','CINEMA  LIDO','CLUB  CARMIN','PORT  OFFICE','TIDE  SUPPLY','CASA  SOL','BASS  RECORDS','VELA   POST','NACRE  BAR'];
const palette=[['#174d53','#f7cf81'],['#ee705c','#fff0bd'],['#974764','#ffd694'],['#297975','#fff2bc']];
export const lettering=drawingMaterial(1024,1024,ctx=>{
 SHOPFRONTS.forEach((name,i)=>{const x=i%2*512,y=Math.floor(i/2)*128,[bg,fg]=palette[i%4];
 ctx.fillStyle=bg;ctx.fillRect(x,y,512,128);ctx.strokeStyle=fg;ctx.lineWidth=3;ctx.strokeRect(x+7,y+7,498,114);
 ctx.fillStyle=fg;ctx.textAlign='center';ctx.font='bold 14px monospace';ctx.fillText('P O R T    V E L A     /     I S L A N D',x+256,y+32);
 ctx.font='italic 900 51px sans-serif';ctx.fillText(name,x+256,y+91,470);
 });
});
export function sign(s,points,i){
 const x=(i%2)/2,y=1-Math.floor(i/2)/8;
 s.face(points,0xffffff,lettering,[x,y-1/8,x+.5,y-1/8,x+.5,y,x,y]);
}
export const glazing=drawingMaterial(512,512,c=>{
 const rng=seedRandom(98);
 for(let r=0;r<8;r++)for(let col=0;col<8;col++){
   let x=col*64,y=r*64;
   c.fillStyle='#576a70';c.fillRect(x,y,64,64);c.fillStyle='#e3c9ad';c.fillRect(x,y+55,64,9);
   const g=c.createLinearGradient(x,y,x+47,y+49);let colors=[['#36586b','#689395'],['#40576a','#a7b3af'],['#54606c','#dfb298'],['#934e55','#ffce81']][Math.floor(rng()*4)];
   g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(x+5,y+4,54,46);
   c.fillStyle='#d4c3ab';c.fillRect(x+31,y+3,2,49);c.fillStyle='rgba(47,50,62,.4)';c.fillRect(x+4,y+3,55,5);
   if(rng()>.45){c.fillStyle='rgba(255,225,184,.44)';c.fillRect(x+5,y+5,24,8+18*rng())}
 }
},true);
export const asphalt=drawingMaterial(256,256,c=>{
 const r=seedRandom(300);c.fillStyle='#595461';c.fillRect(0,0,256,256);
 for(let i=0;i<9000;i++){const a=r();c.fillStyle=a>.5?'rgba(211,193,178,.12)':'rgba(20,30,42,.15)';c.fillRect(r()*256,r()*256,1+r()*1.6,1)}
 c.strokeStyle='rgba(45,41,50,.32)';c.lineWidth=1;c.beginPath();c.moveTo(18,0);for(let y=0;y<150;y+=12)c.lineTo(16+y*.42+r()*10,y);c.stroke();
},true);
