const rounds=[
{a:'Yasmin draws.',b:'The mothers talks.',correct:'a',why:'Yasmin is one person, so we say “draws.” Mothers is plural, so it should be “talk.”'},
{a:'The birds fly.',b:'My brothers sits.',correct:'a',why:'Birds and brothers are plural. A plural noun uses the base verb: fly, sit.'},
{a:'Many turtles eats.',b:'The big animals play.',correct:'b',why:'Animals is plural, so “play” is correct. We say “Many turtles eat.”'},
{a:'The girl play.',b:'The boy runs.',correct:'b',why:'Boy is one person, so the verb needs -s: runs.'},
{a:'The dogs barks.',b:'The cat sleeps.',correct:'b',why:'Cat is singular, so “sleeps” is correct. Dogs is plural, so we say “bark.”'},
{a:'My friends help.',b:'The baby cry.',correct:'a',why:'Friends is plural, so “help” is correct. We say “The baby cries.”'},
{a:'The teacher read.',b:'The children laugh.',correct:'b',why:'Children is plural, so the verb is “laugh,” without -s.'},
{a:'A duck swims.',b:'Two ducks swims.',correct:'a',why:'A duck is singular, so “swims” is correct. Two ducks swim.'},
{a:'The stars shines.',b:'The sun shines.',correct:'b',why:'The sun is one thing, so “shines” is correct.'},
{a:'My sisters dance.',b:'My sister dance.',correct:'a',why:'Sisters is plural, so “dance” is correct. One sister dances.'},
{a:'The horse run.',b:'The horses run.',correct:'b',why:'Horses is plural, so we use “run,” not “runs.”'},
{a:'A bird sings.',b:'Birds sings.',correct:'a',why:'A bird is singular, so “sings” is correct. Birds sing.'}
];
let order=[],index=0,power=0,points=0,streak=0,locked=false;
const $=id=>document.getElementById(id);
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function load(){locked=false;const item=rounds[order[index]];const swap=Math.random()<.5;const left=swap?item.b:item.a,right=swap?item.a:item.b; $('leftText').textContent=left;$('rightText').textContent=right;$('leftAnswer').dataset.correct=(swap?item.correct==='b':item.correct==='a')?'yes':'no';$('rightAnswer').dataset.correct=(swap?item.correct==='a':item.correct==='b')?'yes':'no';['leftAnswer','rightAnswer'].forEach(id=>{const b=$(id);b.disabled=false;b.className='answer'});$('round').textContent=(index+1)+' / 10';$('points').textContent=points;$('power').textContent=power;$('streak').textContent='🔥 '+streak+' streak';$('feedback').textContent='Choose A or B to pull the rope!';$('feedback').className='feedback';$('next').hidden=true;$('hint').textContent='Look at the noun. Does the verb match?'}
function choose(id){if(locked)return;locked=true;const btn=$(id),correct=btn.dataset.correct==='yes';$('leftAnswer').disabled=true;$('rightAnswer').disabled=true;btn.classList.add(correct?'correct':'wrong');const item=rounds[order[index]];if(correct){power=Math.min(5,power+1);points+=10;streak++;$('feedback').textContent='✓ Great match! '+item.why;$('feedback').className='feedback good';$('burst').textContent='PULL! 💪';}else{power=Math.max(-5,power-1);streak=0;$('feedback').textContent='Not quite! '+item.why;$('feedback').className='feedback bad';$('burst').textContent='Oops! Try the next one!'}$('marker').style.left=(50-power*8)+'%';$('points').textContent=points;$('power').textContent=power;$('streak').textContent='🔥 '+streak+' streak';$('next').hidden=false;$('next').textContent=index===9?'See my result →':'Next round →';if(power>=5||power<=-5||index===9)$('next').textContent='See my result →'}
function advance(){if(!locked)return;if(power>=5||power<=-5||index===9){finish();return}index++;load()}
function finish(){const win=power>0;$('trophy').textContent=win?'🏆':'💪';$('endTitle').textContent=win?'Blue Team Wins!':'Great effort, Grammar Hero!';$('endText').textContent='You scored '+points+' points and finished with team power '+power+'. Keep practising noun and verb agreement!';$('end').hidden=false}
function start(){order=shuffle(rounds.map((_,i)=>i)).slice(0,10);index=0;power=0;points=0;streak=0;$('marker').style.left='50%';$('burst').textContent='';$('end').hidden=true;load()}
$('leftAnswer').addEventListener('click',()=>choose('leftAnswer'));$('rightAnswer').addEventListener('click',()=>choose('rightAnswer'));$('next').addEventListener('click',advance);$('again').addEventListener('click',start);start();