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
