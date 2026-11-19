import {drawingMaterial,ink} from './geometry.js';
export const windshield=drawingMaterial(384,128,c=>{
 const g=c.createLinearGradient(0,0,12,128);g.addColorStop(0,'#284555');g.addColorStop(.40,'#648e9b');g.addColorStop(.64,'#94a8a5');g.addColorStop(1,'#456572');c.fillStyle=g;c.fillRect(0,0,384,128);
 c.fillStyle='#304c59';c.beginPath();c.moveTo(0,110);for(let i=0;i<14;i++){const y=81+Math.sin(i*14)*9;c.lineTo(i*32,y);c.lineTo(i*32+21,y);c.lineTo(i*32+22,y+9)}c.lineTo(384,128);c.lineTo(0,128);c.fill();
 for(let i=0;i<3;i++){c.fillStyle='rgba(253,232,189,.13)';c.beginPath();c.moveTo(94+i*28,0);c.lineTo(115+i*28,0);c.lineTo(45+i*28,128);c.lineTo(25+i*28,128);c.fill()}
});
const hoodPrint=drawingMaterial(192,96,c=>{c.fillStyle='#e1d7b9';c.fillRect(0,0,192,96);c.fillStyle='#243e4a';c.textAlign='center';c.font='900 46px sans-serif';c.fillText('PVPD',96,53);c.font='bold 14px monospace';c.fillText('PORT AUTHORITY',96,75)});
export function patrolTrim(s,w,l,h){
 const f=z=>h*(.91+((z/l+.8)/.44)*.09)+.018;
 s.face([[w*.72,f(-l*.77),-l*.77],[-w*.72,f(-l*.77),-l*.77],[-w*.72,f(-l*.43),-l*.43],[w*.72,f(-l*.43),-l*.43]],0xffffff,hoodPrint);
 s.box(0,.445,-l-.045,1.55,.065,.11,0xbab8a8);
 for(let i=-2;i<=2;i++)s.box(0,.53+i*.028,-l-.046,.60,.014,.060,0x899798);
 for(const k of [-1,1]){s.box(k*.38,.47,-l-.075,.065,.29,.10,0x344752);s.box(k*w*.73,.64,-l-.046,.31,.052,.043,0xfff4c8,undefined,ink)}
}
