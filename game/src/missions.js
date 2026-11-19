import { campaign, sideJobs, storyChoice, endings, resolveMission } from './story.js';
import { makeVehicle } from './vehicles.js';
import { objectiveBeacon } from './mission-marker.js';

export const missionStageTypes = ['vehicle','drive','interact','tail','chase','checkpoints','fight','escape','choice'];
const point=at=>at?{x:at[0],z:at[1]}:null;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function missionDirector(scene,hero,services) {
  const beacon=objectiveBeacon(scene);
  const target=makeVehicle(scene,'mesa',0,0,0,{color:0x547483});
  target.root.visible=false;
  return {
    index:0, active:null, stage:0, timer:null, gate:0, suspicion:0,
    branch:null, ending:null, completed:[], sideCompleted:[], failure:null, message:null,
    currentAt:null, target, beacon, started:false, subject:null,
    get next() {return resolveMission(campaign[this.index],this.branch);},
    get current() {return this.active?.stages[this.stage];},
    get contact() {return this.active??this.next;},
    say(speaker,text,seconds=8) { this.message={speaker,text,seconds}; },
    start(mission=this.next) {
      if(!mission||this.active) return false;
      this.active=mission;this.stage=0;this.failure=null;
      this.say(mission.contact,mission.line);
      this.enter();
      return true;
    },
    enter() {
      const s=this.current;
      if(!s) {this.complete();return;}
      this.timer=s.limit??null;
      this.started=false;this.gate=0;this.suspicion=0;
      this.currentAt=point(s.at);
      this.subject=null;
      if(s.type==='escape') {
        this.started=true;services.report(0,s.heat);
      }
      if(s.type==='tail'||s.type==='chase') {
        this.subject={path:s.route, finished:false, cursor:1};
        [target.x,target.z]=s.route[0];target.speed=0;
        const [x,z]=s.route[1];target.yaw=Math.atan2(target.x-x,target.z-z);
        target.root.visible=true;target.sync();
      }
      if(s.type==='checkpoints') this.currentAt=point(s.route[0]);
    },
    advance() {
      target.root.visible=false;
      this.stage++;
      this.enter();
    },
    choose(id) {
      if(this.current?.type!=='choice'||!this.started||!storyChoice.some(item=>item.id===id)) return false;
      this.branch=id;
      this.say('nera',id==='broadcast'?'Then make sure everyone hears it.':'Then make him put your name in ink.');
      this.advance();
      return true;
    },
    complete() {
      const job=this.active;
      if(!job) return;
      const side=job.chapter===-1;
      if(side) {
        if(!this.sideCompleted.includes(job.id)) this.sideCompleted.push(job.id);
      } else {this.completed.push(job.id);this.index++;}
      hero.cash+=job.cash;hero.respect+=side?12:18;
      this.active=null;this.stage=0;this.timer=null;this.currentAt=null;this.subject=null;
      services.notice('COMPLETE',job.name,'+$'+job.cash.toLocaleString()+' · +'+(side?12:18)+' respect');
      if(!side&&this.index===campaign.length) {
        this.ending=endings[this.branch];
        services.ending(this.ending);
      }
      services.checkpoint();
    },
    fail(reason) {
      if(!this.active) return;
      this.failure={job:this.active,reason};
      this.active=null;this.stage=0;this.timer=null;this.currentAt=null;this.subject=null;
      target.root.visible=false;services.dismissEnemies();
      services.notice('JOB FAILED',reason,'Return to the contact to retry');
    },
    targetPoint() {
      if(this.subject) return target;
      return this.currentAt??point(this.next?.start);
    },
    interact() {
      if(!this.active) {
        const jobs=[this.next,...sideJobs].filter(Boolean);
        const found=jobs.find(job=>!hero.car&&distance(hero,point(job.start))<5.4);
        return found ? this.start(found) : false;
      }
      const s=this.current;
      if(s.type==='choice'&&!hero.car&&distance(hero,this.currentAt)<6) {this.started=true;return true;}
      if(s.type!=='interact'||hero.car||distance(hero,this.currentAt)>5.7) return false;
      if(s.grant) services.grant(s.grant);
      this.advance();return true;
    },
    update(dt,time) {
      if(this.message) {
        this.message.seconds-=dt;
        if(this.message.seconds<=0) this.message=null;
      }
      const s=this.current;
      if(s) {
        if(this.timer!==null) {
          this.timer-=dt;
          if(this.timer<=0){this.fail('The window closed');return;}
        }
        if(s.type==='choice') {
          if(!hero.car&&distance(hero,this.currentAt)<5.8) this.started=true;
        }
        if(s.type==='vehicle'&&hero.car&&(!s.vehicle||hero.car.type===s.vehicle)) this.advance();
        if(s.type==='drive'&&hero.car&&(!s.vehicle||hero.car.type===s.vehicle)&&distance(hero,this.currentAt)<(s.arrival??6)&&Math.abs(hero.car.speed)<8) this.advance();
        if(s.type==='checkpoints'&&hero.car&&distance(hero,this.currentAt)<8.5) {
          if(++this.gate===s.route.length) this.advance();
          else this.currentAt=point(s.route[this.gate]);
        }
        if(s.type==='escape'&&services.wanted.stars===0) this.advance();
        if(s.type==='fight') {
          if(!this.started&&distance(hero,this.currentAt)<22) {
            this.started=true;
            services.spawnEnemies(this.currentAt,s.foes,hero);
          }
          if(this.started&&services.countEnemies()===0) this.advance();
        }
        if(this.subject) {
          const subject=this.subject, [x,z]=subject.path[subject.cursor];
          const dx=x-target.x,dz=z-target.z;
          const remaining=Math.hypot(dx,dz);
          if(remaining<.85){
            if(subject.cursor===subject.path.length-1) subject.finished=true;
            else subject.cursor++;
          }
          const gap=distance(hero,target);
          const pace=subject.finished?0:s.type==='tail'?10.3:14.7;
          target.speed+=(pace-target.speed)*(1-Math.exp(-dt*2));
          if(!subject.finished&&remaining>.1) {
            target.x+=dx/remaining*Math.min(remaining,target.speed*dt);
            target.z+=dz/remaining*Math.min(remaining,target.speed*dt);
            const heading=Math.atan2(-dx,-dz);
            target.yaw+=Math.atan2(Math.sin(heading-target.yaw),Math.cos(heading-target.yaw))*Math.min(1,dt*6);
          }
          target.sync(dt);
          if(s.type==='tail') {
            const bad=gap<9||gap>58;
            this.suspicion=Math.max(0,this.suspicion+dt*(bad?1:-1.7));
            if(this.suspicion>6.5) this.fail(gap<9?'Quill’s runner saw you':'You lost the pickup');
            else if(subject.finished&&gap<58) this.advance();
          } else if(gap<5.3&&hero.car) this.advance();
          else if(subject.finished) this.fail('The courier reached the ferry');
        }
      }
      beacon.update(this.targetPoint(),time,!this.active||s?.type==='interact'||s?.type==='choice');
    }
  };
}
