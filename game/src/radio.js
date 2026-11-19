export const STATIONS=[
 {name:'Sol FM',band:'RESORT DISCO',freq:'88.3',root:55,beat:.235,notes:[0,7,12,10,7,3,5,10],wave:'triangle'},
 {name:'Quay Wire',band:'HARBOR DUB',freq:'94.6',root:43.65,beat:.32,notes:[0,0,7,3,0,10,7,5],wave:'sine'},
 {name:'Luna AM',band:'NIGHT SYNTH',freq:'102.7',root:65.4,beat:.27,notes:[0,3,7,12,10,7,3,5],wave:'sawtooth'}
];
export function radioBeat(audio,index,step){
 const s=STATIONS[index],n=s.notes[step%8],hz=s.root*2**(n/12);
 audio.tone(hz,.15,s.wave,.030);if(step%2===0)audio.tone(step%4===0?57:167,.095,'sine',.052);
 if(step%4===1||step%8===6){audio.tone(hz*4,.16,'triangle',.022);audio.tone(hz*5,.22,'sine',.017)}
}
