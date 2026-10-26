'use strict';
const WORDS=[
['goal','A target in a game'],['goalie','The player who guards the goal'],['leader','A person who guides a group'],['stands','Seats for a crowd at a game'],['aboard','On or inside a ship, train, or plane'],['conductor','A person who leads an orchestra or checks train tickets'],['fancy','Decorative or special'],['space','The area beyond Earth'],['fluffy','Soft and full of fluff'],['cozy','Warm, comfortable, and snug'],['sunny','Bright with sunshine'],['snowy','Covered with or full of snow'],['agree','To have the same opinion'],['clubhouse','A building used by a club or team'],['decorate','To make something look pretty'],['measure','To find the size or amount of something'],['hail','Small balls of ice that fall from clouds'],['lightning','A bright flash in a storm'],['thunder','The loud sound during a storm'],['tornado','A powerful spinning column of air'],
['bony','Very thin, with bones easy to see'],['stretch','To make your body or arms longer'],['stand up','To rise to your feet'],['vacuum cleaner','A machine that cleans floors'],['lovely','Very nice or beautiful'],['sturdy','Strong and not easy to break'],['cheery','Happy and cheerful'],['creative','Good at making new things']
];
const $=id=>document.getElementById(id);
const canvas=$('game');
const ctx=canvas.getContext('2d');
let lane=1, target=null, qIndex=0, score=0, running=false, paused=false, soundOn=true, actionCount=0, questions=[];
const LANES=[0,1,2];
function shuffle(a){return a.slice().sort(()=>Math.random()-.5)}
function pickLane(){return Math.floor(Math.random()*3)}
function resize(){
 const width=Math.max(280,Math.min(620,canvas.parentElement.clientWidth-4));
 canvas.width=width;
 canvas.height=Math.round(width*1.12);
 draw();
}
function starPath(x,y,r){
 ctx.beginPath();
 for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2===0?r:r*.45;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}
 ctx.closePath();
}
function draw(){
 if(!ctx)return;
 const w=canvas.width,h=canvas.height,hor=h*.24;
 // bright sky and soft clouds
 const sky=ctx.createLinearGradient(0,0,0,hor);sky.addColorStop(0,'#58c8ff');sky.addColorStop(1,'#e3f8ff');ctx.fillStyle=sky;ctx.fillRect(0,0,w,hor);
 ctx.fillStyle='#ffffffb8';
 [[.12,.09,.07],[.34,.13,.05],[.78,.08,.08],[.9,.16,.045]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(w*x,h*y,w*r,0,Math.PI*2);ctx.arc(w*(x+.035),h*(y-.012),w*r*.75,0,Math.PI*2);ctx.arc(w*(x+.065),h*y,w*r*.62,0,Math.PI*2);ctx.fill()});
 // city buildings
 for(let i=0;i<13;i++){const bw=w*(.045+(i%3)*.014),bh=h*(.08+(i%4)*.025),x=i*w/12-bw/2;ctx.fillStyle=['#72a6c5','#8db8d0','#5e91b5'][i%3];ctx.fillRect(x,hor-bh,bw,bh);ctx.fillStyle='#d9f4ff';for(let yy=hor-bh+5;yy<hor-3;yy+=10)for(let xx=x+4;xx<x+bw-3;xx+=9)ctx.fillRect(xx,yy,3,4)}
 // subway tunnel/ground perspective
 const ground=ctx.createLinearGradient(0,hor,0,h);ground.addColorStop(0,'#6b8494');ground.addColorStop(.42,'#3b596d');ground.addColorStop(1,'#182c42');ctx.fillStyle=ground;ctx.beginPath();ctx.moveTo(w*.32,hor);ctx.lineTo(w*.68,hor);ctx.lineTo(w*1.12,h);ctx.lineTo(-w*.12,h);ctx.closePath();ctx.fill();
 // sleepers, rails, lane lines
 for(let i=0;i<17;i++){const t=(i/17)+.02,y=hor+(h-hor)*t*t,half=w*(.18+t*.48);ctx.strokeStyle='#a8bac4';ctx.lineWidth=1+t*2;ctx.beginPath();ctx.moveTo(w/2-half,y);ctx.lineTo(w/2+half,y);ctx.stroke()}
 for(let i=0;i<4;i++){const tx=w*(.32+i*.12),bx=w*(-.12+i*.413);ctx.strokeStyle=i===0||i===3?'#e5edf2':'#d0e0e8';ctx.lineWidth=Math.max(2,w*.01);ctx.beginPath();ctx.moveTo(tx,hor);ctx.lineTo(bx,h);ctx.stroke()}
 // colorful side trains
 const trainY=hor+5,trainH=h*.31;
 ctx.fillStyle='#ffca4d';ctx.beginPath();ctx.moveTo(0,trainY);ctx.lineTo(w*.16,trainY+8);ctx.lineTo(w*.24,trainY+trainH);ctx.lineTo(0,trainY+trainH*.8);ctx.closePath();ctx.fill();
 ctx.fillStyle='#19b9b0';ctx.beginPath();ctx.moveTo(w,trainY);ctx.lineTo(w*.84,trainY+8);ctx.lineTo(w*.76,trainY+trainH);ctx.lineTo(w,trainY+trainH*.8);ctx.closePath();ctx.fill();
 for(let i=0;i<2;i++){ctx.fillStyle='#183b5b';ctx.fillRect(w*.025+i*w*.07,trainY+20,w*.045,h*.07);ctx.fillRect(w*.93-i*w*.07,trainY+20,w*.045,h*.07)}
 // target star moves only when player presses a control
 if(target&&!target.collected){
  const t=target.z,x=w*(.5+(target.lane-1)*(.09+t*.2)),y=hor+(h-hor)*t*t,r=w*(.025+t*.035);
  ctx.save();ctx.shadowColor='#fff28a';ctx.shadowBlur=14;starPath(x,y,r);ctx.fillStyle='#ffda43';ctx.fill();ctx.restore();ctx.strokeStyle='#fff4b2';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='900 '+Math.max(10,r*.85)+'px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText('★',x,y+r*.3);
 }
 drawRunner(w*.5+(lane-1)*w*.2,h*.79,w/360);
 // small instruction strip
 ctx.fillStyle='#0c2139cc';ctx.fillRect(8,8,w-16,28);ctx.fillStyle='#fff';ctx.font='800 '+Math.max(10,w*.027)+'px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText('TAP TO MOVE  •  COLLECT THE GOLD STAR',w/2,27);
}
function drawRunner(x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 ctx.fillStyle='#102c4666';ctx.beginPath();ctx.ellipse(0,31,22,7,0,0,Math.PI*2);ctx.fill();
 // legs and trainers
 ctx.strokeStyle='#243d74';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,7);ctx.lineTo(-12,23);ctx.moveTo(6,7);ctx.lineTo(12,23);ctx.stroke();
 ctx.strokeStyle='#ff704f';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-14,24);ctx.lineTo(-4,24);ctx.moveTo(9,24);ctx.lineTo(18,24);ctx.stroke();
 // hoodie and arms
 ctx.fillStyle='#17bdb2';ctx.beginPath();ctx.roundRect(-14,-17,28,29,8);ctx.fill();
 ctx.strokeStyle='#f2bd91';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-12,-10);ctx.lineTo(-21,0);ctx.moveTo(12,-10);ctx.lineTo(21,-2);ctx.stroke();
 // face
 ctx.fillStyle='#f2bd91';ctx.beginPath();ctx.arc(0,-27,13,0,Math.PI*2);ctx.fill();
 // hair and cap
 ctx.fillStyle='#493025';ctx.beginPath();ctx.arc(0,-31,13,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ffcf43';ctx.beginPath();ctx.roundRect(-14,-34,28,6,3);ctx.fill();ctx.fillRect(4,-32,14,4);
 ctx.fillStyle='#24364c';ctx.beginPath();ctx.arc(4,-27,1.5,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function createTarget(){target={lane:pickLane(),z:.12,collected:false}}
function setup(){
 running=false;paused=false;lane=1;actionCount=0;questions=shuffle(WORDS).slice(0,10).map(([word,hint])=>({word,hint}));qIndex=0;score=0;createTarget();
 $('score').textContent='0000';$('progress').textContent='0 / 10';$('orbs').textContent='10';$('lives').textContent='3';$('startScreen').hidden=false;$('questionModal').hidden=true;$('result').hidden=true;resize();
}
function startGame(){running=true;paused=false;$('startScreen').hidden=true;draw()}
function move(dir){
 if(!running||paused)return;
 if(dir==='left')lane=Math.max(0,lane-1);
 if(dir==='right')lane=Math.min(2,lane+1);
 // Forward/back controls advance the runner's target only after a real input.
 if(dir==='up'||dir==='down'||dir==='left'||dir==='right'){
  actionCount++;target.z=Math.min(1,target.z+.105);
  if(target.z>=.84){
   if(target.lane===lane){target.collected=true;draw();showQuestion();return}
   target.z=.14;target.lane=pickLane();
  }
 }
 draw();
}
function showQuestion(){
 paused=true;const item=questions[qIndex];if(!item){finish();return}
 const indexes=[...item.word].map((c,i)=>/[a-z]/i.test(c)?i:-1).filter(i=>i>=0);
 item.missing=indexes[Math.floor(Math.random()*indexes.length)];item.answer=item.word[item.missing];
 $('qCount').textContent='QUESTION '+(qIndex+1)+' / 10';
 $('word').innerHTML=[...item.word].map((c,i)=>'<span class="letter '+(i===item.missing?'missing':'')+'">'+(i===item.missing?'_':c===' '?' ':c)+'</span>').join('');
 $('hint').textContent=item.hint;$('feedback').textContent='Choose the missing letter!';$('feedback').className='feedback';
 const letters='abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>c!==item.answer);
 const options=shuffle([item.answer,...shuffle(letters).slice(0,3)]);
 $('choices').innerHTML=options.map(c=>'<button type="button" class="choice" data-letter="'+c+'">'+c+'</button>').join('');
 $('choices').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.letter,b),{once:true}));
 $('questionModal').hidden=false;
}
function answer(letter,button){
 if(!paused)return;const item=questions[qIndex],correct=letter===item.answer;
 $('choices').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.letter===item.answer)b.classList.add('correct')});
 if(!correct)button.classList.add('wrong');
 $('feedback').textContent=correct?'✓ Correct! Great running!':'The answer is '+item.answer+'. Keep trying!';$('feedback').className='feedback '+(correct?'good':'bad');
 if(correct)score+=100;$('score').textContent=String(score).padStart(4,'0');qIndex++;$('progress').textContent=qIndex+' / 10';$('orbs').textContent=String(10-qIndex);
 setTimeout(()=>{$('questionModal').hidden=true;if(qIndex>=10){finish()}else{paused=false;createTarget();draw()}},correct?650:950);
}
function finish(){running=false;paused=true;$('resultText').textContent='You answered 10 questions and scored '+score+' points. Great work!';$('result').hidden=false;draw()}
document.addEventListener('keydown',e=>{const key=e.key.toLowerCase(),dirs={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};if(dirs[key]){e.preventDefault();move(dirs[key])}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
let touch=null;canvas.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>18){if(Math.abs(dx)>Math.abs(dy))move(dx>0?'right':'left');else move(dy<0?'up':'down')}},{passive:true});
$('startBtn').addEventListener('click',startGame);$('again').addEventListener('click',setup);$('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'🔊':'🔇'});
window.addEventListener('resize',resize);
window.addEventListener('error',()=>{const s=$('startScreen');s.hidden=false;s.querySelector('h2').textContent='GAME ERROR';s.querySelector('p').textContent='Reload the page and try again.'});
setup();
