import { randomFrom } from './scenery.js';

export function createBellcoveAudio() {
  let engine,siren,wind,noise;
  const audio={
    context:null,master:null,
    start() {
      if(this.context) {
        if(this.context.state!=='running') this.context.resume().catch(()=>{});
        return;
      }
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio) return;
      const cx=this.context=new Audio();
      const rand=randomFrom(401);
      this.master=cx.createGain();this.master.gain.value=.44;this.master.connect(cx.destination);
      noise=cx.createBuffer(1,cx.sampleRate*3,cx.sampleRate);
      const data=noise.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=rand()*2-1;
      const oscillator=(wave,freq,cutoff)=>{
        const osc=cx.createOscillator(),filter=cx.createBiquadFilter(),gain=cx.createGain();
        osc.type=wave;osc.frequency.value=freq;filter.frequency.value=cutoff;gain.gain.value=0;
        osc.connect(filter).connect(gain).connect(this.master);osc.start();
        return {osc,filter,gain};
      };
      engine=[oscillator('sawtooth',46,135),oscillator('triangle',62,175)];
      siren=[oscillator('sine',425,1900),oscillator('triangle',640,1850)];
      const source=cx.createBufferSource(), filter=cx.createBiquadFilter(),gain=cx.createGain();
      source.buffer=noise;source.loop=true;filter.frequency.value=290;gain.gain.value=.045;
      source.connect(filter).connect(gain).connect(this.master);source.start();
      wind={filter,gain};
      cx.resume().catch(()=>{});
    },
    transient(at,{volume,duration,from,to,wave='sine'},output=this.master) {
      const cx=this.context;
      if(!cx) return;
      const osc=cx.createOscillator(),gain=cx.createGain();
      osc.type=wave;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(to,at+duration);
      gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
      osc.connect(gain).connect(output);osc.start(at);osc.stop(at+duration+.015);
    },
    burst(at,volume,decay,cutoff,type,output=this.master) {
      const cx=this.context,src=cx.createBufferSource(),gain=cx.createGain(),f=cx.createBiquadFilter();
      src.buffer=noise;f.type=type;f.frequency.value=cutoff;
      gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+decay);
      src.connect(f).connect(gain).connect(output);
      src.start(at,(at*17)%1.8);src.stop(at+decay+.016);
    },
    percussion(at,type,dest) {
      if(type==='kick') this.transient(at,{volume:.28,duration:.17,from:128,to:48},dest);
      else this.burst(at,type==='hat'?.055:.14,type==='hat'?.045:.125,type==='hat'?6400:1370,'highpass',dest);
    },
    sound(kind,type) {
      if(!this.context||this.context.state!=='running') return;
      const t=this.context.currentTime;
      if(kind==='shot'||kind==='distant') {
        const heavy=type==='shotgun', far=kind==='distant';
        this.burst(t,far?.21:.69,far?.18:heavy?.33:.22,far?670:heavy?890:1700,far?'lowpass':'bandpass');
        this.transient(t,{volume:far?.08:.32,duration:heavy?.15:.077,from:heavy?129:185,to:46,wave:'triangle'});
      } else if(kind==='punch') {
        this.burst(t,.21,.12,620,'lowpass');
        this.transient(t,{volume:.14,duration:.08,from:138,to:47,wave:'triangle'});
      } else if(kind==='impact') this.burst(t,.4,.18,380,'lowpass');
      else if(kind==='complete') {
        [320,402,481,642].forEach((f,i)=>this.transient(t+i*.12,{volume:.091,duration:.38,from:f,to:f*.99,wave:'triangle'}));
      }
    },
    update(time,hero,police,active,throttle) {
      if(!this.context||!engine) return;
      const now=this.context.currentTime;
      const car=active?hero.car:null;
      const speed=car?Math.abs(car.speed):0;
      const at=car?.type==='dart'?64:37;
      const shift=1+Math.floor(speed/12)*.24;
      engine.forEach((e,i)=>{
        e.osc.frequency.setTargetAtTime((at+speed*3.1/shift+Math.sin(time*50)*1.75)*(i?1.51:1)+(throttle?9:0),now,.08);
        e.filter.frequency.setTargetAtTime(123+speed*7+(throttle?52:0),now,.09);
        e.gain.gain.setTargetAtTime(car?(i?.073:.12)+(throttle?.037:0):0,now,.13);
      });
      let distance=Infinity;
      if(active) for(const unit of police.units) if(unit.active) distance=Math.min(distance,Math.hypot(unit.car.x-hero.x,unit.car.z-hero.z));
      const level=Math.max(0,1-distance/71)*.102;
      siren.forEach((voice,i)=>{
        voice.osc.frequency.setTargetAtTime((510+245*Math.sin(time*(i?6.2:3.8)))*(i?1.28:1),now,.037);
        voice.gain.gain.setTargetAtTime(level*(i?.43:1),now,.11);
      });
      wind.gain.gain.setTargetAtTime(active?.060+speed*.0012:.018,now,.4);
      wind.filter.frequency.setTargetAtTime(235+75*Math.sin(time*.68)+speed*6,now,.3);
    }
  };
  return audio;
}
