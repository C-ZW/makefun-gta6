import * as T from '../vendor/three.module.min.js';
import { makeCharacter } from './characters.js';

export const crewTactics = {seek:'CLOSING', aim:'AIMING',fire:'FIRING',recover:'REGROUPING',down:'DOWN'};
const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const skinTones=['#825747','#ba8566','#d29a78'];

export function createCombat(scene,world,hero,gear,civilians,effects,services) {
  const ray=new T.Vector3(), axis=new T.Vector3(), pickups=[], crew=[];
  const icons={cash:0xffc77c,armor:0x6fe3ce,health:0xf68876,ammo:0xcde0aa};
  const pickupGeo=new T.BoxGeometry(.46,.43,.46);
  const markers=new T.MeshBasicMaterial({color:0xff715e,transparent:true,opacity:.9});
  const markerGeo=new T.OctahedronGeometry(.145,0);
  for(const [i,spec] of [[0,['health',173,103]],[1,['armor',152,64]],[2,['ammo',41,-62]],[3,['armor',149,172]],[4,['health',-272,10]]]) {
    putPickup(...spec,Infinity,i);
  }
  function putPickup(kind,x,z,life=55,phase=0) {
    const mesh=new T.Mesh(pickupGeo,new T.MeshBasicMaterial({color:icons[kind],transparent:true,opacity:.89}));
    scene.add(mesh);
    pickups.push({kind,x,z,mesh,life,phase});
  }
  function retire(enemy) {
    enemy.state=crewTactics.down;enemy.marker.visible=false;
    effects.impact(enemy.x,1.12,enemy.z,6);
    putPickup(enemy.id%3===1?'armor':enemy.id%3===2?'ammo':'cash',enemy.x+.2,enemy.z+.2);
  }
  function lineTo(ox,oz,tx,tz) {
    if(world.lineClear(ox,oz,tx,tz)) return [tx,tz];
    let lo=0,hi=1;
    for(let k=0;k<8;k++) {
      const a=(lo+hi)/2;
      if(world.lineClear(ox,oz,ox+(tx-ox)*a,oz+(tz-oz)*a)) lo=a;
      else hi=a;
    }
    return [ox+(tx-ox)*lo,oz+(tz-oz)*lo];
  }
  return {
    crew,pickups,lastHit:0,flash:0,lastHurt:0,
    count() { return crew.filter(o=>o.health>0).length; },
    dismiss() {
      while(crew.length) scene.remove(crew.pop().rig.group);
    },
    spawn(where,count) {
      this.dismiss();
      const angle=Math.atan2(where.x-hero.x,where.z-hero.z);
      for(let i=0;i<count;i++) {
        let x,z;
        for(let a=0;a<40;a++) {
          const dir=angle+(i-(count-1)*.5)*.63+a*.79;
          const d=6.8+(i%3)*2.9+(a%4)*1.6;
          x=where.x+Math.sin(dir)*d;z=where.z+Math.cos(dir)*d;
          if(world.free(x,z,.45)&&gap(hero,{x,z})>5.6&&crew.every(p=>gap(p,{x,z})>3)) break;
        }
        const rig=makeCharacter(scene,{skin:skinTones[i%3],hair:'#382932',shirt:i%2?'#853c4b':'#9b5460',pants:'#323745'});
        const marker=new T.Mesh(markerGeo,markers); marker.position.y=2.36;rig.group.add(marker);
        const yaw=Math.atan2(x-hero.x,z-hero.z);
        const enemy={x,z,yaw,rig,marker,id:i,health:i%2?57:45,cooldown:1.65+i*.52,state:crewTactics.seek};
        crew.push(enemy);rig.pose(x,z,yaw,0,0,true);
      }
    },
    aimShot(camera,input) {
      const w=gear.weapon, ammo=gear.ammo, armed=!!w.clip;
      if(gear.cooldown||gear.reload||!input.fire) return false;
      if(armed&&!ammo.mag) {gear.startReload();return false;}
      gear.cooldown=w.delay;
      const sx=-Math.sin(hero.yaw),sz=-Math.cos(hero.yaw);
      let mx=hero.x+sx*.54,mz=hero.z+sz*.54;
      if(armed) {
        ammo.mag--;
        mx+=Math.cos(hero.yaw)*.26;mz-=Math.sin(hero.yaw)*.26;
        this.flash=.12;effects.muzzle(mx,1.41,mz,w.id==='shotgun'?.33:.17);
        civilians.panic(hero.x,hero.z,29);
        services.sound('shot',w.id);
      } else services.sound('punch');
      camera.getWorldDirection(ray);
      let target=null, best=Infinity;
      axis.set(ray.x,0,ray.z).normalize();
      const options=[...crew,...civilians.people];
      for(const p of options) {
        if(p.health<=0) continue;
        const dx=p.x-camera.position.x,dz=p.z-camera.position.z;
        const along=dx*axis.x+dz*axis.z;
        const near=gap(hero,p), lateral=Math.abs(dx*axis.z-dz*axis.x);
        const aimY=camera.position.y+along*ray.y/Math.max(.01,Math.hypot(ray.x,ray.z));
        const hitHeight=aimY>.19&&aimY<2.12;
        if(near>w.range) continue;
        let score;
        if(armed) {
          const width=.49 + Math.min(w.spread*near*(input.aim?.54:1.0),w.id==='shotgun'?1.27:.54);
          if(along<0||lateral>width||!hitHeight) continue;
          score=lateral+near*.003;
        } else {
          if((p.x-hero.x)*sx+(p.z-hero.z)*sz<-.28) continue;
          score=near;
        }
        if(score<best&&world.lineClear(hero.x,hero.z,p.x,p.z)) {target=p;best=score;}
      }
      if(target) {
        if(armed) effects.tracer(mx,1.45,mz,target.x,1.28,target.z,w.id==='shotgun'?.065:.041);
        if(crew.includes(target)) {
          const modifier=w.id==='shotgun'?Math.max(.5,1-gap(hero,target)/42):1;
          target.health-=w.damage*modifier;
          target.cooldown=Math.max(target.cooldown,.48);
          effects.impact(target.x,1.16,target.z,3);
          if(target.health<=0) retire(target);
        } else {
          civilians.harm(target,w.damage);
          services.report(.72);
        }
        this.lastHit=.22;
      } else if(armed) {
        const [tx,tz]=lineTo(mx,mz,mx+axis.x*w.range,mz+axis.z*w.range);
        effects.tracer(mx,1.43,mz,tx,Math.max(.06,1.46+ray.y*Math.hypot(tx-mx,tz-mz)),tz,.025);
        if(this.count()===0)services.report(.10);
      }
      return true;
    },
    update(dt,time,input,camera) {
      this.flash=Math.max(0,this.flash-dt);this.lastHit=Math.max(0,this.lastHit-dt);this.lastHurt=Math.max(0,this.lastHurt-dt);
      for(let i=0;i<4;i++) if(input.take('Digit'+(i+1))) gear.equip(i);
      if(input.take('KeyR')) gear.startReload();
      gear.update(dt);
      if(!hero.car) this.aimShot(camera,input);
      for(const p of crew) {
        if(p.health<=0) {p.rig.pose(p.x,p.z,p.yaw,0,dt,false,true);continue;}
        const range=gap(p,hero), aim=range<29&&world.lineClear(p.x,p.z,hero.x,hero.z);
        p.cooldown-=dt;
        p.state=aim?crewTactics.aim:crewTactics.seek;
        const dx=(hero.x-p.x)/(range||1),dz=(hero.z-p.z)/(range||1);
        const strafe=Math.sin(time*1.31+p.id*2.04)*1.25;
        const push=range>14?2.7:range<6?-2.0:.24;
        const vx=dx*push+dz*strafe,vz=dz*push-dx*strafe;
        if(world.free(p.x+vx*dt,p.z+vz*dt,.37)&&crew.every(other=>other===p||other.health<=0||gap(other,{x:p.x+vx*dt,z:p.z+vz*dt})>.63)) {
          p.x+=vx*dt;p.z+=vz*dt;
        }
        p.yaw=Math.atan2(p.x-hero.x,p.z-hero.z);
        if(aim&&p.cooldown<=0) {
          p.state=crewTactics.fire;p.cooldown=1.7+p.id*.125+Math.abs(Math.sin(time+p.id))*.90;
          const hit=!hero.car&&range<23&&(Math.abs(Math.sin(time*1.93+p.id*3))>.57||range<6);
          effects.muzzle(p.x+dx*.48,1.45,p.z+dz*.48,.17);
          effects.tracer(p.x+dx*.48,1.46,p.z+dz*.48,hero.x+(hit?0:Math.sin(time*3+p.id)*2.9),hit?1.12:.26,hero.z,.035);
          services.sound('distant');
          if(hit) {services.hurt(range<8?12:8);this.lastHurt=.43;}
        }
        if(hero.car&&range<1.45&&Math.abs(hero.car.speed)>7) {p.health=0;retire(p);}
        p.marker.position.y=2.24+Math.sin(time*3+p.id)*.13;
        p.marker.rotation.y=time*2;
        p.rig.pose(p.x,p.z,p.yaw,Math.hypot(vx,vz),dt,aim);
      }
      for(let i=pickups.length-1;i>=0;i--) {
        const item=pickups[i]; item.life-=dt;
        item.mesh.position.set(item.x,.48+Math.sin(time*3+item.phase)*.13,item.z);
        item.mesh.rotation.y=time*1.9;
        if(gap(hero,item)<1.55&&!hero.car) {
          if(item.kind==='health'&&hero.health<100) {hero.health=Math.min(100,hero.health+45);item.life=0;}
          if(item.kind==='armor'&&hero.armor<100) {hero.armor=Math.min(100,hero.armor+45);item.life=0;}
          if(item.kind==='cash') {hero.cash+=35;item.life=0;}
          if(item.kind==='ammo'&&gear.weapon.clip) {gear.ammo.ammo+=Math.ceil(gear.weapon.clip*2.4);item.life=0;}
        }
        if(item.life<=0) {scene.remove(item.mesh);item.mesh.material.dispose();pickups.splice(i,1);}
      }
    }
  };
}
