'use strict';
const WORDS=[
['goal','A target in a game'],['goalie','The player who guards the goal'],['leader','A person who guides a group'],['stands','Seats for a crowd at a game'],['aboard','On or inside a ship, train, or plane'],['conductor','A person who leads an orchestra or checks train tickets'],['fancy','Decorative or special'],['space','The area beyond Earth'],['fluffy','Soft and full of fluff'],['cozy','Warm, comfortable, and snug'],['sunny','Bright with sunshine'],['snowy','Covered with or full of snow'],['agree','To have the same opinion'],['clubhouse','A building used by a club or team'],['decorate','To make something look pretty'],['measure','To find the size or amount of something'],['hail','Small balls of ice that fall from clouds'],['lightning','A bright flash in a storm'],['thunder','The loud sound during a storm'],['tornado','A powerful spinning column of air']
];
const MAP=[
'###############',
'#.....#.......#',
'#.###.#.#####.#',
'#.#...#.....#.#',
'#.#.#####.#.#.#',
'#...#.....#...#',
'###.#.###.#.###',
'#...#.#...#...#',
'#.###.#.###.#.#',
'#.....#.....#.#',
'#.#########.#.#',
'#...........#.#',
'###############'
];
const $=id=>document.getElementById(id);
const canvas=$('game');
const ctx=canvas.getContext('2d');
let tile=20, player={x:1,y:1,dx:0,dy:0}, wanted={dx:0,dy:0};
let orbs=[], questions=[], qIndex=0, score=0, running=false, paused=false, moveTimer=null, soundOn=true, lastInputAt=0;
function shuffle(a){return a.slice().sort(()=>Math.random()-.5)}
function blocked(x,y){return y<0||y>=MAP.length||x<0||x>=MAP[y].length||MAP[y][x]==='#'}
function resize(){const size=Math.max(260,Math.min(560,canvas.parentElement.clientWidth-4));canvas.width=size;canvas.height=Math.round(size*MAP.length/MAP[0].length);tile=canvas.width/MAP[0].length;draw()}
function draw(){
 if(!ctx)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#020611';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<MAP.length;y++)for(let x=0;x<MAP[y].length;x++){let px=x*tile,py=y*tile;
  if(MAP[y][x]==='#'){ctx.fillStyle='#081a43';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#13cfff';ctx.lineWidth=Math.max(1,tile*.07);ctx.strokeRect(px+tile*.12,py+tile*.12,tile*.76,tile*.76);ctx.strokeStyle='#1652a2';ctx.lineWidth=1;ctx.strokeRect(px+tile*.25,py+tile*.25,tile*.5,tile*.5)}
 }
 orbs.forEach(o=>{ctx.beginPath();ctx.fillStyle='#ffe45c';ctx.shadowColor='#ffe45c';ctx.shadowBlur=tile*.55;ctx.arc((o.x+.5)*tile,(o.y+.5)*tile,tile*.13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
 const cx=(player.x+.5)*tile,cy=(player.y+.5)*tile,r=tile*.37;ctx.beginPath();ctx.fillStyle='#ffe45c';ctx.shadowColor='#ffe45c';ctx.shadowBlur=tile*.35;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 const a=Math.atan2(player.dy,player.dx),mouth=.25+Math.sin(Date.now()/100)*.12;ctx.beginPath();ctx.fillStyle='#020611';ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a+mouth,a+Math.PI*2-mouth);ctx.closePath();ctx.fill();
}
function setup(){
 clearInterval(moveTimer);lastInputAt=0;running=false;paused=false;player={x:1,y:1,dx:0,dy:0};wanted={dx:0,dy:0};questions=shuffle(WORDS).slice(0,10).map(([word,hint])=>({word,hint}));qIndex=0;score=0;
 let cells=[];MAP.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='.'&&!(x===1&&y===1))cells.push({x,y})}));orbs=shuffle(cells).slice(0,10);
 $('score').textContent='0000';$('progress').textContent='0 / 10';$('orbs').textContent='10';$('lives').textContent='3';$('startScreen').hidden=false;$('questionModal').hidden=true;$('result').hidden=true;resize();
}
function startGame(){if(running)return;running=true;paused=false;$('startScreen').hidden=true;player.dx=0;player.dy=0;wanted={dx:0,dy:0};clearInterval(moveTimer);draw()}
function setDirection(dx,dy){if(!running||paused)return;const now=Date.now();if(now-lastInputAt<280)return;lastInputAt=now;wanted={dx,dy};step()}
function step(){
 if(!running||paused)return;
 const dx=wanted.dx,dy=wanted.dy;
 if(!dx&&!dy)return;
 const tx=player.x+dx,ty=player.y+dy;
 if(blocked(tx,ty)){draw();return}
 player.dx=dx;player.dy=dy;player.x=tx;player.y=ty;
 const idx=orbs.findIndex(o=>o.x===player.x&&o.y===player.y);
 if(idx!==-1){orbs.splice(idx,1);draw();showQuestion();return}
 draw();
}
function showQuestion(){
 paused=true;const item=questions[qIndex];item.missing=Math.floor(Math.random()*item.word.length);item.answer=item.word[item.missing];
 $('qCount').textContent='QUESTION '+(qIndex+1)+' / 10';
 $('word').innerHTML=[...item.word].map((c,i)=>'<span class="letter '+(i===item.missing?'missing':'')+'">'+(i===item.missing?'_':c)+'</span>').join('');
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
 $('feedback').textContent=ok?'✓ Correct! Keep moving!':'The answer is '+item.answer+'. Keep going!';$('feedback').className='feedback '+(ok?'good':'bad');
 if(ok)score+=100;$('score').textContent=String(score).padStart(4,'0');qIndex++;$('progress').textContent=qIndex+' / 10';$('orbs').textContent=String(10-qIndex);
 setTimeout(()=>{$('questionModal').hidden=true;if(qIndex>=10){finish()}else{paused=false;draw()}},ok?650:950);
}
function finish(){running=false;paused=true;clearInterval(moveTimer);$('resultText').textContent='You answered 10 questions and scored '+score+' points. Great work!';$('result').hidden=false;draw()}
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),dirs={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};if(dirs[k]){e.preventDefault();setDirection(...dirs[k])}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.dir;setDirection(d==='left'?-1:d==='right'?1:0,d==='up'?-1:d==='down'?1:0)}));
let touch=null;canvas.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>18){if(Math.abs(dx)>Math.abs(dy))setDirection(dx>0?1:-1,0);else setDirection(0,dy>0?1:-1)}},{passive:true});
$('startBtn').addEventListener('click',startGame);$('again').addEventListener('click',setup);$('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'🔊':'🔇'});
window.addEventListener('resize',resize);
window.addEventListener('error',e=>{const s=$('startScreen');s.hidden=false;s.querySelector('h2').textContent='GAME ERROR';s.querySelector('p').textContent='Reload the page and try again.'});
setup();