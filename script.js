// Capital Letter Maze v3
// A fresh, guaranteed-solvable maze and a randomized question set are created every time.

const ROWS=13, COLS=21; // odd dimensions make a perfect maze easy to generate
const CHECKPOINTS=5;

const questionBank=[
 {q:"Which is correct?",a:["monday", "Monday", "MONday"],c:1,t:"Days of the week start with a capital letter."},
 {q:"Choose the correct day.",a:["friday", "Friday", "FRiday"],c:1,t:"Friday starts with a capital letter."},
 {q:"Choose the correct day.",a:["tuesday", "Tuesday", "TUESday"],c:1,t:"Tuesday starts with a capital letter."},
 {q:"Choose the correct day.",a:["wednesday", "Wednesday", "wednesDay"],c:1,t:"Wednesday starts with a capital letter."},
 {q:"Choose the correct day.",a:["thursday", "Thursday", "thursDay"],c:1,t:"Thursday starts with a capital letter."},
 {q:"Choose the correct day.",a:["saturday", "Saturday", "SATurday"],c:1,t:"Saturday starts with a capital letter."},
 {q:"Choose the correct day.",a:["sunday", "Sunday", "SUNday"],c:1,t:"Sunday starts with a capital letter."},
 {q:"Choose the correct month.",a:["january", "January", "JANuary"],c:1,t:"January starts with a capital letter."},
 {q:"Choose the correct month.",a:["february", "February", "FEBruary"],c:1,t:"February starts with a capital letter."},
 {q:"Choose the correct month.",a:["march", "March", "MARch"],c:1,t:"March starts with a capital letter."},
 {q:"Choose the correct month.",a:["april", "April", "APRil"],c:1,t:"April starts with a capital letter."},
 {q:"Choose the correct month.",a:["may", "May", "MAY"],c:1,t:"May starts with a capital letter."},
 {q:"Choose the correct month.",a:["june", "June", "JUNe"],c:1,t:"June starts with a capital letter."},
 {q:"Choose the correct month.",a:["july", "July", "JULy"],c:1,t:"July starts with a capital letter."},
 {q:"Choose the correct month.",a:["august", "August", "AUGust"],c:1,t:"August starts with a capital letter."},
 {q:"Choose the correct month.",a:["september", "September", "SEPtember"],c:1,t:"September starts with a capital letter."},
 {q:"Choose the correct month.",a:["october", "October", "OCTober"],c:1,t:"October starts with a capital letter."},
 {q:"Choose the correct month.",a:["november", "November", "NOVember"],c:1,t:"November starts with a capital letter."},
 {q:"Choose the correct month.",a:["december", "December", "DECember"],c:1,t:"December starts with a capital letter."},
 {q:"Which sentence is correct?",a:["My birthday is on april 18.", "my birthday is on April 18.", "My birthday is on April 18."],c:2,t:"Start the sentence and the month with capital letters."},
 {q:"Which sentence is correct?",a:["We go to school on Monday.", "we go to school on Monday.", "We go to school on monday."],c:0,t:"Start the sentence and the day with capital letters."},
 {q:"Fix the sentence: “sara is here on sunday.”",a:["sara is here on sunday.", "Sara is here on sunday.", "Sara is here on Sunday."],c:2,t:"Start the name and the day with capital letters."},
 {q:"Fix the sentence: “tom visits us in june.”",a:["Tom visits us in June.", "tom visits us in June.", "Tom visits us in june."],c:0,t:"Start the name and the month with capital letters."},
 {q:"Which sentence is correct?",a:["My birthday is in July.", "my birthday is in July.", "My birthday is in july."],c:0,t:"The sentence and month begin with capital letters."},
 {q:"Which sentence is correct?",a:["I play on Saturday.", "I play on saturday.", "i play on Saturday."],c:0,t:"The sentence and day begin with capital letters."},
 {q:"Which sentence is correct?",a:["Ali was born in March.", "ali was born in March.", "Ali was born in march."],c:0,t:"Start the name and month with capitals."},
 {q:"Which sentence is correct?",a:["We swim in August.", "we swim in August.", "We swim in august."],c:0,t:"Start the sentence and month with capitals."},
 {q:"Which sentence is correct?",a:["Lina comes on Friday.", "lina comes on Friday.", "Lina comes on friday."],c:0,t:"Start the name and day with capitals."},
 {q:"Which sentence is correct?",a:["School starts in September.", "school starts in September.", "School starts in september."],c:0,t:"Start the sentence and month with capitals."},
 {q:"Which word needs a capital letter?",a:["sunday", "Sunday", "birthday"],c:0,t:"Sunday is a day of the week."},
 {q:"Which word needs a capital letter?",a:["january", "January", "birthday"],c:0,t:"January is a month."},
 {q:"Which word needs a capital letter?",a:["monday", "Monday", "school"],c:0,t:"Monday is a day of the week."},
 {q:"Which word needs a capital letter?",a:["december", "December", "party"],c:0,t:"December is a month."},
 {q:"Which word needs a capital letter?",a:["friday", "Friday", "game"],c:0,t:"Friday is a day of the week."},
 {q:"Which word needs a capital letter?",a:["august", "August", "summer"],c:0,t:"August is a month."},
 {q:"Which is a proper noun?",a:["day", "Monday", "birthday"],c:1,t:"Monday is the name of a specific day."},
 {q:"Which is a proper noun?",a:["month", "January", "season"],c:1,t:"January is the name of a specific month."},
 {q:"Which is a proper noun?",a:["day", "Sunday", "week"],c:1,t:"Sunday is the name of a specific day."},
 {q:"Which is a proper noun?",a:["month", "October", "year"],c:1,t:"October is the name of a specific month."},
 {q:"Which is a proper noun?",a:["day", "Thursday", "week"],c:1,t:"Thursday is the name of a specific day."},
 {q:"Which is a proper noun?",a:["month", "December", "season"],c:1,t:"December is the name of a specific month."},
 {q:"Which one is a day of the week?",a:["April", "Tuesday", "January"],c:1,t:"Tuesday is a day."},
 {q:"Which one is a month of the year?",a:["Friday", "August", "Monday"],c:1,t:"August is a month."},
 {q:"Which one is a day of the week?",a:["September", "Saturday", "March"],c:1,t:"Saturday is a day."},
 {q:"Which one is a month of the year?",a:["Thursday", "November", "Sunday"],c:1,t:"November is a month."},
 {q:"Which one is a day of the week?",a:["June", "Wednesday", "October"],c:1,t:"Wednesday is a day."},
 {q:"Which one is a month of the year?",a:["Tuesday", "May", "Friday"],c:1,t:"May is a month."},
 {q:"Pick the correctly capitalized phrase.",a:["on monday", "on Monday", "On monday"],c:1,t:"The day name needs a capital letter."},
 {q:"Pick the correctly capitalized phrase.",a:["in january", "in January", "In january"],c:1,t:"The month name needs a capital letter."},
 {q:"Pick the correctly capitalized phrase.",a:["next Friday", "next friday", "Next friday"],c:0,t:"Friday is a proper noun."}
];

let maze=[], solution=[], player={r:1,c:1}, checkpoints=[], solved=new Set();
let score=0,lives=3,paused=false,questionOpen=false,soundOn=true,holdTimer=null;

const mazeEl=document.getElementById("maze"), playerEl=document.getElementById("player");

function shuffled(arr){return [...arr].sort(()=>Math.random()-.5)}
function key(r,c){return r+","+c}

function generateMaze(){
  // Start with all walls, then carve a perfect maze using randomized DFS.
  maze=Array.from({length:ROWS},()=>Array(COLS).fill(1));
  const stack=[[1,1]];
  maze[1][1]=0;
  while(stack.length){
    const [r,c]=stack[stack.length-1];
    const dirs=shuffled([[0,2],[0,-2],[2,0],[-2,0]]);
    let carved=false;
    for(const [dr,dc] of dirs){
      const nr=r+dr,nc=c+dc;
      if(nr>0&&nr<ROWS-1&&nc>0&&nc<COLS-1&&maze[nr][nc]===1){
        maze[r+dr/2][c+dc/2]=0;
        maze[nr][nc]=0;
        stack.push([nr,nc]); carved=true; break;
      }
    }
    if(!carved)stack.pop();
  }
  // Guarantee a visually clean entrance/exit.
  maze[1][0]=0; maze[ROWS-2][COLS-1]=0;
  // Calculate the unique path through this perfect maze.
  solution=findPath([1,1],[ROWS-2,COLS-2]);
  // Put the goal at the far end of the carved route.
  maze[ROWS-2][COLS-1]=0;
  solution=findPath([1,1],[ROWS-2,COLS-1]);
  placeCheckpoints();
}

function neighbors(r,c){
 return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc])=>nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&maze[nr][nc]===0);
}
function findPath(start,end){
 const q=[start], prev=new Map([[key(...start),null]]);
 while(q.length){
   const [r,c]=q.shift();
   if(r===end[0]&&c===end[1])break;
   for(const [nr,nc] of neighbors(r,c)){
     const k=key(nr,nc);
     if(!prev.has(k)){prev.set(k,[r,c]);q.push([nr,nc]);}
   }
 }
 const out=[]; let cur=end;
 while(cur){out.push(cur);cur=prev.get(key(...cur));}
 return out.reverse();
}
function placeCheckpoints(){
 // Choose 5 well-spaced cells on the guaranteed solution path.
 const usable=solution.slice(5,-5);
 const picks=[];
 for(let i=1;i<=CHECKPOINTS;i++){
   const idx=Math.floor((i/(CHECKPOINTS+1))*usable.length);
   const p=usable[Math.min(idx,usable.length-1)];
   if(picks.length===0||key(...p)!==key(...picks[picks.length-1]))picks.push(p);
 }
 const selectedQuestions=shuffled(questionBank).slice(0,CHECKPOINTS);
  checkpoints=picks.map((p,i)=>({r:p[0],c:p[1],q:selectedQuestions[i]}));
}

function render(){
 mazeEl.style.gridTemplateColumns=`repeat(${COLS},1fr)`;
 mazeEl.style.gridTemplateRows=`repeat(${ROWS},1fr)`;
 mazeEl.innerHTML="";
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
   const cell=document.createElement("div");
   cell.className="cell "+(maze[r][c]?"wall":"path");
   if(r===1&&c===1){cell.classList.add("start");cell.textContent="🚩"}
   if(r===ROWS-2&&c===COLS-1){cell.classList.add("goal");cell.textContent="🏰"}
   const i=checkpoints.findIndex(x=>x.r===r&&x.c===c);
   if(i>=0&&!solved.has(i)){cell.classList.add("checkpoint");cell.textContent="⭐"}
   cell.dataset.r=r;cell.dataset.c=c;
   mazeEl.appendChild(cell);
 }
 document.getElementById("checkpointCount").textContent=`${solved.size}/${CHECKPOINTS}`;
 positionPlayer();
}

function positionPlayer(){
 const cell=mazeEl.querySelector(`[data-r="${player.r}"][data-c="${player.c}"]`);
 if(!cell)return;
 // Coordinates are relative to the scene, not just the maze.
 playerEl.style.left=(mazeEl.offsetLeft+cell.offsetLeft+cell.offsetWidth/2)+"px";
 playerEl.style.top=(mazeEl.offsetTop+cell.offsetTop+cell.offsetHeight/2)+"px";
}

function beep(freq,dur=.08){
 if(!soundOn)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext,ctx=new C();
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.value=freq;o.connect(g);g.connect(ctx.destination);g.gain.value=.035;
  o.start();o.stop(ctx.currentTime+dur);
 }catch(e){}
}
function say(msg){document.getElementById("message").textContent=msg}

function move(dir){
 if(paused||questionOpen)return;
 let r=player.r,c=player.c;
 if(dir==="up")r--; else if(dir==="down")r++; else if(dir==="left")c--; else if(dir==="right")c++;
 if(r<0||r>=ROWS||c<0||c>=COLS||maze[r][c]===1){beep(130,.05);return}
 player={r,c};positionPlayer();beep(520,.035);

 const i=checkpoints.findIndex(x=>x.r===r&&x.c===c);
 if(i>=0&&!solved.has(i))openQuestion(i);

 if(r===ROWS-2&&c===COLS-1){
   if(solved.size===CHECKPOINTS)win();
   else say("🔒 The Grammar Gate is locked! Find every ⭐ first.");
 }
}

function openQuestion(i){
 questionOpen=true;
 const q=checkpoints[i].q;
 document.getElementById("questionText").textContent=q.q;
 document.getElementById("feedback").textContent="";
 const box=document.getElementById("answers");box.innerHTML="";
 q.a.forEach((text,n)=>{
   const b=document.createElement("button");b.className="answer";b.textContent=text;
   b.onclick=()=>answer(i,n,b);box.appendChild(b);
 });
 document.getElementById("questionModal").classList.remove("hidden");beep(900,.12);
}
function answer(i,n,button){
 const q=checkpoints[i].q,fb=document.getElementById("feedback");
 if(n===q.c){
   solved.add(i);score+=20;document.getElementById("score").textContent=score;
   button.classList.add("correct");fb.textContent="🎉 Correct! Checkpoint unlocked!";fb.style.color="#299966";beep(1100,.12);
   setTimeout(()=>{
     document.getElementById("questionModal").classList.add("hidden");
     questionOpen=false;render();say("⭐ Excellent! Find the next checkpoint!");
   },650);
 }else{
   lives--;document.getElementById("lives").textContent=lives;
   button.classList.add("wrong");button.disabled=true;
   fb.textContent="💡 Try again! "+q.t;fb.style.color="#d25a69";beep(180,.13);
   if(lives<=0)setTimeout(()=>newGame(),850);
 }
}
function win(){
 questionOpen=true;
 document.getElementById("finalScore").textContent=score;
 document.getElementById("winModal").classList.remove("hidden");beep(1200,.22);
}
function newGame(){
 clearInterval(holdTimer);holdTimer=null;
 score=0;lives=3;paused=false;questionOpen=false;solved.clear();player={r:1,c:1};
 document.getElementById("score").textContent="0";document.getElementById("lives").textContent="3";
 document.getElementById("pause").textContent="⏸ Pause";
 document.getElementById("questionModal").classList.add("hidden");
 document.getElementById("winModal").classList.add("hidden");
 generateMaze();render();say("✨ New maze! Find the ⭐ checkpoints!");
}

function startHold(btn){
 clearInterval(holdTimer);move(btn.dataset.dir);
 holdTimer=setInterval(()=>move(btn.dataset.dir),155);btn.classList.add("active");
}
function stopHold(btn){
 clearInterval(holdTimer);holdTimer=null;if(btn)btn.classList.remove("active");
}
document.querySelectorAll(".move").forEach(btn=>{
 btn.addEventListener("pointerdown",e=>{e.preventDefault();startHold(btn)});
 btn.addEventListener("pointerup",()=>stopHold(btn));
 btn.addEventListener("pointercancel",()=>stopHold(btn));
 btn.addEventListener("pointerleave",()=>stopHold(btn));
});
document.addEventListener("keydown",e=>{
 const m={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"};
 if(m[e.key.toLowerCase()]){e.preventDefault();move(m[e.key.toLowerCase()]);}
});
document.getElementById("restart").onclick=newGame;
document.getElementById("again").onclick=newGame;
document.getElementById("pause").onclick=()=>{
 paused=!paused;
 document.getElementById("pause").textContent=paused?"▶ Resume":"⏸ Pause";
 say(paused?"⏸ Game paused":"▶ Let's go!");
};
document.getElementById("sound").onclick=()=>{
 soundOn=!soundOn;document.getElementById("sound").textContent=soundOn?"🔊 Sound":"🔇 Sound Off";
};
window.addEventListener("resize",positionPlayer);

newGame();
