import * as T from '../vendor/three.module.min.js';
import {sculpture,ink,seedRandom} from './geometry.js';
import {streetsX,streetsZ,districtAt} from './districts.js';
import {sign,glazing,asphalt} from './street-art.js';
import {palmTree,umbrella,streetLight} from './landscaping.js';
export function buildPortVela(scene){
 const s=sculpture(),r=seedRandom(6519),blocks=[],sand=0xf2c590,cream=0xffdfa9;
 const wall=[0xdf967d,0xd8ae91,0xecaf93,0x83afa6,0xc88289,0xe7cc9f,0xaca6b5];
 const rect=(x,y,z,w,d,c,mat)=>s.face([[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y,z-d/2],[x-w/2,y,z-d/2]],c,mat);
 const shadow=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
 function blockShadow(x,z,w,d,h){const X=x+w/2,Z=z+d/2,a=h*.62,b=h*.45;
   s.face([[x-w/2,.162,Z],[X,.162,Z-d],[X+a,.162,Z-d+b],[X+a,.162,Z+b],[x-w/2+a,.162,Z+b]],0x423448,shadow)}
 rect(0,-1.4,0,1200,1200,0x378d96);rect(0,-.32,0,263,337,sand);rect(-3,-.07,0,220,309,0xafac87);
 for(let i=0;i<450;i++){const side=i%2?1:-1;rect(side*(138+r()*220),-1.33,r()*580-290,1+r()*16,.12+r()*.3,0x80bcb4)}
 for(let i=0;i<25;i++){const a=i*.26,rad=295+r()*65;s.tube(Math.cos(a)*rad,-3,Math.sin(a)*rad,0,30+r()*85,20+r()*70,0x988fa2,6)}
 for(const x of streetsX){for(let z=-144;z<=144;z+=12)rect(x,.005,z,16.4,12,0xffffff,asphalt)}
 for(const z of streetsZ){for(let x=-96;x<=96;x+=12)rect(x,.012,z,12,16.4,0xffffff,asphalt)}
 for(const x of streetsX)for(let z=-141;z<145;z+=6){
   if(Math.abs(z-Math.round(z/48)*48)<10)continue;
   for(const dx of [-.24,.24])rect(x+dx,.035,z,.13,5.95,0xe3b962);
   for(const dx of [-4.3,4.3])rect(x+dx,.036,z,.13,2.45,0xf7e7be);
 }
 for(const z of streetsZ)for(let x=-93;x<97;x+=6){if(Math.abs(x-Math.round(x/48)*48)>9){rect(x,.037,z,5.97,.23,0xe3b962);for(const dz of [-4.3,4.3])rect(x,.037,z+dz,2.4,.13,0xe6d9bd)}}
 for(const x of streetsX)for(const z of streetsZ){
   for(const side of [-1,1])for(let i=-6;i<=6;i+=1.65){
     rect(x+i,.041,z+side*9,.73,2,0xeee0c2);rect(x+side*9,.042,z+i,2,.73,0xeee0c2);
   }
   streetLight(s,x+8.9,z+11,-1);
   if((x+z)%96===0){s.beam([x+8.8,5.1,z+10],[x+2.5,5.1,z+10],.07,0x3f5357);
    s.box(x+2.5,4.81,z+10,.44,1.16,.35,0x59423f);for(let i=0;i<3;i++)s.oval(x+2.5,5.15-i*.33,z+10.2,.28,.28,.1,[0xff6255,0xd29851,0x79edb8][i],undefined,ink)}
 }
 function building(x,z,w,d,h,k,style){
   const paint=wall[k%wall.length],left=x-w/2,right=x+w/2,front=z+d/2,back=z-d/2;
   s.box(x,h/2,z,w,h,d,paint);blocks.push({x,z,w,d});blockShadow(x,z,w,d,h);
   const U=w/20,V=(h-4)/22;
   for(const [a,b,c,e,rep] of [[left,front,right,front,U],[right,front,right,back,d/20],[right,back,left,back,U],[left,back,left,front,d/20]]){
     const nx=-(e-b)*.001,nz=(c-a)*.001;
     s.face([[a+nx,3.25,b+nz],[c+nx,3.25,e+nz],[c+nx,h-.6,e+nz],[a+nx,h-.6,b+nz]],0xffffff,glazing,[0,0,rep,0,rep,V,0,V]);
   }
   s.box(x,h+.16,z,w+.65,.47,d+.65,cream);
   s.box(x,h+.8,z,w*.78,1.05,d*.76,paint);
   s.box(x,h+1.55,z,w*.26,.8,d*.34,0x817977);
   for(let y=3.25;y<h-.4;y+=style===0?3.8:7.5)s.box(x,y,z,w+.74,.26,d+.74,style===0?cream:paint);
   if(style===1)for(let dx=-w*.45;dx<w*.49;dx+=3.1)s.box(x+dx,h*.54,front+.11,.32,h*.92,.45,cream);
   for(let i=0;i<3;i++){
     s.box(x+(i-1)*w*.31,1.55,front+.08,w*.265,2.65,.14,0x36595c);
     s.box(right+.08,1.55,z+(i-1)*d*.31,.14,2.65,d*.265,0x36595c);
     s.box(left-.08,1.55,z+(i-1)*d*.31,.14,2.65,d*.265,0x36595c);
   }
   sign(s,[[left+.3,3.1,front+.46],[right-.3,3.1,front+.46],[right-.3,5.45,front+.46],[left+.3,5.45,front+.46]],k%16);
   sign(s,[[right+.46,3.1,front-.3],[right+.46,3.1,back+.3],[right+.46,5.4,back+.3],[right+.46,5.4,front-.3]],k%16);
   sign(s,[[left-.46,3.1,back+.3],[left-.46,3.1,front-.3],[left-.46,5.4,front-.3],[left-.46,5.4,back+.3]],k%16);
   for(let i=0;i<9;i++)s.box(left+(i+.5)*w/9,2.95,front+.75,w/9,.20,1.6,i%2?cream:paint,[-.15,0,0]);
 }
 glazing.map.wrapS=glazing.map.wrapT=T.RepeatWrapping;
 let k=0;
 for(let col=0;col<4;col++)for(let row=0;row<6;row++){
   const x=-72+col*48,z=-120+row*48,zone=districtAt(x,z);
   s.box(x,.035,z,31.6,.23,31.6,0xe1c8af);
   for(let i=-14;i<15;i+=3.8){rect(x+i,.157,z+15.4,.045,.8,0xab9286);rect(x+15.4,.157,z+i,.8,.045,0xab9286)}
   if(col===0&&row===3){
     rect(x,.16,z,28,28,0x91a879);s.tube(x,.65,z,3,3.2,1,cream,24);s.tube(x,1.17,z,2.65,2.65,.08,0x66c2c0,24);s.tube(x,2.3,z,.3,.7,2.3,cream);
     for(let i=0;i<6;i++)palmTree(s,x+Math.sin(i)*10,z+Math.cos(i)*10,6,i);
   }else if(zone===2&&col!==2){
     for(let i=0;i<8;i++){let X=x+(i%2-.5)*12,Z=z+(Math.floor(i/2)-1.5)*6;s.box(X,1.6,Z,10,3.2,4.8,wall[(i+k)%7]);for(let j=-4;j<=4;j++)s.box(X+j,1.6,Z+2.43,.13,3.1,.1,0x807674);blocks.push({x:X,z:Z,w:10,d:4.8})}
     s.beam([x,0,z],[x,21,z],.57,0xb96d47);s.beam([x-9,21,z],[x+11,21,z],.36,0xda944c);s.beam([x,25,z],[x+11,21,z],.13,0x664c46);s.beam([x,21,z],[x,25,z],.22,0x916847);
   }else{
    const tall=zone===0?13+r()*22:zone===1?7+r()*9:6+r()*7;
    building(x,z-5.7,23,13,tall,k++,row%2);
    building(x+(row%2?2:-2),z+8.35,21,8,5.8+r()*3,k++,0);
   }
   for(const j of [-1,1])palmTree(s,x+j*14,z+(row%2?9:-8),6.2+r()*3.8,k+j);
   for(const j of [-1,1]){s.box(x+j*13.9,.60,z+1,.6,.16,2,0x996d50);s.box(x+j*13.9,.31,z+1,.24,.6,1.45,0x526767)}
 }
 // The Lantern is an offshore weather observatory that can be seen down the Mile.
 const lx=1,lz=-169;
 s.tube(lx,18,lz,1.45,2.75,36,0xebba94,14);for(const [y,a,b,h,c] of [[32,4,1.7,3,0xb58480],[35,7,4,3,cream],[37,7.2,6.9,1.2,0x526e79],[38.4,6.8,7.4,1.3,cream],[40,2.1,6.8,2.4,0xcb8273],[43,.28,.48,5,0x8c6571]])s.tube(lx,y,lz,a,b,h,c,32);
 for(let z=-145;z<149;z+=8){s.box(106,.06,z,5,.25,7.97,0xbf9675);if(z%3===0){palmTree(s,104,z,7,z);umbrella(s,116,z,0xe77669)}}
 for(let i=0;i<5;i++){const X=-82+i*31;const Z=-184-r()*55;s.box(X,7,Z,15,14,12,0xcaa5a1);s.box(X,19,Z,11,20+r()*16,9,0xb89fa1)}
 // A raised causeway continues west from the quay across the lagoon.
 for(let i=0;i<9;i++){const X=-101-i*6,h=bridgeHeight(X,-96);s.box(X,h-.18,-96,6.06,.36,10,0x8e8a86,[0,0,i<3?-.145:i>5?.145:0]);for(const side of [-1,1])s.box(X,h+.5,-96+side*5,6,.75,.32,cream)}
 s.box(-158,-.48,-96,18,.7,18,sand);
 s.finish(scene);return {blocks,clear(x,z,pad=.4){return !blocks.some(b=>Math.abs(x-b.x)<b.w/2+pad&&Math.abs(z-b.z)<b.d/2+pad)},height:bridgeHeight};
}
function bridgeHeight(x,z){return Math.abs(z+96)<5&&x< -98?Math.max(0,Math.min(2.6,(-98-x)*.15,(x+154)*.15)):0}
