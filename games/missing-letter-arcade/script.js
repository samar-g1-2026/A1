'use strict';
const WORDS=[
['goal','A target in a game'],['goalie','The player who guards the goal'],['leader','A person who guides a group'],['stands','Seats for a crowd at a game'],['aboard','On or inside a ship, train, or plane'],['conductor','A person who leads an orchestra or checks train tickets'],['fancy','Decorative or special'],['space','The area beyond Earth'],['fluffy','Soft and full of fluff'],['cozy','Warm, comfortable, and snug'],['sunny','Bright with sunshine'],['snowy','Covered with or full of snow'],['agree','To have the same opinion'],['clubhouse','A building used by a club or team'],['decorate','To make something look pretty'],['measure','To find the size or amount of something'],['hail','Small balls of ice that fall from clouds'],['lightning','A bright flash in a storm'],['thunder','The loud sound during a storm'],['tornado','A powerful spinning column of air'],
['bony','Very thin, with bones easy to see'],['stretch','To make your body or arms longer'],['stand up','To rise to your feet'],['vacuum cleaner','A machine that cleans floors'],['lovely','Very nice or beautiful'],['sturdy','Strong and not easy to break'],['cheery','Happy and cheerful'],['creative','Good at making new things']
];
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
let playerLane=1,items=[],qIndex=0,score=0,running=false,paused=false,soundOn=true,stepCount=0;
let tileW=0,tileH=0,sceneTick=0,questions=[];
function shuffle(a){return a.slice().sort(()=>Math.random()-.5)}
function resize(){const w=Math.max(280,Math.min(560,canvas.parentElement.clientWidth-4));canvas.width=w;canvas.height=Math.round(w*1.18);draw()}
function laneX(lane,depth){const horizon=canvas.height*.18,ground=canvas.height*.98;const spread=canvas.width*(.08+depth*.25);return canvas.width/2+(lane-1)*spread}
function draw(){
 if(!ctx)return;
 const w=canvas.width,h=canvas.height,horizon=h*.18;
 const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#80d8ff');sky.addColorStop(1,'#e6f8ff');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon+2);
 // distant city skyline
 for(let i=0;i<12;i++){const bw=w*.055+(i%3)*w*.025,bh=h*.08+(i%4)*h*.025,x=i*w/11-bw/2;ctx.fillStyle=['#8bb7d1','#a2c9dc','#739db9'][i%3];ctx.fillRect(x,horizon-bh,bw,bh);ctx.fillStyle='#e9f8ff';for(let yy=horizon-bh+6;yy<horizon-3;yy+=9)for(let xx=x+4;xx<x+bw-3;xx+=9)ctx.fillRect(xx,yy,3,4)}
 // track ground
 ctx.fillStyle='#425a68';ctx.beginPath();ctx.moveTo(w*.35,horizon);ctx.lineTo(w*.65,horizon);ctx.lineTo(w*1.12,h);ctx.lineTo(-w*.12,h);ctx.closePath();ctx.fill();
 // three lanes and rails
 for(let i=0;i<4;i++){const topX=w*(.35+i*.1),bottomX=w*(-.12+i*.413);ctx.strokeStyle=i===0||i===3?'#d9e7ec':'#b7c9d1';ctx.lineWidth=Math.max(2,w*.009);ctx.beginPath();ctx.moveTo(topX,horizon);ctx.lineTo(bottomX,h);ctx.stroke()}
 for(let j=0;j<14;j++){const t=(j/14+((sceneTick*.035)%1));const y=horizon+(h-horizon)*t*t;const half=w*(.15+t*.55);ctx.strokeStyle='#9aadb7';ctx.lineWidth=1+t*2;ctx.beginPath();ctx.moveTo(w/2-half,y);ctx.lineTo(w/2+half,y);ctx.stroke()}
 // train side panels
 ctx.fillStyle='#f4b94f';ctx.fillRect(0,horizon-5,w*.08, h*.34);ctx.fillStyle='#f4b94f';ctx.fillRect(w*.92,horizon-5,w*.08,h*.34);
 ctx.fillStyle='#263d50';ctx.fillRect(w*.012,horizon+8,w*.056,h*.12);ctx.fillRect(w*.932,horizon+8,w*.056,h*.12);
 // collectible letter tokens approaching the runner
 items.forEach(it=>{if(it.got||it.missed)return;const t=it.z,x=laneX(it.lane,t),y=horizon+(h-horizon)*t*t,r=w*(.018+t*.025);ctx.beginPath();ctx.fillStyle='#ffd84d';ctx.shadowColor='#fff1a1';ctx.shadowBlur=8;ctx.arc(x,y,r*1.25,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#24364c';ctx.font='900 '+Math.max(10,r*1.3)+'px Nunito, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',x,y)});
 // runner
 const px=laneX(playerLane,.88),py=h*.82,scale=w/360;
 ctx.save();ctx.translate(px,py);
 // shadow
 ctx.fillStyle='#1b334455';ctx.beginPath();ctx.ellipse(0,26*scale,21*scale,7*scale,0,0,Math.PI*2);ctx.fill();
 // legs
 ctx.strokeStyle='#173c74';ctx.lineWidth=8*scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5*scale,8*scale);ctx.lineTo(-11*scale,22*scale);ctx.moveTo(5*scale,8*scale);ctx.lineTo(12*scale,21*scale);ctx.stroke();
 // shoes
 ctx.strokeStyle='#ff704d';ctx.lineWidth=7*scale;ctx.beginPath();ctx.moveTo(-12*scale,22*scale);ctx.lineTo(-4*scale,22*scale);ctx.moveTo(9*scale,21*scale);ctx.lineTo(17*scale,21*scale);ctx.stroke();
 // body hoodie
 ctx.fillStyle='#16b8ad';ctx.beginPath();ctx.roundRect(-13*scale,-16*scale,26*scale,28*scale,8*scale);ctx.fill();
 // arms
 ctx.strokeStyle='#f1b98c';ctx.lineWidth=6*scale;ctx.beginPath();ctx.moveTo(-11*scale,-10*scale);ctx.lineTo(-20*scale,1*scale);ctx.moveTo(11*scale,-10*scale);ctx.lineTo(20*scale,-1*scale);ctx.stroke();
 // head
 ctx.fillStyle='#f1b98c';ctx.beginPath();ctx.arc(0,-25*scale,12*scale,0,Math.PI*2);ctx.fill();
 // hair and cap
 ctx.fillStyle='#4b3027';ctx.beginPath();ctx.arc(0,-29*scale,12*scale,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcf45';ctx.fillRect(-12*scale,-31*scale,24*scale,4*scale);ctx.fillRect(4*scale,-29*scale,11*scale,3*scale);
 ctx.fillStyle='#24364c';ctx.beginPath();ctx.arc(4*scale,-25*scale,1.4*scale,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function setup(){
 running=false;paused=false;playerLane=1;stepCount=0;sceneTick=0;questions=shuffle(WORDS).slice(0,10).map(([word,hint])=>({word,hint}));qIndex=0;score=0;
 items=Array.from({length:10},(_,i)=>({lane:Math.floor(Math.random()*3),z:.12+i*.085,got:false,missed:false}));
 $('score').textContent='0000';$('progress').textContent='0 / 10';$('orbs').textContent='10';$('lives').textContent='3';$('startScreen').hidden=false;$('questionModal').hidden=true;$('result').hidden=true;resize();
}
function startGame(){running=true;paused=false;$('startScreen').hidden=true;draw()}
function move(dir){
 if(!running||paused)return;
 if(dir==='left')playerLane=Math.max(0,playerLane-1);
 if(dir==='right')playerLane=Math.min(2,playerLane+1);
 if(dir==='up'){sceneTick++;items.forEach(it=>{if(!it.got&&!it.missed)it.z+=.11})}
 if(dir==='down'){items.forEach(it=>{if(!it.got&&!it.missed)it.z+=.025})}
 // Every player action advances the run a little, but nothing moves on its own.
 if(dir==='left'||dir==='right')items.forEach(it=>{if(!it.got&&!it.missed)it.z+=.035});
 items.forEach(it=>{if(!it.got&&!it.missed&&it.z>=.82){if(it.lane===playerLane){it.got=true;showQuestion()}else{it.missed=true}}});
 if(items.every(it=>it.got||it.missed)){if(qIndex>=10)finish();else if(items.some(it=>!it.got&&!it.missed)){}else finish()}
 draw();
}
function showQuestion(){
 paused=true;const item=questions[qIndex];if(!item){finish();return}
 const letterIndexes=[...item.word].map((c,i)=>/[a-z]/i.test(c)?i:-1).filter(i=>i>=0);
 item.missing=letterIndexes[Math.floor(Math.random()*letterIndexes.length)];item.answer=item.word[item.missing];
 $('qCount').textContent='QUESTION '+(qIndex+1)+' / 10';
 $('word').innerHTML=[...item.word].map((c,i)=>'<span class="letter '+(i===item.missing?'missing':'')+'">'+(i===item.missing?'_':c===' '?' ':c)+'</span>').join('');
 $('hint').textContent=item.hint;$('feedback').textContent='Choose the missing letter!';$('feedback').className='feedback';
 const letters='abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>c!==item.answer);
 const opts=shuffle([item.answer,...shuffle(letters).slice(0,3)]);
 $('choices').innerHTML=opts.map(c=>'<button type="button" class="choice" data-letter="'+c+'">'+c+'</button>').join('');
 $('choices').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.letter,b),{once:true}));
 $('questionModal').hidden=false;
}
function answer(letter,button){
 if(!paused)return;const item=questions[qIndex],ok=letter===item.answer;
 $('choices').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.letter===item.answer)b.classList.add('correct')});
 if(!ok)button.classList.add('wrong');
 $('feedback').textContent=ok?'✓ Correct! Keep running!':'The answer is '+item.answer+'. Keep going!';$('feedback').className='feedback '+(ok?'good':'bad');
 if(ok)score+=100;$('score').textContent=String(score).padStart(4,'0');qIndex++;$('progress').textContent=qIndex+' / 10';$('orbs').textContent=String(Math.max(0,10-qIndex));
 setTimeout(()=>{$('questionModal').hidden=true;if(qIndex>=10){finish()}else{paused=false;draw()}},ok?650:950);
}
function finish(){running=false;paused=true;$('resultText').textContent='You answered '+qIndex+' questions and scored '+score+' points. Great work!';$('result').hidden=false;draw()}
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),dirs={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};if(dirs[k]){e.preventDefault();move(dirs[k])}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
let touch=null;canvas.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>18){if(Math.abs(dx)>Math.abs(dy))move(dx>0?'right':'left');else move(dy>0?'down':'up')}},{passive:true});
$('startBtn').addEventListener('click',startGame);$('again').addEventListener('click',setup);$('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'🔊':'🔇'});
window.addEventListener('resize',resize);
window.addEventListener('error',()=>{const s=$('startScreen');s.hidden=false;s.querySelector('h2').textContent='GAME ERROR';s.querySelector('p').textContent='Reload the page and try again.'});
setup();
