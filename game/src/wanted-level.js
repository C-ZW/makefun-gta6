import * as T from '../vendor/three.module.min.js';

export const wantedStates = Object.freeze({clear:'CLEAR',pursuit:'IN SIGHT',search:'SEARCHING'});
export const responseTiers = [
  ['Free roam',0],['Patrol alert',1],['Active pursuit',2],['Interceptors',3],['Roadblocks',4],['Air support',5]
];

export function createWantedLevel(scene) {
  const ring=new T.Mesh(new T.RingGeometry(1,1.014,84),new T.MeshBasicMaterial({
    color:0xffbb75,transparent:true,opacity:.67,depthWrite:false,side:T.DoubleSide
  }));
  ring.rotation.x=-Math.PI/2;
  const inner=new T.Mesh(new T.RingGeometry(.96,1.016,84),new T.MeshBasicMaterial({
    color:0xffa56d,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide
  }));
  ring.add(inner); ring.visible=false; scene.add(ring);
  return {
    state:wantedStates.clear, heat:0, stars:0, timer:0, duration:0, unseen:0,
    x:0,z:0,radius:32, transitions:[],ring,
    setState(state) {
      if(state!==this.state) {
        this.state=state;this.transitions.push(state);
        if(this.transitions.length>18) this.transitions.shift();
      }
    },
    report(amount,x,z,floor=0) {
      this.heat=Math.min(5,Math.max(this.heat+amount,floor));
      this.stars=Math.ceil(this.heat);
      this.x=x;this.z=z;this.unseen=0;this.timer=0;
      this.setState(wantedStates.pursuit);
    },
    reset() {
      this.heat=0;this.stars=0;this.timer=0;this.unseen=0;this.ring.visible=false;
      this.setState(wantedStates.clear);
    },
    update(dt,hero,seen,time) {
      if(!this.stars) return;
      this.radius=27+this.stars*4.4;
      if(seen) {
        this.x=hero.x;this.z=hero.z;this.unseen=0;
        this.timer=0;this.setState(wantedStates.pursuit);
      } else if(this.state===wantedStates.pursuit) {
        this.unseen+=dt;
        if(this.unseen>1.85) {
          this.duration=9+this.stars*1.4;
          this.timer=this.duration;this.setState(wantedStates.search);
        }
      } else {
        const outside=Math.hypot(hero.x-this.x,hero.z-this.z)>this.radius;
        this.timer-=dt*(outside?1.6:1);
        if(this.timer<=0) {this.reset();return;}
      }
      this.ring.visible=true;
      this.ring.position.set(this.x,.086,this.z);
      this.ring.scale.setScalar(this.radius);
      const color=this.state===wantedStates.search?0xffb65e:0xfa8575;
      this.ring.material.color.setHex(color);
      inner.material.color.setHex(color);
      inner.material.opacity=.14+Math.sin(time*3)*.065;
    }
  };
}
