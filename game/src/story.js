export const chapters = ['A Favor at Low Tide','The Lease Beneath the Lease','The Price of Land'];
export const storyChoice = [
  {key:'Digit1', id:'broadcast', name:'Go public', description:'Give Tess the deed. Put every fraudulent lease on coastal radio.'},
  {key:'Digit2', id:'bargain', name:'Take the deal', description:'Trade Quill the original deed for title to the Boathouse.'}
];

export const endings = {
  broadcast:{title:'The coast heard you',text:'Tess read every address on the air. Seventeen eviction notices were withdrawn. The Boathouse is a co-op again, and there’s a spare set of keys behind Nera’s counter.'},
  bargain:{title:'The keys are yours',text:'Quill signed. The Boathouse is yours, but the other notices stayed up. Tess doesn’t call anymore. At low tide, you can hear the empty slips knocking against the sea wall.'}
};

export const campaign = [
  {
    id:'first-light', name:'First Light', chapter:0, contact:'nera', start:[175,53], cash:580,
    line:'The co-op’s last crate missed the noon ferry. Take my Gull van, get it to Tess. She’ll explain.',
    stages:[
      {type:'vehicle',vehicle:'gull',at:[166.8,129.2],title:'Take Nera’s Gull Cargo',hint:'E to enter the delivery van'},
      {type:'drive',at:[90,155],title:'Deliver the sealed crate',hint:'Unload at the Gullworks gate',limit:85,vehicle:'gull',arrival:8},
      {type:'interact',at:[90,155],title:'Hand the manifest to Tess',hint:'On foot · F to meet Tess'}
    ]
  },
  {
    id:'loose-ends',name:'Loose Ends',chapter:0,contact:'tess',start:[90,155],cash:700,
    line:'That crate carried eviction papers, not engine parts. The slate pickup is Quill’s. Follow it and find out where he files the originals.',
    stages:[
      {type:'vehicle',at:[76.8,143],title:'Get a set of wheels',hint:'Any running vehicle will do'},
      {type:'tail',at:[82,134],title:'Tail Quill’s runner',hint:'Stay 9–58 m back',limit:70,route:[[82,134],[82,82],[82,2],[11,2]]},
      {type:'interact',at:[11,-9],title:'Take the runner’s discarded pass',hint:'On foot · F to collect'}
    ]
  },
  {
    id:'cutwater',name:'Cutwater Run',chapter:0,contact:'nera',start:[11,-9],cash:820,
    line:'That pass expires in one minute. Hit the strand gates before Quill’s office gets the cancellation.',
    stages:[
      {type:'vehicle',at:[4,7],title:'Find a getaway car',hint:'Any street vehicle'},
      {type:'checkpoints',at:[78,2],title:'Beat the gate lockout',hint:'Stay in your vehicle',limit:78,route:[[78,2],[160,2],[160,-65],[160,-125],[160,-156]]}
    ]
  },
  {
    id:'open-ledger',name:'Open Ledger',chapter:1,contact:'tess',start:[153,-149],cash:1060,
    line:'He filed our deeds through a private dock crew. I hid a pistol at Juniper Park. Grab it before their sweep gets there.',
    stages:[
      {type:'interact',at:[42,-66],title:'Collect Tess’s pistol',hint:'On foot · F at the park cache',grant:'pistol'},
      {type:'fight',at:[40,-38],title:'Hold the park against Quill’s crew',hint:'Use the fountain for cover',limit:115,foes:4}
    ]
  },
  {
    id:'the-deed',name:'The Deed',chapter:1,contact:'nera',start:[40,-48],cash:1420,
    line:'The paper in his till has every address he stole. Lift the original from the Mako yard before he burns it.',
    stages:[
      {type:'interact',at:[151,59],title:'Crack the records lockbox',hint:'On foot · F to take the originals',limit:130,grant:'smg'},
      {type:'fight',at:[173,55],title:'Clear Quill’s dock crew',hint:'Protect the deed',limit:115,foes:4},
      {type:'choice',at:[176,49],title:'Decide who gets the deed',hint:'This decision changes the next jobs and the ending'}
    ]
  },
  {
    id:'undertow',chapter:1,contact:'nera',start:[176,49],cash:1860,
    routes:{
      broadcast:{name:'Signal Fire',line:'Quill called the Tideguard. Get this to Tess before his lawyers hit the transmitter.',stages:[
        {type:'vehicle',at:[165,96],title:'Take the getaway car',hint:'The Kestrel makes a fast exit'},
        {type:'escape',at:[163,26],title:'Lose the Tideguard',hint:'Break sight and outlast the search',heat:5,limit:145},
        {type:'interact',at:[175,-104],title:'Meet Tess at the seawall',hint:'On foot · F to hand over the deed'}
      ]},
      bargain:{name:'Quiet Leverage',line:'One original, one signed release. Keep it dry and get the Tideguard off your back before Quill’s meeting.',stages:[
        {type:'vehicle',at:[165,96],title:'Take the getaway car',hint:'The Kestrel makes a fast exit'},
        {type:'escape',at:[163,26],title:'Shake the escort',hint:'Break sight and outlast the search',heat:4,limit:145},
        {type:'interact',at:[153,155],title:'Check the quiet drop',hint:'On foot · F at Gullworks'}
      ]}
    }
  },
  {
    id:'low-water',name:'Low Water',chapter:2,contact:'tess',start:[153,155],cash:2000,
    line:'Quill’s dock foreman locked a witness inside the weigh station. Open it and make sure the crew can’t follow.',
    stages:[
      {type:'interact',at:[146,177],title:'Open the weigh station',hint:'On foot · F to cut the lock',grant:'shotgun'},
      {type:'fight',at:[145,179],title:'Protect the dock witness',hint:'Survive the Gullworks ambush',limit:120,foes:5},
      {type:'drive',at:[173,87],title:'Take the witness to the Strand',hint:'Any vehicle · stop by the promenade',limit:95,arrival:9}
    ]
  },
  {
    id:'crossing',chapter:2,contact:'tess',start:[174,87],cash:2460,
    routes:{
      broadcast:{name:'Open Frequency',line:'They cut the feed at the studio. The old ferry mast still works. I’ll transmit if you get the tape across.',stages:[
        {type:'checkpoints',at:[158,81],title:'Race the tape to West Reach',hint:'Vehicle required · hit each checkpoint',limit:110,route:[[159,80],[80,80],[0,80],[-81,80],[-159,80],[-159,0],[-255,1]]},
        {type:'interact',at:[-268,13],title:'Patch the tape into the ferry mast',hint:'On foot · F at West Reach'}
      ]},
      bargain:{name:'Buyout',line:'Quill’s courier has the signed title. He’s leaving the island. Catch him before he crosses the causeway.',stages:[
        {type:'chase',at:[158,80],title:'Catch Quill’s courier',hint:'Get within 5 m of the moving Pica',limit:90,route:[[154,83],[83,83],[3,83],[-77,83],[-157,83],[-157,3],[-258,3]]},
        {type:'interact',at:[-268,13],title:'Meet the title registrar',hint:'On foot · F at West Reach'}
      ]}
    }
  },
  {
    id:'aftertide',chapter:2,contact:'nera',start:[-268,13],cash:3200,
    routes:{
      broadcast:{name:'After the Sirens',line:'The whole island heard it. Tideguard is protecting Quill anyway. Get back to the people at the co-op.',stages:[
        {type:'escape',at:[-243,0],title:'Outrun the last patrol',hint:'Cross the causeway and shake the search',heat:3,limit:115},
        {type:'interact',at:[179,100],title:'Open the Boathouse',hint:'On foot · F to turn the key'}
      ]},
      bargain:{name:'Private Property',line:'Quill signed, then sent his own men for the deed. Bring that title home, Ren.',stages:[
        {type:'fight',at:[-263,15],title:'Hold the ferry landing',hint:'Defend the signed title',limit:115,foes:5},
        {type:'interact',at:[179,100],title:'Take the keys to the Boathouse',hint:'On foot · F to turn the key'}
      ]}
    }
  }
];

export const sideJobs = [
  {id:'strand-sprint',name:'Strand Sprint',chapter:-1,contact:'nera',start:[153,-67],cash:930,
    line:'A straight run until the first corner. Try to keep the bumper on it.',
    stages:[{type:'checkpoints',at:[160,-80],title:'Sprint the Strand circuit',hint:'Vehicle required · clear five gates',limit:79,route:[[160,-80],[160,-160],[80,-160],[80,-80],[152,-80]]}]},
  {id:'last-ferry',name:'Last Ferry Express',chapter:-1,contact:'tess',start:[90,154],cash:730,
    line:'The ferry captain needs this package before the next horn. Take the short bridge.',
    stages:[{type:'drive',at:[-270,3],title:'Deliver to the last ferry',hint:'Vehicle required · West Reach ferry gate',limit:95,arrival:9}]}
];

export function resolveMission(mission,branch) {
  if(!mission?.routes) return mission;
  return {...mission,...mission.routes[branch||'broadcast']};
}
