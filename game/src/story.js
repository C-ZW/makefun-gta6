import {landmarks,distance} from './district.js';
import {radio,reportCrime} from './police-pursuit.js';
import {tone} from './sound.js';
export function objective(s){if(s.stage==='meet')return 'Meet Ivo at the gold marker. Press F to talk.';if(s.stage==='steal')return 'Steal the marked Cormorant van. E near its door.';if(s.stage==='deliver')return s.branch==='broadcast'?'Take the tape to Radio Pelican. F at the gold antenna.':'Take the tape to Sable at the marina. F at the gold anchor.';if(s.stage==='escape')return 'Break police sight. Turn behind a block, then stay hidden.';return 'Free roam · garage repairs $100 · steal, explore, survive.';}
export function target(s){if(s.stage==='meet')return landmarks.contact;if(s.stage==='steal')return s.cars[0];if(s.stage==='deliver')return landmarks[s.branch];if(s.stage==='done')return landmarks.garage;return null;}
export function chooseBranch(s,branch){s.branch=branch;s.stage='steal';s.choosing=false;document.querySelector('#choice').classList.add('hidden');radio(s,branch==='broadcast'?'IVO / Pelican is northeast. Bring the van; the tape is locked inside.':'IVO / Sable is southeast at the marina. Cash buys silence, not safety.');}
export function interact(s){
 if(s.stage==='meet'&&distance(s.player,landmarks.contact)<100){s.choosing=true;document.querySelector('#choice').classList.remove('hidden');return;}
 if(s.stage==='deliver'&&distance(s.player,landmarks[s.branch])<105){
  if(s.car!==s.cars[0]){radio(s,'The tape is still in the Cormorant. Bring the marked van.');return;}
  s.delivered=true;s.stage='escape';s.money+=s.branch==='broadcast'?600:1800;
  if(s.branch==='sell'){reportCrime(s,2);s.roadblocks=true;radio(s,'SABLE / Money sent. Bad news: I sold your plate too. Barricades are up.');}
  else radio(s,'PELICAN / You are live, South Quay! Green courtyards will hide you on foot. Searches now last 9 seconds.');
  tone(880,.5);return;
 }
 if(distance(s.player,landmarks.garage)<90&&s.police.wanted===0){if(s.money>=100){s.money-=100;s.health=100;if(s.car)s.car.hp=100;radio(s,'QUAY CUSTOMS / Patched up. You look brand new.');}else radio(s,'QUAY CUSTOMS / Repairs cost $100.');}
}
export function updateStory(s){if(s.stage==='escape'&&s.police.mode==='clear'){s.stage='done';s.completed=s.branch;radio(s,s.branch==='broadcast'?'DEAD AIR / COMPLETE — The harbor heard the truth. Courtyards remain open. Free roam unlocked.':'DEAD AIR / COMPLETE — You bought your freedom. The city paid the price. Free roam unlocked.');}}
