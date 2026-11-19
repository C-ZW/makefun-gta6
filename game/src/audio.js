import {STATIONS,radioBeat} from './radio.js';
export function islandAudio(){
 let ctx,bus,engine,rev,siren,alarm,wind,mute=false,beat=0,bar=0;
 const api={start(){if(ctx){if(ctx.state==='suspended')ctx.resume();return}ctx=new AudioContext();bus=ctx.createGain();bus.gain.value=mute?0:.55;bus.connect(ctx.destination);
   const voice=(wave)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=wave;gain.gain.value=0;osc.connect(gain);gain.connect(bus);osc.start();return [osc,gain]};
   [engine,rev]=voice('sawtooth');[siren,alarm]=voice('sine');
   const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let v=0;for(let i=0;i<data.length;i++){v=(v+(Math.random()-.5)*.14)*.97;data[i]=v}
   wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;const breeze=ctx.createGain();breeze.gain.value=.17;wind.connect(breeze);breeze.connect(bus);wind.start();
  },tone(hz,duration,type,vol){if(!ctx)return;const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start();o.stop(t+duration+.01)},
  shot(slot){if(!ctx)return;api.tone(slot===3?88:164,.1,'sawtooth',.14);api.tone(48,.13,'square',.075)},enemyShot(){api.tone(125,.08,'sawtooth',.045)},
  toggle(){mute=!mute;if(bus)bus.gain.value=mute?0:.55;return mute},
  tick(g,dt){if(!ctx)return;const t=ctx.currentTime,c=g.p.car,h=g.police.heat;
   rev.gain.setTargetAtTime(c&&!g.menu ? .030 : 0,t,.10);engine.frequency.setTargetAtTime(36+(c?Math.abs(c.speed)%12*4+Math.abs(c.speed):0),t,.12);
   alarm.gain.setTargetAtTime(h.level&&h.state==='IN SIGHT'&&!g.menu ? .018 : 0,t,.08);siren.frequency.setTargetAtTime(560+Math.sin(g.time*4)*200,t,.04);
   if(c&&!g.menu){beat-=dt;if(beat<=0){radioBeat(api,g.station,bar++);beat=STATIONS[g.station].beat}}
  }};
 return api;
}
