// v11: Latihan jadi hub kartu, Bunpou masuk Materi (hub kategori), beranda jalur 3 langkah.
(function(){
const $=id=>document.getElementById(id),W=window.NQ_WORDS||[],K=window.NQ_KANJIS||[];
const L=$('latihan'),M=$('materi');
const cnt=f=>W.filter(f).length;
// ===== LATIHAN: hub kartu =====
var qcat='';
const wpool=c=>W.filter(w=>w[2]&&NQRange.test(w)&&(!c||(c==='Sifat'?/^Sifat/.test(w[3]):w[3]===c)));
const lh=document.createElement('div');lh.id='lthub';
lh.innerHTML=`<p class="hubnote">Pilih jenis latihan</p>
<button class="hc big" onclick="ltStart('kanji')"><b class="jp">漢</b><div><h4>Kanji</h4><small>Tebak arti kanji · 10 soal</small></div></button>
<div class="hgroup"><h4>📚 Kotoba <small>pilih bab &amp; jenis kata</small></h4><div id="rngH"></div><div class="hrow3" id="ltcats">
<button data-c="Kata benda" onclick="ltStart('kotoba','Kata benda')"><b>Kata benda</b><small></small></button>
<button data-c="Sifat" onclick="ltStart('kotoba','Sifat')"><b>Kata sifat</b><small></small></button>
<button data-c="Kata kerja" onclick="ltStart('kotoba','Kata kerja')"><b>Kata kerja</b><small></small></button></div><button class="mixb" data-c="" onclick="ltStart('kotoba','')">Campur semua jenis</button><p id="ltmsg" class="ltmsg"></p></div>
<div class="hrow3"><button class="hc" onclick="go('jft')"><span>📝</span><b>JFT</b><small>Simulasi 30 soal</small></button>
<button class="hc" onclick="go('kaiwa')"><span>🗣️</span><b>Kaiwa</b><small>Ngobrol dengan sensei</small></button>
<button class="hc" onclick="go('cerita')"><span>📖</span><b>Cerita</b><small>Baca &amp; kuis</small></button></div>
<button class="hc ghost" onclick="go('kuis')"><span>🧠</span><div><h4>Pusat Kuis</h4><small>13 mode &amp; Ulangi Cerdas</small></div></button>`;
const lab=document.createElement('div');lab.id='ltlabel';lab.className='ltlabel';
L.querySelector('.subhead').after(lh);NQRange.mount($('rngH'));
const refresh=()=>{lh.querySelectorAll('[data-c]').forEach(b=>{const n=wpool(b.dataset.c).length;b.classList.toggle('empty',n<4);const s=b.querySelector('small');if(s)s.textContent=n+' kata';else b.textContent='Campur semua jenis ('+n+')'})};NQRange.on(refresh);refresh();lh.after(lab);L.classList.add('lt-hub');
const label=()=>{lab.textContent=qmode==='kanji'?'漢 Kanji':'📚 Kotoba · '+NQRange.label()+' · '+(qcat==='Sifat'?'Kata sifat':qcat||'Semua jenis')};
window.ltHub=function(){L.classList.add('lt-hub');L.classList.remove('lt-quiz')};
window.ltStart=function(m,c){const msg=$('ltmsg');if(m==='kotoba'&&wpool(c||'').length<4){go('latihan');if(msg)msg.textContent='Kata di pilihan ini terlalu sedikit ('+wpool(c||'').length+'). Coba perluas rentang bab atau pilih jenis lain.';return}if(msg)msg.textContent='';qmode=m;qcat=c||'';newQuiz();renderQ();L.classList.remove('lt-hub');L.classList.add('lt-quiz');label()};
window.newQuiz=function(){
 const kot=()=>wpool(qcat).map(w=>[w[0],w[2]]);
 const src=qmode==='kanji'?K.map(k=>[k[0],k[2]]):kot(),pool=src.length>8?src:W.filter(w=>w[2]).map(w=>[w[0],w[2]]);
 const sh=a=>a.slice().sort(()=>Math.random()-.5);
 qlist=sh(src).slice(0,10).map(q=>{const wr=[];let n=0;while(wr.length<3&&n++<120){const r=pool[Math.floor(Math.random()*pool.length)][1];if(r!==q[1]&&!wr.includes(r))wr.push(r)}const o=sh(wr.concat([q[1]]));return{t:q[0],o,a:o.indexOf(q[1])}});qi=0};
const sq=window.setQ;window.setQ=function(m,b){qcat='';sq(m,b);L.classList.remove('lt-hub');L.classList.add('lt-quiz');label()};
// ===== MATERI: hub kategori =====
let mtKeep=false;
const nB=(window.NQ_BUNPOU||[]).length,nC=(window.NQ_CHAPTERS||[]).length;
const mh=document.createElement('div');mh.id='mthub';
mh.innerHTML=`<div class="hubstep"><b>Bingung mulai dari mana?</b><p>Urutan untuk pemula: <span>1 Pelajaran</span> › <span>2 Bunpou</span> › <span>3 Kata kerja</span></p></div>
<h4 class="hubh">📘 Pelajaran</h4>
<button class="hc big" onclick="mtBab()"><b>${nC||50}</b><div><h4>Bab 1–${nC||50}</h4><small>Pola kalimat tiap bab (Minna no Nihongo)</small></div></button>
<h4 class="hubh">🧩 Tata bahasa</h4>
<div class="hrow3"><button class="hc" onclick="go('bunpou')"><span>🧩</span><b>Bunpou</b><small>${nB} pola</small></button>
<button class="hc" onclick="go('partikel')"><span>➡️</span><b>Partikel</b><small>は が を に で</small></button>
<button class="hc" onclick="go('konjugasi')"><span>🔄</span><b>Kata kerja</b><small>ます て た ない</small></button></div>
<h4 class="hubh">🔤 Kosakata &amp; Kanji</h4>
<div class="hrow3 two"><button class="hc" onclick="go('kotoba')"><span>📚</span><b>Kotoba</b><small>per jenis kata</small></button>
<button class="hc" onclick="go('kanji')"><span class="jp">漢</span><b>Kanji</b><small>N5 · N4 · N3</small></button></div>`;
M.querySelector('.subhead').after(mh);M.classList.add('mt-hub');
window.mtBab=function(){M.classList.remove('mt-hub');M.classList.add('mt-bab');mtKeep=true;renderChapters()};
window.mtHub=function(){mtKeep=false;M.classList.add('mt-hub');M.classList.remove('mt-bab')};
const oc=window.openChapter;if(oc)window.openChapter=function(n){mtKeep=true;return oc.apply(this,arguments)};
// ===== navigasi =====
const g=window.go;window.go=function(id,b){g(id,b);
 if(id==='latihan')window.ltHub();
 if(id==='materi'){if(b)mtKeep=false;if(mtKeep){M.classList.remove('mt-hub');M.classList.add('mt-bab')}else window.mtHub()}
 if(id==='home')mtKeep=false};
const BACK={bunpou:'materi',partikel:'materi',konjugasi:'materi',kanji:'materi',kotoba:'materi',jft:'latihan',kaiwa:'latihan',cerita:'latihan',kuis:'latihan'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.subhead .back');if(!b)return;const s=b.closest('section.page');if(!s)return;
 let to=null;
 if(s.id==='latihan'&&s.classList.contains('lt-quiz'))to='ltHub';
 else if(s.id==='materi'&&s.classList.contains('mt-bab'))to='mtHub';
 else if(BACK[s.id])to=BACK[s.id];
 if(!to)return;e.preventDefault();e.stopImmediatePropagation();
 if(to==='ltHub')ltHub();else if(to==='mtHub')mtHub();else go(to)},true);
})();
