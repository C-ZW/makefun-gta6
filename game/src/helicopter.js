import * as T from '../vendor/three.module.min.js';

export function createAirSupport(scene) {
  const root=new T.Group(), craft=new T.Group();
  const body=new T.MeshStandardMaterial({color:0x263e57,roughness:.53});
  const frost=new T.MeshStandardMaterial({color:0xc5c8b2,roughness:.72});
  const glass=new T.MeshStandardMaterial({color:0x527987,roughness:.24});
  const black=new T.MeshStandardMaterial({color:0x26323c,roughness:.88});
  const lamp=new T.MeshBasicMaterial({color:0xfff5c8});
  const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,10,7);
  const add=(parent,g,m,x,y,z,w,h,d)=>{
    const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
  };
  add(craft,ball,body,0,0,.12,1.42,1.22,2.42);
  add(craft,ball,glass,0,.22,-1.33,1.31,.94,1.13);
  add(craft,box,body,0,.35,-1.95,.13,1.33,.13).rotation.x=.29;
  add(craft,box,body,0,.09,3.5,.35,.42,4.81).rotation.x=-.08;
  add(craft,box,frost,0,.78,5.6,.19,1.5,.68).rotation.x=.32;
  add(craft,box,frost,0,.08,4.5,2.19,.11,.56);
  add(craft,ball,body,0,1.2,.39,.68,.44,1.24);
  add(craft,ball,lamp,0,-.81,-1.81,.34,.27,.36);
  for(const side of [-1,1]) {
    add(craft,box,frost,side*1.12,-1.23,0,.13,.12,3.95);
    add(craft,box,frost,side*.82,-.86,.99,.14,.86,.17).rotation.z=side*.36;
    add(craft,box,frost,side*.82,-.86,-1.03,.14,.86,.17).rotation.z=side*.36;
    add(craft,box,frost,side*1.28,-.174,.26,.115,.27,1.99);
    add(craft,ball,new T.MeshBasicMaterial({color:side<0?0xff6a50:0x70ffd5}),side*1.47,.12,.83,.14,.14,.14);
  }
  const rotor=new T.Group(); rotor.position.y=1.64;craft.add(rotor);
  for(let i=0;i<4;i++) {
    const blade=new T.Group(); blade.rotation.y=Math.PI*i*.5; rotor.add(blade);
    add(blade,box,black,0,0,2.66,.23,.047,4.96);
    add(blade,box,frost,0,0,5.06,.25,.053,.22);
  }
  const tail=new T.Group();tail.position.set(.25,.46,5.65);craft.add(tail);
  add(tail,box,black,0,0,0,.055,1.66,.12);
  add(tail,box,black,0,0,0,.055,.12,1.66);
  root.add(craft);
  const beam = new T.Mesh(new T.ConeGeometry(1,1,24,1,true),new T.ShaderMaterial({
    transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{strength:{value:.29}},
    vertexShader:`varying vec2 coords; void main(){coords=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float strength; varying vec2 coords;
    void main(){gl_FragColor=vec4(1.,.80,.48,strength*(.18+.82*coords.y)*(.66+.34*sin(coords.x*6.283)*sin(coords.x*6.283)));}`
  }));
  const surface=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:beam.material.vertexShader,
    fragmentShader:`varying vec2 coords; void main(){
      float edge=1.-smoothstep(.15,.49,length(coords-.5));
      gl_FragColor=vec4(1.,.80,.52,edge*.36);
    }`
  }));
  surface.rotation.x=-Math.PI/2;
  const light = new T.SpotLight(0xffd697,165,46,.31,.68,1.6);
  scene.add(root,beam,surface,light,light.target);
  const up=new T.Vector3(0,1,0), anchor=new T.Vector3(), ground=new T.Vector3();
  const state={x:0,z:0,y:18,lx:0,lz:0,on:false,phase:0};
  return Object.assign(state,{
    root,beam,light,
    update(dt,hero,wanted,night) {
      if(wanted.stars<5) {
        this.on=false;root.visible=beam.visible=surface.visible=light.visible=false;
        return;
      }
      const t=this.phase+=dt*.25;
      const sight=wanted.state==='IN SIGHT';
      const tx=wanted.x+(sight?(hero.car?.vx??0)*.72:0);
      const tz=wanted.z+(sight?(hero.car?.vz??0)*.72:0);
      const ox=Math.cos(t)*7.4,oz=-32+Math.sin(t)*10;
      if(!this.on) {
        this.x=tx+ox;this.z=tz+oz;this.lx=tx;this.lz=tz;
      }
      this.on=true;
      const a=1-Math.exp(-dt*1.6);
      this.x+=(tx+ox-this.x)*a;this.z+=(tz+oz-this.z)*a;
      this.y=12.2+Math.sin(t*1.5)*1.65;
      const off=sight?0:24;
      this.lx+=(tx+Math.sin(t*2.6)*off-this.lx)*a;
      this.lz+=(tz+Math.cos(t*2.6)*off-this.lz)*a;
      root.visible=beam.visible=surface.visible=light.visible=true;
      root.position.set(this.x,this.y,this.z);
      root.rotation.y=1.05+Math.sin(t)*.34;
      craft.rotation.z=Math.sin(t*2)*.12;craft.rotation.x=.075;
      rotor.rotation.y+=dt*39;tail.rotation.x+=dt*59;
      anchor.set(this.x,this.y-.81,this.z-1.65);
      ground.set(this.lx,.095,this.lz);
      const distance=anchor.distanceTo(ground);
      beam.position.copy(anchor).lerp(ground,.5);
      beam.quaternion.setFromUnitVectors(up,anchor.clone().sub(ground).normalize());
      beam.scale.set(distance*.101,distance,distance*.101);
      beam.material.uniforms.strength.value=night?.58:.43;
      surface.position.copy(ground);surface.scale.setScalar(distance*.113);
      light.position.copy(anchor);light.target.position.copy(ground);light.target.updateMatrixWorld();
    },
    sees(hero,world) {
      return this.on&&Math.hypot(hero.x-this.lx,hero.z-this.lz)<8.3&&
        world.lineClear(this.x,this.z,hero.x,hero.z);
    }
  });
}
