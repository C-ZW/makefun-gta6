export const radioStations = [
  {name:'86.2 SALT FM', tempo:103, voice:'triangle', root:48, chords:[0,5,9,7], motif:[0,7,4,9,7,4,2,4], offbeat:true},
  {name:'91.4 GLASS', tempo:127, voice:'square', root:43, chords:[0,3,-2,5], motif:[0,0,12,7,3,10,7,12], offbeat:false},
  {name:'102.6 JUNIPER', tempo:76, voice:'sine', root:50, chords:[0,-2,3,5], motif:[7,3,0,10,12,7,5,3], offbeat:true}
];
const frequency = midi => 440*2**((midi-69)/12);

export function synthRadio(audio) {
  let index=-1, beat=0, next=0, bus=null;
  function tone(at,midi,volume,duration,wave) {
    const from=frequency(midi);
    audio.transient(at,{from,to:from*.996,volume,duration,wave},bus);
  }
  function pulse(station,at,i) {
    const bar=Math.floor(i/16), s=i%16, chord=station.chords[bar%4], root=station.root+chord;
    const tun=60/station.tempo/4;
    if(s%4===0 || (station.offbeat&&s%8===6)) {
      tone(at,root-13+(s===12?7:0),.14,tun*2.1,'triangle');
      audio.percussion(at,s%8===0?'kick':'snare',bus);
    }
    if(s%2===0) audio.percussion(at,'hat',bus);
    if(s%4===0||s%8===5||(station.tempo>115&&s%4===2)) {
      const note=station.motif[(i+bar*3)%station.motif.length];
      tone(at,root+12+note,station.voice==='square'?.035:.09,tun*(station.tempo<93?4:1.85),station.voice);
    }
    if(s===0||s===8) {
      for(const n of [0,station.tempo===103?4:3,7,10]) tone(at+n*.003,root+n,.027,tun*7,'triangle');
    }
  }
  return {
    get station() {return radioStations[index]?.name??'RADIO OFF';},
    cycle() {
      index=(index+2)%(radioStations.length+1)-1;
      next=0;beat=0;
      return this.station;
    },
    update(active,volume=1) {
      const s=radioStations[index], cx=audio.context;
      if(!cx) return;
      const t=cx.currentTime;
      if(!bus) {bus=cx.createGain();bus.gain.value=0;bus.connect(audio.master);}
      bus.gain.setTargetAtTime(active&&s ? .24*volume : .0001,t,.075);
      if(!active||!s) {next=0;return;}
      if(next<t-.02) next=t+.035;
      while(next<t+.17) {
        pulse(s,next,beat++);
        next+=60/s.tempo/4;
      }
    }
  };
}
