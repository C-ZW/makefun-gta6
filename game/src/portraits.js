export function contactPortrait(index){
 if(prints[index])return prints[index];const el=document.createElement('canvas');el.width=192;el.height=202;const c=el.getContext('2d');c.scale(2,2);
 const dark='#243e43',shade=['#aa6452','#9a6146','#8f5948','#aa6b53'][index],skin=['#eaa174','#cd9466','#d99a6e','#e3ab7d'][index],bg=['#dba456','#df9c62','#91c0a5','#e5b28b'][index];
 const poly=(points,color)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill()};
 const oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 c.fillStyle=bg;c.fillRect(0,0,96,101);oval(62,38,30,30,'#f4d59f');
 for(let j=0;j<13;j++){c.fillStyle='rgba(44,85,80,.15)';c.fillRect(0,50+j*3,96,1)}
 poly([[0,103],[9,83],[33,70],[38,62],[63,59],[69,72],[88,82],[99,103]],dark);
 poly([[34,72],[35,53],[59,53],[61,73],[50,86]],shade);
 poly([[29,32],[38,20],[62,18],[72,32],[69,45],[73,52],[68,54],[66,65],[56,72],[44,69],[36,62],[32,54],[28,51]],skin);
 poly([[29,35],[40,29],[44,33],[40,43],[42,52],[39,56],[45,66],[57,71],[48,72],[37,65],[31,54],[28,51]],shade);
 oval(32,48,4,6,skin);poly([[62,41],[60,52],[65,52],[68,50],[63,50]],shade);poly([[55,59],[65,57],[64,60],[60,61]],dark);
 poly([[43,41],[53,39],[55,41],[45,43]],dark);poly([[63,40],[69,39],[68,42],[63,42]],dark);
 if(index===1){for(let i=0;i<10;i++)oval(26+i*4.65,27-Math.sin(i/3)*6,6.3,7.2,dark);
  poly([[28,30],[39,29],[37,44],[31,45]],dark);poly([[38,53],[46,61],[55,63],[68,57],[65,66],[56,73],[45,69]],dark);
  poly([[36,41],[56,40],[58,43],[61,40],[72,39],[70,48],[62,49],[58,44],[53,49],[41,49]],'#1b4e53');poly([[42,43],[50,42],[44,47]],'#9fd3bf');
 }else if(index===2){poly([[26,37],[29,25],[39,17],[55,14],[67,22],[72,33],[61,28],[49,30],[39,37],[35,48],[28,47]],dark);poly([[29,29],[36,21],[57,18],[68,25],[73,33],[66,32],[60,26],[47,26]],'#e27051');oval(26,41,8,14,dark);oval(32,55,2,3,'#f7cf76')}
 else if(index===3){poly([[28,34],[27,25],[36,16],[58,14],[71,21],[73,30],[60,26],[48,28],[39,36],[36,46],[31,45]],dark);c.strokeStyle=dark;c.lineWidth=1.6;c.strokeRect(42,40,13,8);c.strokeRect(60,39,11,8);c.beginPath();c.moveTo(55,43);c.lineTo(60,42);c.stroke()}
 else{oval(28,30,10,13,dark);poly([[27,36],[32,23],[45,16],[61,19],[69,26],[69,31],[58,27],[49,30],[38,41],[32,52]],dark)}
 const coat=['#2b8279','#d47951','#378276','#c7b292'][index];
 poly([[3,101],[15,82],[33,73],[41,82],[50,88],[58,77],[64,70],[82,81],[94,101]],coat);
 poly([[34,70],[50,86],[41,92],[31,77]],'#f2cd93');poly([[63,69],[66,77],[54,91],[50,86]],'#e9b782');
 for(let y=0;y<101;y+=3)for(let x=y%2;x<96;x+=3){c.fillStyle='rgba(40,40,32,.075)';c.fillRect(x,y,.75,.75)}
 prints[index]=el.toDataURL();return prints[index];
}
const prints=[];
