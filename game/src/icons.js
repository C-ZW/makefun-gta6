export function icon(name,size=18){
 const paths={
  sun:'<path d="M3 14a9 9 0 0 1 18 0Z" fill="currentColor" stroke="none"/><path d="M3 17h18M6 20h12"/>',
  wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="m4 8 6 3m4 0 6-3m-8 6v7"/>',
  radio:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M5 7 17 2m-10 9h4m-4 4h3"/><circle cx="16" cy="14" r="2.4"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  gun:'<path d="M2 7h20v5H11l-3 6H4l1.5-7H2Z" fill="currentColor" stroke="none"/><path d="M12 12v3H9"/>',
  cross:'<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7Z" fill="currentColor" stroke="none"/>',
  shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10s-8-5-8-10V6Z"/><path d="M12 6v11"/>',
  case:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12c4 3 14 3 18 0"/>',
  bolt:'<path d="m14 1-11 13h8l-1 9 11-14h-8Z" fill="currentColor" stroke="none"/>',
  arrow:'<path d="M3 12h17m-7-7 7 7-7 7"/>',book:'<path d="M4 3h14a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V5Z"/><path d="M7 3v18m3-13h7m-7 4h7"/>',
  tower:'<path d="m7 21 5-16 5 16m-8-6h6M4 8a8 8 0 0 1 3-6m13 6a8 8 0 0 0-3-6"/>',
  car:'<path d="m3 12 3-6h11l4 6v6H3Zm1 0h16M6 18v2m12-2v2"/>',
  heli:'<path d="M2 10h4l3 4h9a3 3 0 0 0 0-6h-7l-3 3M14 8V4M6 4h16M9 18h11"/>',
  badge:'<path d="m12 2 3 6 6 1-4.5 5 1 7-5.5-3-5.5 3 1-7L3 9l6-1Z"/>',
  flag:'<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
  tape:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/><path d="M9 12h6m-9 6 2-3h8l2 3"/>'
 };
 return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.sun)+'</svg>';
}
