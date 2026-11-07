(function(){
"use strict";
var app=document.getElementById('app');
var KEY='alina_vid_v1';
var S={best:{},learned:{},known:{},wrong:{},exam:null};
try{var raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function topicById(id){return TOPICS.filter(function(t){return t.id===id;})[0];}
function qid(t,i){return t.id+':'+i;}
function allQ(){var r=[];TOPICS.forEach(function(t){t.q.forEach(function(q,i){r.push(mk(t,q,i));});});return r;}
function topicQ(t){return t.q.map(function(q,i){return mk(t,q,i);});}
function mk(t,q,i){return{id:qid(t,i),topic:t.id,q:q[0],a:q[1],opts:shuffle([q[1]].concat(q[2]))};}
function pct(n,d){return d?Math.round(n*100/d):0;}
function plural(n,a,b,c){var m=n%100,k=n%10;if(m>10&&m<20)return c;if(k===1)return a;if(k>1&&k<5)return b;return c;}

/* ---------- theme ---------- */
var th=null;try{th=localStorage.getItem('alina_theme');}catch(e){}
if(!th&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)th='dark';
function applyTheme(){document.documentElement.setAttribute('data-theme',th==='dark'?'dark':'light');}
applyTheme();
document.getElementById('theme').addEventListener('click',function(){th=th==='dark'?'light':'dark';try{localStorage.setItem('alina_theme',th);}catch(e){}applyTheme();});

/* ---------- stats ---------- */
function totals(){
  var tq=0;TOPICS.forEach(function(t){tq+=t.q.length;});
  var learned=Object.keys(S.learned).filter(function(k){return S.learned[k];}).length;
  var known=Object.keys(S.known).filter(function(k){return S.known[k];}).length;
  var bests=TOPICS.map(function(t){return S.best[t.id]||0;});
  var avg=Math.round(bests.reduce(function(a,b){return a+b;},0)/TOPICS.length);
  return{tq:tq,learned:learned,known:known,avg:avg,wrong:Object.keys(S.wrong).length};
}

/* ---------- views ---------- */
function home(){
  var s=totals();
  var h='<section class="hero"><svg class="deco" width="300" height="300" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140" fill="none" stroke="#fff" stroke-width="3"/><circle cx="150" cy="150" r="100" fill="none" stroke="#fff" stroke-width="2"/><path d="M150 40l22 78 78 22-78 22-22 78-22-78-78-22 78-22z" fill="none" stroke="#fff" stroke-width="3"/></svg>'+
  '<div class="kicker">Вспомогательные исторические дисциплины</div>'+
  '<div class="sign">Для Алины <svg class="heart" width="34" height="34"><use href="#i-heart"/></svg></div>'+
  '<p>Всё для экзамена в одном месте: 14 тем-карточек, тесты по каждой теме, общий экзамен, 22 билета и тренажёр дат. Проходи по чуть-чуть — результаты сохраняются сами.</p>'+
  '<div class="btns"><a class="btn primary" href="#/test/exam">Пройти общий экзамен</a><a class="btn ghost" href="#/topics">Открыть темы</a><a class="btn ghost" href="#/cards">Карточки</a></div></section>';
  h+='<div class="stats">'+
  '<div class="stat"><b>'+s.avg+'%</b><span>средний лучший результат по темам</span></div>'+
  '<div class="stat"><b>'+s.learned+' / '+TICKETS.length+'</b><span>билетов отмечено как выученные</span></div>'+
  '<div class="stat"><b>'+s.known+'</b><span>карточек в «знаю»</span></div>'+
  '<div class="stat"><b>'+s.wrong+'</b><span>вопросов для работы над ошибками</span></div></div>';
  h+='<h2>С чего начать</h2><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">'+
  step('1','Прочитай тему','Короткий конспект, «Запомнить» и мнемоника.','#/topics','#6d28d9')+
  step('2','Прогони карточки','Переверни, вспомни, отметь «знаю».','#/cards','#0d9488')+
  step('3','Проверь себя тестом','Тест по теме с разбором ошибок.','#/tests','#d97706')+
  step('4','Пройди билеты и даты','Скелеты ответов и тренажёр дат.','#/tickets','#be185d')+'</div>';
  if(s.wrong)h+='<div class="box" style="margin-top:22px"><h3>Работа над ошибками</h3><p class="muted">Накопилось '+s.wrong+' '+plural(s.wrong,'вопрос','вопроса','вопросов')+', в которых были промахи.</p><a class="btn solid" href="#/test/mistakes">Повторить ошибки</a></div>';
  return h;
}
function step(n,t,d,href,c){return'<a class="card" style="--c:'+c+'" href="'+href+'"><div class="num">'+n+'</div><h3>'+t+'</h3><div class="meta">'+d+'</div></a>';}

function topics(){
  var h='<h1>Темы</h1><p class="lead">Четырнадцать разделов курса. Цветная полоска — твой лучший результат в тесте по теме.</p><div class="grid" style="margin-top:20px">';
  TOPICS.forEach(function(t){var b=S.best[t.id]||0;
    h+='<a class="card" style="--c:'+t.color+'" href="#/topic/'+t.id+'"><div class="num">'+t.n+'</div><h3>'+esc(t.title)+'</h3><div class="meta">Билеты: '+esc(t.tickets)+' · '+t.q.length+' '+plural(t.q.length,'вопрос','вопроса','вопросов')+'</div><div class="bar-p" aria-label="Результат '+b+'%"><i style="width:'+b+'%"></i></div><div class="meta">'+(S.best[t.id]!=null?'Лучший результат: '+b+'%':'Тест ещё не пройден')+'</div></a>';});
  return h+'</div>';
}

function topic(id){
  var t=topicById(id);if(!t)return notFound();
  var i=TOPICS.indexOf(t),p=TOPICS[i-1],n=TOPICS[i+1];
  var h='<div class="crumb"><a href="#/topics">Темы</a> / <span>'+esc(t.title)+'</span></div>'+
  '<div style="--c:'+t.color+'"><span class="pill">Тема '+t.n+' · билеты '+esc(t.tickets)+'</span><h1 style="margin-top:10px">'+esc(t.title)+'</h1></div>'+
  '<div class="btns" style="margin:14px 0"><a class="btn solid" href="#/test/'+t.id+'">Тест по теме</a><a class="btn ghost" href="#/cards/'+t.id+'">Карточки темы</a></div>'+
  '<ul class="pts">'+t.bullets.map(function(b){return'<li>'+esc(b)+'</li>';}).join('')+'</ul>'+
  '<div class="box rem"><h4>Запомнить</h4>'+esc(t.remember)+'</div>'+
  '<div class="box mn"><h4>Мнемоника</h4>'+esc(t.mnemo)+'</div>';
  h+='<div class="btns" style="justify-content:space-between;margin-top:22px">'+(p?'<a class="btn ghost" href="#/topic/'+p.id+'">← '+esc(p.title)+'</a>':'<span></span>')+(n?'<a class="btn ghost" href="#/topic/'+n.id+'">'+esc(n.title)+' →</a>':'')+'</div>';
  return h;
}

/* ---------- flashcards ---------- */
function cardsMenu(){
  var h='<h1>Карточки</h1><p class="lead">Вопрос на лицевой стороне, ответ — на обороте. «Знаю» убирает карточку из колоды, «Ещё раз» вернёт её в конец.</p><div class="grid" style="margin-top:20px">';
  h+='<a class="card" style="--c:#be185d" href="#/cards/all"><div class="num">∞</div><h3>Все темы</h3><div class="meta">Перемешанная колода</div></a>';
  TOPICS.forEach(function(t){var k=t.q.filter(function(_,i){return S.known[qid(t,i)];}).length;
    h+='<a class="card" style="--c:'+t.color+'" href="#/cards/'+t.id+'"><div class="num">'+t.n+'</div><h3>'+esc(t.title)+'</h3><div class="meta">Знаю: '+k+' из '+t.q.length+'</div><div class="bar-p"><i style="width:'+pct(k,t.q.length)+'%"></i></div></a>';});
  return h+'</div>';
}
function cardsRun(id){
  var list=[];
  if(id==='all'){TOPICS.forEach(function(t){t.q.forEach(function(q,i){list.push({id:qid(t,i),q:q[0],a:q[1],c:t.color,t:t.title});});});}
  else{var t=topicById(id);if(!t)return notFound();t.q.forEach(function(q,i){list.push({id:qid(t,i),q:q[0],a:q[1],c:t.color,t:t.title});});}
  var queue=shuffle(list.filter(function(c){return !S.known[c.id];}));
  var total=list.length;
  if(!queue.length){queue=shuffle(list);}
  var flipped=false;
  function draw(){
    if(!queue.length){app.innerHTML='<div class="qwrap"><div class="qcard" style="text-align:center"><h2>Колода пройдена!</h2><p class="muted">Все карточки отмечены как «знаю». Можно начать заново или пройти тест.</p><div class="btns" style="justify-content:center"><button class="btn solid" id="again">Сбросить и повторить</button><a class="btn ghost" href="#/tests">К тестам</a></div></div></div>';
      document.getElementById('again').onclick=function(){list.forEach(function(c){delete S.known[c.id];});save();cardsRun(id);};return;}
    var c=queue[0];var done=total-queue.length;
    app.innerHTML='<div class="qwrap"><div class="crumb"><a href="#/cards">Карточки</a> / <span>'+(id==='all'?'Все темы':esc(c.t))+'</span></div>'+
    '<div class="qhead"><span>'+done+' / '+total+'</span><div class="bar-p"><i style="width:'+pct(done,total)+'%;--c:'+c.c+'"></i></div></div>'+
    '<div class="flip'+(flipped?' on':'')+'" id="flip" style="--c:'+c.c+'"><div class="flip-in" tabindex="0" role="button" aria-label="Перевернуть карточку"><div class="face"><small>Вопрос</small>'+esc(c.q)+'</div><div class="face back"><small>Ответ</small>'+esc(c.a)+'</div></div></div>'+
    '<p class="muted" style="text-align:center;margin:14px 0">Нажми на карточку или пробел, чтобы перевернуть</p>'+
    '<div class="btns" style="justify-content:center"><button class="btn ghost" id="again2">Ещё раз</button><button class="btn solid" id="know">Знаю</button></div></div>';
    var f=document.getElementById('flip');
    function flip(){flipped=!flipped;f.classList.toggle('on',flipped);}
    f.querySelector('.flip-in').onclick=flip;
    document.getElementById('know').onclick=function(){S.known[c.id]=true;save();queue.shift();flipped=false;draw();};
    document.getElementById('again2').onclick=function(){queue.push(queue.shift());flipped=false;draw();};
    keyHandler=function(e){if(e.code==='Space'||e.key==='Enter'){e.preventDefault();flip();}else if(e.key==='ArrowRight'){document.getElementById('know').click();}else if(e.key==='ArrowLeft'){document.getElementById('again2').click();}};
  }
  draw();return null;
}

/* ---------- tests ---------- */
function testsMenu(){
  var h='<h1>Тесты</h1><p class="lead">Выбери режим. После каждого ответа — сразу видно, верно ли, а в конце будет разбор ошибок.</p><div class="grid" style="margin-top:20px">'+
  '<a class="card" style="--c:#be185d" href="#/test/exam"><div class="num">30</div><h3>Общий экзамен</h3><div class="meta">30 случайных вопросов по всем темам'+(S.exam!=null?' · лучший: '+S.exam+'%':'')+'</div></a>'+
  '<a class="card" style="--c:#6d28d9" href="#/test/marathon"><div class="num">'+totals().tq+'</div><h3>Марафон</h3><div class="meta">Все вопросы курса подряд в случайном порядке</div></a>'+
  '<a class="card" style="--c:#b91c1c" href="#/test/mistakes"><div class="num">'+totals().wrong+'</div><h3>Работа над ошибками</h3><div class="meta">Вопросы, в которых ты ошибалась</div></a></div>'+
  '<h2>Тесты по темам</h2><div class="grid">';
  TOPICS.forEach(function(t){var b=S.best[t.id];
    h+='<a class="card" style="--c:'+t.color+'" href="#/test/'+t.id+'"><div class="num">'+t.n+'</div><h3>'+esc(t.title)+'</h3><div class="meta">'+t.q.length+' '+plural(t.q.length,'вопрос','вопроса','вопросов')+(b!=null?' · лучший: '+b+'%':'')+'</div><div class="bar-p"><i style="width:'+(b||0)+'%"></i></div></a>';});
  return h+'</div>';
}
function testRun(mode){
  var qs,title,key=null;
  if(mode==='exam'){qs=shuffle(allQ()).slice(0,30);title='Общий экзамен';key='exam';}
  else if(mode==='marathon'){qs=shuffle(allQ());title='Марафон';}
  else if(mode==='mistakes'){var all=allQ().filter(function(q){return S.wrong[q.id];});if(!all.length){return'<div class="qwrap"><div class="qcard" style="text-align:center"><h2>Ошибок нет</h2><p class="muted">Пройди несколько тестов — неверные ответы попадут сюда.</p><a class="btn solid" href="#/tests">К тестам</a></div></div>';}qs=shuffle(all);title='Работа над ошибками';}
  else{var t=topicById(mode);if(!t)return notFound();qs=shuffle(topicQ(t));title=t.title;key=t.id;}
  var i=0,score=0,miss=[],locked=false;
  function ask(){
    var q=qs[i];locked=false;
    var h='<div class="qwrap"><div class="crumb"><a href="#/tests">Тесты</a> / <span>'+esc(title)+'</span></div><div class="qhead"><span>'+(i+1)+' / '+qs.length+'</span><div class="bar-p"><i style="width:'+pct(i,qs.length)+'%"></i></div></div><div class="qcard"><h2>'+esc(q.q)+'</h2><div class="opts" role="group" aria-label="Варианты ответа">';
    q.opts.forEach(function(o,k){h+='<button class="opt" data-k="'+k+'"><kbd>'+(k+1)+'</kbd><span>'+esc(o)+'</span></button>';});
    h+='</div><div id="fb" aria-live="polite"></div></div></div>';
    app.innerHTML=h;
    var btns=app.querySelectorAll('.opt');
    function pick(k){
      if(locked)return;locked=true;
      var ok=q.opts[k]===q.a;
      btns.forEach(function(b,j){b.disabled=true;if(q.opts[j]===q.a)b.classList.add('ok');else if(j===k)b.classList.add('bad');});
      if(ok){score++;delete S.wrong[q.id];}else{miss.push(q);S.wrong[q.id]=true;}
      save();
      var last=i===qs.length-1;
      document.getElementById('fb').innerHTML='<div class="fb '+(ok?'ok':'bad')+'">'+(ok?'Верно!':'Правильный ответ: '+esc(q.a))+'</div><div class="btns" style="margin-top:14px"><button class="btn solid" id="next">'+(last?'Результат':'Дальше')+'</button></div>';
      var nx=document.getElementById('next');nx.focus();nx.onclick=function(){if(last)finish();else{i++;ask();}};
    }
    btns.forEach(function(b){b.onclick=function(){pick(+b.getAttribute('data-k'));};});
    keyHandler=function(e){var n=parseInt(e.key,10);if(n>=1&&n<=q.opts.length&&!locked){pick(n-1);}else if((e.key==='Enter'||e.key===' ')&&locked){var nx=document.getElementById('next');if(nx){e.preventDefault();nx.click();}}};
  }
  function finish(){
    var p=pct(score,qs.length);
    if(key==='exam'){if(S.exam==null||p>S.exam)S.exam=p;}
    else if(key){if(S.best[key]==null||p>S.best[key])S.best[key]=p;}
    save();keyHandler=null;
    var msg=p>=90?'Блестяще! Так держать.':p>=70?'Хороший результат — повтори ошибки и будет идеально.':p>=50?'Неплохо, но стоит ещё раз пройтись по теме.':'Не страшно — перечитай тему, пройди карточки и возвращайся.';
    var h='<div class="qwrap"><div class="qcard" style="text-align:center"><div class="ring" style="--p:'+p+'"><div>'+p+'%</div></div><h2 style="margin-top:18px">'+score+' из '+qs.length+'</h2><p class="muted">'+msg+'</p><div class="btns" style="justify-content:center"><button class="btn solid" id="retry">Пройти ещё раз</button><a class="btn ghost" href="#/tests">К тестам</a>'+(miss.length?'<a class="btn ghost" href="#/test/mistakes">Повторить ошибки</a>':'')+'</div></div>';
    if(miss.length){h+='<h2>Разбор ошибок</h2><div class="list">'+miss.map(function(q){return'<div class="row"><div class="grow"><b>'+esc(q.q)+'</b><div class="muted">Верно: '+esc(q.a)+'</div></div></div>';}).join('')+'</div>';}
    app.innerHTML=h+'</div>';
    document.getElementById('retry').onclick=function(){testRun(mode);window.scrollTo(0,0);};
    window.scrollTo(0,0);
  }
  ask();return null;
}

/* ---------- tickets ---------- */
function tickets(){
  var h='<h1>Билеты</h1><p class="lead">22 билета, 44 вопроса. Для каждого — «скелет» ответа: определение, список, даты. Отмечай выученные.</p>'+
  '<div class="stats" style="margin:16px 0"><div class="stat"><b id="tc">'+0+'</b><span>выучено билетов из '+TICKETS.length+'</span></div></div>'+
  '<input type="search" id="tq" placeholder="Поиск по билетам: например, «герб» или «1582»" aria-label="Поиск по билетам"><div class="list" id="tl" style="margin-top:14px"></div>';
  setTimeout(function(){
    var box=document.getElementById('tl'),inp=document.getElementById('tq');
    function cnt(){document.getElementById('tc').textContent=Object.keys(S.learned).filter(function(k){return S.learned[k];}).length;}
    function render(){
      var q=inp.value.trim().toLowerCase();
      box.innerHTML=TICKETS.filter(function(t){return !q||(t.a+t.as+t.b+t.bs+' билет '+t.n).toLowerCase().indexOf(q)>-1;}).map(function(t){
        var on=S.learned[t.n];
        return'<div class="row" style="align-items:flex-start;flex-wrap:wrap"><div class="grow"><b>Билет '+t.n+'</b>'+
        '<div style="margin-top:6px"><span class="pill" style="--c:#6d28d9">'+t.n+'.1</span> <b>'+esc(t.a)+'</b><div class="muted">'+esc(t.as)+'</div></div>'+
        '<div style="margin-top:8px"><span class="pill" style="--c:#be185d">'+t.n+'.2</span> <b>'+esc(t.b)+'</b><div class="muted">'+esc(t.bs)+'</div></div></div>'+
        '<button class="chip" data-n="'+t.n+'" aria-pressed="'+(on?'true':'false')+'">'+(on?'Выучен':'Отметить')+'</button></div>';}).join('')||'<p class="muted">Ничего не найдено.</p>';
      box.querySelectorAll('.chip').forEach(function(b){b.onclick=function(){var n=b.getAttribute('data-n');S.learned[n]=!S.learned[n];save();render();cnt();};});
    }
    inp.oninput=render;render();cnt();
  },0);
  return h;
}

/* ---------- dates ---------- */
function dates(){
  var d=DATES.slice().sort(function(a,b){return a[0]-b[0];});
  var h='<h1>Даты</h1><p class="lead">Хронолента ключевых дат курса и тренажёр «Когда это было?».</p><div class="btns" style="margin:14px 0 22px"><a class="btn solid" href="#/datesquiz">Тренажёр дат</a></div><div class="tl">';
  d.forEach(function(x){h+='<div class="it"><b>'+esc(x[1])+'</b>'+esc(x[2])+'</div>';});
  return h+'</div>';
}
function datesQuiz(){
  var pool=DATES.slice();
  var qs=shuffle(pool).slice(0,12).map(function(x,i){
    var others=shuffle(pool.filter(function(y){return y[1]!==x[1];})).slice(0,3).map(function(y){return y[1];});
    return{id:'d:'+x[1],topic:'dates',q:'Когда это было: '+x[2]+'?',a:x[1],opts:shuffle([x[1]].concat(others))};
  });
  var i=0,score=0,locked=false;
  function ask(){var q=qs[i];locked=false;
    var h='<div class="qwrap"><div class="crumb"><a href="#/dates">Даты</a> / <span>Тренажёр</span></div><div class="qhead"><span>'+(i+1)+' / '+qs.length+'</span><div class="bar-p"><i style="width:'+pct(i,qs.length)+'%"></i></div></div><div class="qcard"><h2>'+esc(q.q)+'</h2><div class="opts">';
    q.opts.forEach(function(o,k){h+='<button class="opt" data-k="'+k+'"><kbd>'+(k+1)+'</kbd><span>'+esc(o)+'</span></button>';});
    app.innerHTML=h+'</div><div id="fb" aria-live="polite"></div></div></div>';
    var btns=app.querySelectorAll('.opt');
    function pick(k){if(locked)return;locked=true;var ok=q.opts[k]===q.a;if(ok)score++;
      btns.forEach(function(b,j){b.disabled=true;if(q.opts[j]===q.a)b.classList.add('ok');else if(j===k)b.classList.add('bad');});
      var last=i===qs.length-1;
      document.getElementById('fb').innerHTML='<div class="fb '+(ok?'ok':'bad')+'">'+(ok?'Верно!':'Правильно: '+esc(q.a))+'</div><div class="btns" style="margin-top:14px"><button class="btn solid" id="next">'+(last?'Результат':'Дальше')+'</button></div>';
      var nx=document.getElementById('next');nx.focus();nx.onclick=function(){if(last)end();else{i++;ask();}};}
    btns.forEach(function(b){b.onclick=function(){pick(+b.getAttribute('data-k'));};});
    keyHandler=function(e){var n=parseInt(e.key,10);if(n>=1&&n<=4&&!locked)pick(n-1);else if((e.key==='Enter'||e.key===' ')&&locked){var nx=document.getElementById('next');if(nx){e.preventDefault();nx.click();}}};
  }
  function end(){var p=pct(score,qs.length);keyHandler=null;
    app.innerHTML='<div class="qwrap"><div class="qcard" style="text-align:center"><div class="ring" style="--p:'+p+'"><div>'+p+'%</div></div><h2 style="margin-top:18px">'+score+' из '+qs.length+'</h2><div class="btns" style="justify-content:center"><button class="btn solid" id="r">Ещё раз</button><a class="btn ghost" href="#/dates">К хронолентe</a></div></div></div>';
    document.getElementById('r').onclick=function(){app.innerHTML=datesQuiz()||'';};}
  ask();return null;
}
function notFound(){return'<h1>Страница не найдена</h1><a class="btn solid" href="#/">На главную</a>';}

/* ---------- router ---------- */
var keyHandler=null;
document.addEventListener('keydown',function(e){if(keyHandler&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))keyHandler(e);});
function route(){
  keyHandler=null;
  var h=(location.hash||'#/').replace(/^#\/?/,'').split('/');
  var r=h[0]||'home',arg=h[1],html=null,nav=r;
  if(r==='home')html=home();
  else if(r==='topics')html=topics();
  else if(r==='topic'){html=topic(arg);nav='topics';}
  else if(r==='cards'){nav='cards';html=arg?cardsRun(arg):cardsMenu();}
  else if(r==='tests')html=testsMenu();
  else if(r==='test'){nav='tests';html=testRun(arg);}
  else if(r==='tickets')html=tickets();
  else if(r==='dates')html=dates();
  else if(r==='datesquiz'){nav='dates';html=datesQuiz();}
  else html=notFound();
  if(html!==null)app.innerHTML=html;
  document.querySelectorAll('[data-r]').forEach(function(a){if(a.getAttribute('data-r')===nav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
route();
})();
