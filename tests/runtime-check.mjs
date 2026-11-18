import assert from 'node:assert/strict';
const handlers=new Map(),elements=new Map(),saved=new Map();let drawCalls=0,nextFrame,now=performance.now();
const context=new Proxy({}, {get(t,k){if(k in t)return t[k];if(k==='createLinearGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Finite drawing coordinates');drawCalls++;};},set(t,k,v){t[k]=v;return true;}});
function element(key){if(!elements.has(key))elements.set(key,{width:1280,height:800,textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},getContext:()=>context,addEventListener:(name,cb)=>handlers.set(key+name,cb)});return elements.get(key);}
globalThis.document={querySelector:element,getElementById:k=>element('#'+k)};
globalThis.window=globalThis;globalThis.innerWidth=1280;globalThis.innerHeight=800;
globalThis.addEventListener=(name,cb)=>handlers.set(name,cb);
globalThis.requestAnimationFrame=cb=>{nextFrame=cb;};
globalThis.localStorage={setItem:(k,v)=>saved.set(k,v),getItem:k=>saved.get(k)};
globalThis.AudioContext=class {currentTime=0;destination={};resume(){}createOscillator(){return {frequency:{value:0},connect(){return this;},start(){},stop(){}};}createGain(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}};}};
await import('../game/src/game-loop.js');
function frames(n){for(let i=0;i<n;i++){now+=1000/60;nextFrame(now);}}
function press(key){handlers.get('keydown')({key,repeat:false,preventDefault(){}});handlers.get('keyup')({key});}
frames(1);assert(drawCalls>500,'Renderer executes');element('#start').onclick();press('f');assert(sunbreak.inspect().choosing);press('2');press('e');assert.equal(sunbreak.inspect().stage,'deliver');handlers.get('keydown')({key:'w',repeat:false,preventDefault(){}});frames(120);handlers.get('keyup')({key:'w'});press('k');const snapshot=sunbreak.inspect();assert(saved.size===1);frames(120);assert.notEqual(sunbreak.inspect().player.x,snapshot.player.x);
element('#start').onclick();press('Escape');element('#continue').onclick();const loaded=sunbreak.inspect();assert.equal(loaded.player.x,snapshot.player.x);assert.equal(loaded.branch,'sell');assert.equal(loaded.car,0);assert.equal(loaded.stage,'deliver');assert.deepEqual(loaded.police,snapshot.police);assert.equal(loaded.paused,false);frames(2);
press('Escape');const paused=sunbreak.inspect().time;frames(120);assert.equal(sunbreak.inspect().time,paused);
console.log('PASS: renderer smoke test, keyboard story selection, driving input, save/load state, pause. DOM/canvas mocks; not a browser render.');
