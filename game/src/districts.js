export const districts = [
  { name:'Glassmarket', subtitle:'OFFICES · NIGHT MARKET', color:'#b5acda', x:-48,z:60 },
  { name:'Marigold Strand', subtitle:'CORNICHE · BEACH CLUBS', color:'#ffc37f', x:160,z:80 },
  { name:'Gullworks', subtitle:'FREIGHT · CONTAINER YARD', color:'#fa886e', x:40,z:170 },
  { name:'Juniper Heights', subtitle:'VILLAS · SIGNAL HILL', color:'#bccd91', x:-40,z:-170 },
  { name:'West Reach', subtitle:'FERRY · WETLANDS', color:'#7cdddd', x:-256,z:0 }
];

export const avenues = [-160,-80,0,80,160];
export const streets = [-240,-160,-80,0,80,160,240];
export const land = {left:-199,right:182,top:-263,bottom:261};
export const signposts = {
  safe: {x:179,z:100,name:'Boathouse'},
  shop: {x:145,z:63,name:'Mako Motor & Supply'},
  race: {x:153,z:-67,name:'Strand Sprint'},
  courier: {x:90,z:154,name:'Last Ferry Express'}
};

export function districtAt(x,z) {
  if (x < -205) return districts[4];
  if (z > 128) return districts[2];
  if (z < -115) return districts[3];
  return x > 104 ? districts[1] : districts[0];
}

export const blockEdges = [-199,...avenues,182];
export const rowEdges = [-263,...streets,261];
