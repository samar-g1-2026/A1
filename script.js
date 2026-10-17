const ROWS=9,COLS=13,CP=5;
const questions=[
["Which day is correct?",["monday","Monday","MONday"],1,"Days start with a capital letter."],
["Choose the month.",["january","January","JANuary"],1,"Months start with a capital letter."],
["Which sentence is correct?",["we play on Friday.","We play on friday.","We play on Friday."],2,"Start a sentence and day names with capitals."],
["Which is a proper noun?",["school","Tuesday","week"],1,"Tuesday is the name of a day."],
["Choose the correct month.",["march","March","MARch"],1,"March starts with a capital letter."]
];
let maze,player,checkpoints,solved,score,lives,paused,questionOpen,soundOn=true;
const $=id=>document.getElementById(id);
function build(){maze=Array.from({length:ROWS},()=>Array(COLS).fill(0));for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!r||!c||r===ROWS-1||c===COLS-1)maze[r][c]=1;
for(let r=2;r<ROWS-1;r+=2)for(let c=1;c<COLS-1;c++)maze[r][c]=1;
for(let r=1;r<ROWS-1;r+=2){let gap=1+Math.floor(Math.random()*(COLS-2));maze[r][gap]=0}
maze[1][1]=0;maze[ROWS-2][COLS-2]=0;player={r:1,c:1};solved=new Set();score=0;lives=3;paused=false;questionOpen=false;checkpoints=[[1,3],[3,5],[5,2],[5,9],[7,7]].map((p,i)=>({r:p[0],c:p[1],q:questions[i]}));$("score").textContent="0";$("lives").textContent="3";$("checkpointCount").textContent="0/5";$("questionModal").classList.add("hidden");$("winModal").classList.add("hidden");$("pause").textContent="⏸ Pause";render();say("✨ Find all five stars and reach the castle!");
}
function render(){const el=$("maze");el.style.gridTemplateColumns=`repeat(${COLS},1fr)`;el.style.gridTemplateRows=`repeat(${ROWS},1fr)`;el.innerHTML="";for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){let d=document.createElement("div");d.className="cell "+(maze[r][c]?"wall":"path");if(r===1&&c===1){d.classList.add("start");d.textContent="🚩"}let i=checkpoints.findIndex(p=>p.r===r&&p.c===c);if(i>=0&&!solved.has(i)){d.classList.add("checkpoint");d.textContent="⭐"}if(r===ROWS-2&&c===COLS-2){d.classList.add("goal");d.textContent="🏰"}d.dataset.r=r;d.dataset.c=c;el.appendChild(d)}$("checkpointCount").textContent=solved.size+"/5";const cell=el.querySelector(`[data-r="${player.r}"][data-c="${player.c}"]`);if(cell){$("player").style.left=(el.offsetLeft+cell.offsetLeft+cell.offsetWidth/2)+"px";$("player").style.top=(el.offsetTop+cell.offsetTop+cell.offsetHeight/2)+"px"}}
function say(t){$("message").textContent=t}
function move(dir){if(paused||questionOpen)return;let r=player.r,c=player.c;if(dir==="up")r--;if(dir==="down")r++;if(dir==="left")c--;if(dir==="right")c++;if(r<0||c<0||r>=ROWS||c>=COLS||maze[r][c])return;player={r,c};render();let i=checkpoints.findIndex(p=>p.r===r&&p.c===c);if(i>=0&&!solved.has(i))ask(i);if(r===ROWS-2&&c===COLS-2){if(solved.size===5)win();else say("🔒 Find all five stars first!")}}
function ask(i){questionOpen=true;let q=checkpoints[i].q;$("questionText").textContent=q[0];$("feedback").textContent="";$("answers").innerHTML="";q[1].forEach((a,n)=>{let b=document.createElement("button");b.className="answer";b.textContent=a;b.onclick=()=>{if(n===q[2]){solved.add(i);score+=20;$("score").textContent=score;$("feedback").textContent="🎉 Correct! "+q[3];b.classList.add("correct");setTimeout(()=>{$("questionModal").classList.add("hidden");questionOpen=false;render();say("Great job! Find the next star.")},500)}else{lives--;$("lives").textContent=lives;$("feedback").textContent="Try again! "+q[3];b.classList.add("wrong");b.disabled=true;if(!lives)setTimeout(build,700)}};$("answers").appendChild(b)});$("questionModal").classList.remove("hidden")}
function win(){$("finalScore").textContent=score;$("winModal").classList.remove("hidden");questionOpen=true}
document.querySelectorAll(".move").forEach(b=>b.addEventListener("click",()=>move(b.dataset.dir)));
document.addEventListener("keydown",e=>{let m={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};if(m[e.key]){e.preventDefault();move(m[e.key])}});
$("restart").onclick=build;$("again").onclick=build;$("pause").onclick=()=>{paused=!paused;$("pause").textContent=paused?"▶ Resume":"⏸ Pause";say(paused?"Game paused":"Keep going!")};$("sound").onclick=()=>{soundOn=!soundOn;$("sound").textContent=soundOn?"🔊 Sound":"🔇 Sound Off"};window.addEventListener("resize",render);build();