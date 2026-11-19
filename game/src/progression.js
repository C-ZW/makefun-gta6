export const ranks = [
  {at:0,title:'Runner',perk:'Mako’s counter and street jobs'},
  {at:18,title:'Wheelhand',perk:'Lockjaw 9 unlocked'},
  {at:36,title:'Fixer',perk:'Breakwater 12 unlocked'},
  {at:72,title:'Harbor Hand',perk:'Free repairs and garage paint'},
  {at:108,title:'Tidebreaker',perk:'Armor refills at the Boathouse'},
  {at:150,title:'Bellcove Local',perk:'Highest street rank'}
];

export function respectRank(score) {
  const index=ranks.findLastIndex(rank=>score>=rank.at);
  return {current:ranks[index],next:ranks[index+1],index};
}
