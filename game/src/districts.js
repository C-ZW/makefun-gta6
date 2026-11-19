export const DISTRICTS=[
 {name:'Mirador Mile',short:'MIRADOR',color:'#fc9368',kind:'Art deco & nightlife'},
 {name:'Saffron Strand',short:'STRAND',color:'#fbc15d',kind:'Beach & boardwalk'},
 {name:'Copper Quay',short:'QUAY',color:'#70c8c2',kind:'Docks & freight'},
 {name:'Loma Verde',short:'LOMA',color:'#a9c87b',kind:'Hills & gardens'}
];
export const streetsX=[-96,-48,0,48,96],streetsZ=[-144,-96,-48,0,48,96,144];
export const districtAt=(x,z)=>x>54?1:z< -58?2:x< -43?3:0;
export const landmarks={home:[12,78],shop:[-12,56],race:[92,94],courier:[-51,-93],park:[-72,24]};
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const nearest=(n,lines)=>lines.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);
