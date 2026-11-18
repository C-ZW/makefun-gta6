import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createInterface} from 'node:readline';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',headless:true,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});
await page.route('http://sunbreak.local/**',async route=>{const path=new URL(route.request().url()).pathname;try{const body=await readFile(resolve('game','.'+(path==='/'?'/index.html':path)));await route.fulfill({body,contentType:({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[extname(path)]||'text/html'});}catch{await route.fulfill({status:404,body:'missing'});}});
await page.goto('http://sunbreak.local/');await page.waitForTimeout(500);console.log('READY');
const state=()=>page.evaluate(()=>window.sunbreak.inspect());
async function drive(points){
 for(const [x,y] of points){let count=0;while(count++<650){const s=await state(),c=s.cars[s.car];if(!c)throw Error('No vehicle');const dx=x-c.x,dy=y-c.y,d=Math.hypot(dx,dy);if(d<36)break;const a=Math.atan2(dy,dx),err=Math.atan2(Math.sin(a-c.a),Math.cos(a-c.a));const speed=d<110?65:Math.abs(err)>.65?65:185;const wanted=[];if(c.speed<speed-8)wanted.push('w');if(c.speed>speed+10)wanted.push('s');if(err>.055)wanted.push('d');if(err<-.055)wanted.push('a');for(const k of ['w','s','a','d'])if(wanted.includes(k))await page.keyboard.down(k);else await page.keyboard.up(k);await page.waitForTimeout(65);}
  for(const k of ['w','s','a','d'])await page.keyboard.up(k);if(count>=650)throw Error('Route timed out '+x+','+y);
 }
 for(let i=0;i<80;i++){const s=await state(),c=s.cars[s.car];if(!c||Math.abs(c.speed)<5)break;await page.keyboard.down(c.speed>0?'s':'w');await page.waitForTimeout(50);await page.keyboard.up('s');await page.keyboard.up('w');}
}
for await(const line of createInterface({input:process.stdin})){try{const q=JSON.parse(line);if(q.click)await page.click(q.click);if(q.key)await page.keyboard.press(q.key);if(q.hold){for(const k of q.hold)await page.keyboard.down(k);await page.waitForTimeout(q.ms||1000);for(const k of q.hold)await page.keyboard.up(k);}if(q.wait)await page.waitForTimeout(q.wait);if(q.drive)await drive(q.drive);if(q.aim){const p=await page.evaluate(([x,y])=>window.sunbreak.project(x,y),q.aim);await page.mouse.move(p.x,p.y);if(q.fire){await page.mouse.down();await page.waitForTimeout(q.fire);await page.mouse.up();}}if(q.shot)await page.screenshot({path:q.shot,type:'jpeg',quality:83});if(q.reload)await page.reload();if(q.state){const s=await state();console.log(JSON.stringify({player:s.player,car:s.car,vehicle:s.car!==null?s.cars[s.car]:null,stage:s.stage,branch:s.branch,health:s.health,money:s.money,police:s.police,completed:s.completed,errors}));}if(q.quit){await browser.close();break;}console.log('DONE');}catch(e){console.log('FAIL',e.message);}}
