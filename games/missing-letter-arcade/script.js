import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const canvas = $('game');
const WORDS = [
['capture','To catch or take hold of something'],['change','To make or become different'],['warm','A little hot; not cold'],['hare','An animal like a rabbit'],['goal','A target in a game'],['goalie','The player who guards the goal'],['leader','A person who guides a group'],['stands','Seats for a crowd at a game'],['aboard','On or inside a ship, train, or plane'],['conductor','A person who leads an orchestra or checks train tickets'],['fancy','Decorative or special'],['space','The area beyond Earth'],['fluffy','Soft and full of fluff'],['cozy','Warm, comfortable, and snug'],['sunny','Bright with sunshine'],['snowy','Covered with or full of snow'],['agree','To have the same opinion'],['clubhouse','A building used by a club or team'],['decorate','To make something look pretty'],['measure','To find the size or amount of something'],['hail','Small balls of ice that fall from clouds'],['lightning','A bright flash in a storm'],['thunder','The loud sound during a storm'],['tornado','A powerful spinning column of air'],['bony','Very thin, with bones easy to see'],['stretch','To make your body or arms longer'],['stand up','To rise to your feet'],['vacuum cleaner','A machine that cleans floors'],['lovely','Very nice or beautiful'],['sturdy','Strong and not easy to break'],['cheery','Happy and cheerful'],['creative','Good at making new things']
];
let scene,camera,renderer,player,clock,roadTiles=[],rails=[],coins=[],obstacles=[],decor=[],lane=1,score=0,qIndex=0,questions=[],running=false,paused=false,gameOver=false,velocity=24,jumpY=0,jumpV=0,slideTimer=0,spawnTimer=0,coinCount=0, soundOn=true, frame=0;
const laneX=[-2.25,0,2.25];
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mats={rail:mat('#d5e4ee',.35,.65),sleep:mat('#7b8f9d'),road:mat('#334a60'),edge:mat('#536b7f'),gold:mat('#ffd43b',.3,.45),blue:mat('#22c6bb'),shirt:mat('#12b9ad'),pants:mat('#243b74'),skin:mat('#f1bd91'),hair:mat('#402b27'),shoe:mat('#ff6e53'),window:mat('#183c59',.3),white:mat('#f5fbff'),red:mat('#ff7d68')};
function box(w,h,d,material,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#8edcff');scene.fog=new THREE.Fog('#8edcff',35,115);
 camera=new THREE.PerspectiveCamera(60,1,.1,180);camera.position.set(0,6.3,12.5);camera.lookAt(0,1.1,-12);
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene.add(new THREE.HemisphereLight('#eafaff','#32435b',2.1));const sun=new THREE.DirectionalLight('#fff2d2',3);sun.position.set(-7,15,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
 const ground=box(24,.4,180,mats.road,0,-.38,-48);scene.add(ground);
 for(let i=0;i<3;i++){const rail=box(.11,.16,170,mats.rail,laneX[i]-1.05,.03,-48);scene.add(rail);rails.push(rail);const rail2=box(.11,.16,170,mats.rail,laneX[i]+1.05,.03,-48);scene.add(rail2);rails.push(rail2)}
 for(let i=0;i<28;i++){const sleeper=box(7.3,.12,.22,mats.sleep,0,-.12,8-i*4.5);scene.add(sleeper);roadTiles.push(sleeper)}
 makeCity();player=makeRunner();scene.add(player);resize();window.addEventListener('resize',resize);clock=new THREE.Clock();renderer.setAnimationLoop(animate);
}
function makeCity(){
 const buildingMats=['#6b9dbb','#86b5cc','#527f9d','#a5c9d8'].map(c=>mat(c));
 for(let side of [-1,1])for(let i=0;i<24;i++){let h=3+Math.random()*9,w=1.2+Math.random()*1.5,d=1.5+Math.random()*2;const b=box(w,h,d,buildingMats[i%buildingMats.length],side*(7+Math.random()*7),h/2-0.2,-i*5-8);scene.add(b);decor.push(b);for(let yy=1;yy<h-.6;yy+=1.3)for(let xx=-w/2+.25;xx<w/2-.1;xx+=.55){const win=box(.18,.28,.035,mats.white,b.position.x+xx,yy,b.position.z+d/2+.02);scene.add(win);decor.push(win)}}
}
function makeRunner(){
 const g=new THREE.Group();
 const torso=box(.8,1,.42,mats.shirt,0,1.25,0);torso.geometry=new THREE.BoxGeometry(.8,1,.42);g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),mats.skin);head.position.set(0,2.05,0);head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,16,10,0,Math.PI*2,0,Math.PI*.55),mats.hair);hair.position.set(0,2.15,-.015);hair.castShadow=true;g.add(hair);
 const cap=box(.78,.12,.5,mat('#ffcc45'),0,2.25,.03);g.add(cap);const brim=box(.48,.07,.35,mat('#f6b92f'),.2,2.2,.22);g.add(brim);
 const eyeMat=mat('#172d43');for(let x of [-.12,.12]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),eyeMat);eye.position.set(x,2.08,.31);g.add(eye)}
 const legL=box(.25,.65,.28,mats.pants,-.22,.42,0),legR=box(.25,.65,.28,mats.pants,.22,.42,0);g.add(legL,legR);
 const shoeL=box(.38,.17,.48,mats.shoe,-.24,.12,.1),shoeR=box(.38,.17,.48,mats.shoe,.24,.12,.1);g.add(shoeL,shoeR);
 const armL=box(.22,.72,.24,mats.skin,-.55,1.27,0),armR=box(.22,.72,.24,mats.skin,.55,1.27,0);armL.rotation.z=-.3;armR.rotation.z=.3;g.add(armL,armR);
 g.userData={legL,legR,armL,armR,torso};g.position.set(0,0,3);return g;
}
function train(laneIndex,z){
 const g=new THREE.Group(),base=box(1.8,2.7,7,mat(['#ffc64c','#1db9b1','#f47c69'][Math.floor(Math.random()*3)]),0,1.35,0);g.add(base);
 const front=box(1.45,1.0,.08,mat('#d7f4ff'),0,1.95,3.54);g.add(front);
 for(let x of [-.55,.55]){g.add(box(.45,.65,.08,mats.window,x,1.9,3.6));const light=box(.22,.18,.1,mats.gold,x, .35,3.62);g.add(light)}
 g.position.set(laneX[laneIndex],0,z);g.userData={kind:'train',lane:laneIndex};scene.add(g);obstacles.push(g);
}
function barrier(laneIndex,z){
 const g=new THREE.Group();g.add(box(1.65,.8,.35,mat('#ff805f'),0,.75,0));g.add(box(1.8,.14,.4,mat('#fff0ca'),0,1.08,0));g.position.set(laneX[laneIndex],0,z);g.userData={kind:'barrier',lane:laneIndex};scene.add(g);obstacles.push(g);
}
function coin(laneIndex,z){
 const g=new THREE.Group();const gold=new THREE.Mesh(new THREE.TorusGeometry(.38,.12,10,24),mats.gold);gold.rotation.y=Math.PI/2;g.add(gold);const star=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),mat('#fff4a6'));g.add(star);g.position.set(laneX[laneIndex],1.35,z);g.userData={lane:laneIndex};scene.add(g);coins.push(g);
}
function spawn(){
 const l=Math.floor(Math.random()*3),z=-78-Math.random()*12,r=Math.random();
 if(r<.22)train(l,z);else if(r<.43)barrier(l,z);
 for(let i=0;i<3;i++)coin(Math.random()<.65?l:Math.floor(Math.random()*3),z-7-i*3);
}
function resize(){if(!renderer)return;const w=canvas.clientWidth||600,h=Math.max(350,Math.min(720,w*1.08));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function reset(){
 lane=1;score=0;qIndex=0;coinCount=0;velocity=24;spawnTimer=1;running=false;paused=false;gameOver=false;jumpY=0;jumpV=0;slideTimer=0;questions=WORDS.slice().sort(()=>Math.random()-.5).slice(0,10).map(([word,hint])=>({word,hint}));
 for(const o of [...coins,...obstacles])scene.remove(o);coins=[];obstacles=[];player.position.set(0,0,3);$('score').textContent='0000';$('progress').textContent='0 / 10';$('orbs').textContent='10';$('lives').textContent='3';$('startScreen').hidden=false;$('questionModal').hidden=true;$('result').hidden=true;
 for(let i=0;i<8;i++)coin(Math.floor(Math.random()*3),-15-i*8);drawOnce();
}
function start(){running=true;paused=false;gameOver=false;$('startScreen').hidden=true;clock.getDelta()}
function move(dir){
 if(!running||paused||gameOver)return;
 if(dir==='left')lane=Math.max(0,lane-1);if(dir==='right')lane=Math.min(2,lane+1);
 if(dir==='up'&&jumpY<=0.02){jumpV=9.2;slideTimer=0}
 if(dir==='down'){slideTimer=.72;jumpV=0;jumpY=0}
}
function animate(){
 if(!renderer)return;const dt=Math.min(clock.getDelta(),.04);frame+=dt;
 if(running&&!paused&&!gameOver){
  player.position.x=THREE.MathUtils.damp(player.position.x,laneX[lane],12,dt);
  if(jumpV!==0||jumpY>0){jumpY+=jumpV*dt;jumpV-=24*dt;if(jumpY<0){jumpY=0;jumpV=0}}
  if(slideTimer>0)slideTimer-=dt;
  player.position.y=jumpY+(slideTimer>0?-.22:0);
  const u=player.userData;u.legL.rotation.x=Math.sin(frame*13)*.65;u.legR.rotation.x=-Math.sin(frame*13)*.65;u.armL.rotation.x=-Math.sin(frame*13)*.55;u.armR.rotation.x=Math.sin(frame*13)*.55;u.torso.scale.y=slideTimer>0?.65:1;
  spawnTimer-=dt;if(spawnTimer<=0){spawn();spawnTimer=1.1+Math.random()*.65;velocity=Math.min(32,velocity+.025)}
  for(const o of [...coins]){o.position.z+=velocity*dt;o.rotation.y+=dt*2.8;if(o.position.z>1.9&&o.position.z<4.6&&Math.abs(o.position.x-player.position.x)<.95&&Math.abs(player.position.y)<.65){scene.remove(o);coins.splice(coins.indexOf(o),1);score+=10;coinCount++;$('score').textContent=String(score).padStart(4,'0');if(coinCount>=3&&qIndex<10){coinCount=0;showQuestion()}}else if(o.position.z>12){scene.remove(o);coins.splice(coins.indexOf(o),1)}}
  for(const o of [...obstacles]){o.position.z+=velocity*dt;if(o.position.z>1.8&&o.position.z<4.3&&Math.abs(o.position.x-player.position.x)<1.05){const kind=o.userData.kind,cleared=kind==='barrier'?(jumpY>.75||slideTimer>0):jumpY>2.2;if(!cleared){endGame('Oops! You bumped into an obstacle. Try again!');break}else{score+=25;$('score').textContent=String(score).padStart(4,'0');scene.remove(o);obstacles.splice(obstacles.indexOf(o),1)}}else if(o.position.z>12){scene.remove(o);obstacles.splice(obstacles.indexOf(o),1)}}
  for(const s of roadTiles){s.position.z+=velocity*dt;if(s.position.z>12)s.position.z-=28*4.5}
  for(const r of rails){r.position.z= -48}
 }
 camera.position.x=THREE.MathUtils.damp(camera.position.x,player?player.position.x*.22:0,3,dt);camera.lookAt(player?player.position.x*.12:0,1.3,-12);
 renderer.render(scene,camera);
}
function drawOnce(){if(renderer)renderer.render(scene,camera)}
function showQuestion(){
 paused=true;const item=questions[qIndex];if(!item){finish();return}
 const indexes=[...item.word].map((c,i)=>/[a-z]/i.test(c)?i:-1).filter(i=>i>=0);item.missing=indexes[Math.floor(Math.random()*indexes.length)];item.answer=item.word[item.missing];
 $('qCount').textContent='QUESTION '+(qIndex+1)+' / 10';$('word').textContent='';
 [...item.word].forEach((c,i)=>{const span=document.createElement('span');span.className='letter'+(i===item.missing?' missing':'');span.textContent=i===item.missing?'_':c===' '?' ':c;$('word').appendChild(span)});
 $('hint').textContent=item.hint;$('feedback').textContent='Choose the missing letter!';$('feedback').className='feedback';
 const letters='abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>c!==item.answer),opts=[item.answer,...letters.sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
 $('choices').innerHTML=opts.map(c=>'<button type="button" class="choice" data-letter="'+c+'">'+c+'</button>').join('');
 $('choices').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.letter,b),{once:true}));$('questionModal').hidden=false;
}
function answer(letter,button){
 if(!paused)return;const item=questions[qIndex],correct=letter===item.answer;
 $('choices').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.letter===item.answer)b.classList.add('correct')});if(!correct)button.classList.add('wrong');
 $('feedback').textContent=correct?'✓ Correct! Keep running!':'The answer is '+item.answer+'. Keep trying!';$('feedback').className='feedback '+(correct?'good':'bad');if(correct)score+=100;$('score').textContent=String(score).padStart(4,'0');qIndex++;$('progress').textContent=qIndex+' / 10';$('orbs').textContent=String(10-qIndex);
 setTimeout(()=>{$('questionModal').hidden=true;if(qIndex>=10)finish();else paused=false},850);
}
function finish(){running=false;paused=true;$('resultText').textContent='You completed all 10 word challenges and scored '+score+' points. Amazing running!';$('result').hidden=false}
function endGame(message){running=false;gameOver=true;$('resultText').textContent=message+' Your score: '+score+'.';$('result').hidden=false}
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),m={arrowleft:'left',a:'left',arrowright:'right',d:'right',arrowup:'up',w:'up',arrowdown:'down',s:'down',' ':'up'};if(m[k]){e.preventDefault();move(m[k])}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
let touch=null;canvas.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>18)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy<0?'up':'down'))},{passive:true});
$('startBtn').addEventListener('click',start);$('again').addEventListener('click',reset);$('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'🔊':'🔇'});
window.addEventListener('error',()=>{const s=$('startScreen');s.hidden=false;s.querySelector('h2').textContent='GAME ERROR';s.querySelector('p').textContent='Please reload the game and try again.'});
init();reset();
