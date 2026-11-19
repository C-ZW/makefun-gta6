import { avenues, streets, land, signposts } from './districts.js';
import { streetRoute } from './navigation.js';

export function createMinimap(canvas,world) {
  const c=canvas.getContext('2d'), w=canvas.width=432,h=canvas.height=360;
  const mapX=w/2,mapY=h/2, scale=2.26;
  const circle=(x,y,r)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);};
  const marker=(x,y,color,font,glyph)=>{
    circle(x,y,12);c.fillStyle='#13292e';c.fill();c.lineWidth=1.5;c.strokeStyle=color;c.stroke();
    c.font=font;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(glyph,x,y+1);
  };
  return {
    draw(hero,point,wanted,police,missions,traffic) {
      const ux=x=>mapX+(x-hero.x)*scale, uz=z=>mapY+(z-hero.z)*scale;
      const rect=(color,x,z,sx,sz)=>{c.fillStyle=color;c.fillRect(ux(x),uz(z),sx*scale,sz*scale);};
      c.fillStyle='#173e49';c.fillRect(0,0,w,h);
      for(let i=0;i<h;i+=11) {
        c.fillStyle=i%3?'#1e4852':'#18424c';
        c.fillRect(0,i,w,1);
      }
      rect('#c6ab80',land.left,land.top,416,524);
      rect('#6b6c62',land.left,land.top,381,524);
      rect('#828c62',12,-68,56,55);
      rect('#626e5e',-316,-51,98,102);
      rect('#2e4545',-298,-9,102,18);
      for(const o of world.solids) rect('#263b3c',o.x-o.w,o.z-o.d,o.w*2,o.d*2);
      for(const x of avenues) {
        rect('#70807a',x-8,-261,16,522);rect('#52676a',x-6.8,-261,13.6,522);
      }
      for(const z of streets) {
        rect('#70807a',land.left,z-8,369,16);rect('#52676a',land.left,z-6.4,369,12.8);
      }
      for(const car of traffic.moving) {
        if(Math.abs(car.x-hero.x)>102||Math.abs(car.z-hero.z)>96) continue;
        circle(ux(car.x),uz(car.z),2.9);c.fillStyle='#d6d8c2';c.fill();
      }
      if(wanted.stars) {
        const x=ux(wanted.x),z=uz(wanted.z),r=wanted.radius*scale;
        circle(x,z,r);c.fillStyle=wanted.state==='SEARCHING'?'#ffc76c38':'#fd79633d';c.fill();
        c.lineWidth=3;c.setLineDash([7,6]);c.strokeStyle=wanted.state==='SEARCHING'?'#ffc76c':'#ff8a71';c.stroke();c.setLineDash([]);
        for(const unit of police.units) if(unit.active) {
          const px=ux(unit.car.x),py=uz(unit.car.z);
          circle(px,py,6);c.fillStyle=unit.id%2?'#8ecdf5':'#ff7f71';c.fill();c.strokeStyle='#23363d';c.lineWidth=2;c.stroke();
        }
        if(police.roadblock.active) {
          const b=police.roadblock;
          marker(ux(b.x),uz(b.z),'#f69a6f','bold 13px Arial','×');
        }
        if(police.air.on) marker(ux(police.air.x),uz(police.air.z),'#f9d295','bold 15px Arial','+');
      }
      if(point) {
        const route=streetRoute(hero,point,world);
        c.beginPath();
        for(let i=0;i<route.length;i++) {
          const [x,z]=route[i];if(i)c.lineTo(ux(x),uz(z));else c.moveTo(ux(x),uz(z));
        }
        c.lineJoin='round';c.lineCap='round';c.lineWidth=9;c.strokeStyle='#414038';c.stroke();
        c.lineWidth=4;c.strokeStyle='#ffca81';c.stroke();
      }
      for(const [key,place] of Object.entries(signposts)) {
        if(Math.hypot(place.x-hero.x,place.z-hero.z)<92)
          marker(ux(place.x),uz(place.z),'#a5ddd5','bold 13px Arial',({safe:'H',shop:'$',race:'R',courier:'D'})[key]);
      }
      if(point) {
        const x=Math.max(13,Math.min(w-13,ux(point.x))), y=Math.max(13,Math.min(h-13,uz(point.z)));
        marker(x,y,'#ffd287','bold 16px Arial',missions.active?'◆':'!');
      }
      c.save();c.translate(mapX,mapY);c.rotate(-hero.yaw);
      c.beginPath();c.moveTo(0,-15);c.lineTo(10,10);c.lineTo(0,6);c.lineTo(-10,10);c.closePath();
      c.strokeStyle='#1a292b';c.lineWidth=4;c.stroke();c.fillStyle='#fff8d7';c.fill();
      c.restore();
      c.fillStyle='#112c32';c.fillRect(w-43,12,29,34);
      c.fillStyle='#fff2ca';c.font='800 19px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('N',w-29,29);
    }
  };
}
