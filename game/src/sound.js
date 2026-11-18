let ctx,engine,gain,siren,sg,mute=false;
export function wake(){
 if(!ctx){ctx=new AudioContext();[engine,gain]=voice('triangle',48);[siren,sg]=voice('sine',430)}
 ctx.resume();
}
function voice(type,hz){let o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;g.gain.value=0;o.connect(g).connect(ctx.destination);o.start();return [o,g]}
export function toggle(){mute=!mute;return mute}
export function ping(hz=440){if(!ctx||mute)return;let [o,g]=voice('sine',hz);g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.19);o.stop(ctx.currentTime+.2)}
export function mix(v,heat,t,active){
 if(!ctx)return;const at=ctx.currentTime,on=active&&!mute;
 engine.frequency.setTargetAtTime(38+(Math.abs(v)%27)*2.4,at,.08);
 gain.gain.setTargetAtTime(on&&v!==null?.026:0,at,.07);
 siren.frequency.setTargetAtTime(490+170*Math.sin(t*5),at,.04);
 sg.gain.setTargetAtTime(on&&heat==='chase'?.024:0,at,.1);
}
// The pirate station's four-bar ident, played on a lightly detuned electric key.
let priorBeat=-1;
export function station(time,playing,onAir){
 if(!ctx||mute||!playing){priorBeat=-1;return}
 let beat=Math.floor(time/.37);if(beat===priorBeat)return;priorBeat=beat;
 const phrase=[0,0,67,0,63,0,0,65,0,0,70,0,67,0,63,0];
 let note=phrase[beat%16];if(beat%8===0)note=[46,43,39,41][Math.floor(beat/8)%4];
 if(!note||(!onAir&&beat%4!==0))return;
 let [o,g]=voice('triangle',440*Math.pow(2,(note-69)/12)),at=ctx.currentTime;
 g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(onAir?.039:.018,at+.018);
 g.gain.exponentialRampToValueAtTime(.0001,at+.49);o.stop(at+.51);
}
