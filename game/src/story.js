export const CHAPTERS=['Borrowed Sun','The Flood Line','Dead Air'];
export const CONTACTS=[
 {name:'Inez Vale',job:'Wheelwoman',color:'#ef984e'},
 {name:'Sol Arco',job:'Pirate radio host',color:'#e7ae5e'},
 {name:'Paz Orta',job:'Dock union rep',color:'#65bcab'},
 {name:'Lio Fen',job:'Port accountant',color:'#e28b79'}
];
const grab=(text='Take a set of wheels')=>({kind:'car',text});
const reach=(point,text,kind='go')=>({kind,point,text});
const evade={kind:'evade',text:'Break sight. Lose the patrol.'};
const tail=(point,text,kind='tail')=>({kind,point,text});
const raid=(point,text)=>({kind:'fight',point,text});
const alarm=(level,text,point)=>({kind:'hot',level,text,point});
export function islandStory(branch=''){
 const air=branch!=='cash';
 return [
 {name:'Dead Letter',contact:1,line:'Orange targa. Glove box. That envelope belongs to everyone below the flood line.',limit:150,steps:[grab('Steal a car on Mirador Mile'),reach([93,43],'Deliver the tide ledger to Pier Nine','deliver')]},
 {name:'Carbon Copy',contact:3,line:'The audit van has a second ledger. Follow it close enough to read its radio burst.',limit:145,steps:[grab(),tail([45,2],'Tail the audit van · keep 6–32 m'),reach([-3,-44],'Relay the copied signal','deliver')]},
 {name:'Glass Sirens',contact:2,line:'They shut the sluice gates to sink our homes. Take the recording to the airstrip relay.',limit:165,steps:[grab(),alarm(4,'Run the blockade to Copper Quay',[0,-94]),evade]},
 {name:'Salt Receipts',contact:2,line:'A crew has the dock receipts. Get my stevedores out and bring back the manifest.',limit:185,steps:[reach([-48,-72],'Meet Paz at the loading bay'),raid([-48,-72],'Disarm the quay crew'),reach([-49,-94],'Recover the dock receipts','hold')]},
 {name:'Double Exposure',contact:3,line:'One master tape. Sol wants it on air. My buyer wants silence. Pick the city you can live with.',limit:130,steps:[reach([0,46],'Meet Lio under the hotel sign'),{kind:'choice',text:'Decide who gets the master tape'}]},
 {name:air?'Open Frequency':'Quiet Dividend',contact:air?1:3,line:air?'Get my antenna to the beach before they jam us. Every rooftop is listening.':'The buyer wants escrow at the pier. The blue courier will show you which locker.',limit:150,steps:air?[grab(),reach([96,3],'Deliver Sol’s antenna to the boardwalk','deliver'),reach([92,-44],'Align the transmitter','hold')]:[grab(),tail([48,48],'Chase the escrow courier','chase'),reach([96,3],'Collect the buyer’s deposit','hold')]},
 {name:'The Undertow',contact:2,line:'Take the payroll from their counting room. We built this port. Time it paid us back.',limit:190,steps:[raid([-48,-98],'Clear the counting-room guards'),reach([-49,-93],'Hold the vault circuit','hold'),alarm(3,'Move the payroll to Loma Verde',[-92,0]),evade]},
 {name:air?'Relay Rally':'Redline Run',contact:air?1:3,line:air?'Three transmitters. One clean lap. Light up the island.':'Three toll booths are watching. Make every gate before the accounts freeze.',limit:105,steps:[grab(),reach([48,96],'Gate 1 / 3 · Mirador','race'),reach([96,48],'Gate 2 / 3 · Saffron','race'),reach([48,-48],'Gate 3 / 3 · Quay','race')]},
 {name:air?'A City On Air':'Offshore Account',contact:air?1:3,line:air?'The last tower is live. Outrun their convoy and give the island its own voice.':'Your boat is waiting at the quay. Shake the escort. Your cut leaves with you.',limit:195,steps:[grab(),alarm(5,air?'Breach the broadcast cordon':'Break the harbor cordon',air?[0,-130]:[-96,-96]),evade,reach(air?[96,4]:[-152,-96],air?'Broadcast the evidence':'Transfer the final payment','hold')]}
 ];
}
export const ENDINGS={air:'Open Water · The tape goes live. Port Vela takes back its tide gates.',cash:'Private Shore · The buyer vanishes. Your offshore balance buys a one-way ticket.'};
