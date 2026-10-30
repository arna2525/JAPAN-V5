// Jalur belajar kanji N5 -> N4: tahap, kunci/prasyarat, status penguasaan, rekomendasi, kuis uji diri, ulangi yang salah.
// Urutan = "urutan rekomendasi pembelajaran aplikasi" (bukan urutan resmi ujian). Progres disimpan per kanji (ID stabil: kanji-<kode unicode>).
(function(){
const K=window.NQ_KANJIS||[],J=window.NQ_JALUR||[],BU=window.NQ_BUSHU||{},BN=window.NQ_BUSHUNAME||{},$=id=>document.getElementById(id),KEY='nqjalur';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const info={};K.forEach(k=>info[k[0]]=k);
const path=[];J.forEach(s=>[...s.k].forEach(c=>path.push({c,id:'kanji-'+c.codePointAt(0).toString(16),stage:s.n,lv:s.lv,order:path.length+1,pre:path.length?['kanji-'+path[path.length-1].c.codePointAt(0).toString(16)]:[]})));
const idx={};path.forEach((p,i)=>idx[p.c]=i);
const LVN={N5:'N5',Jembatan:'Jembatan N5–N4',N4:'N4'};
let S={v:1,free:false,filter:'all',p:{},goal:10,rq:{a:1,b:1,n:10},hist:[]};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.v)S=Object.assign(S,r)}catch(e){}
try{(JSON.parse(localStorage.getItem('nqkj'))||[]).forEach(c=>{if(idx[c]!==undefined&&!S.p[c])S.p[c]={s:'learning',a:0,ok:0,ng:0,st:0}})}catch(e){}  // migrasi dari tanda "hafal" lama
if(!S.rq)S.rq={a:1,b:1,n:10};if(!S.goal)S.goal=10;if(!S.hist)S.hist=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const R=c=>S.p[c]||(S.p[c]={s:'',a:0,ok:0,ng:0,st:0});
function status(i){const c=path[i].c,r=S.p[c];if(r&&r.s)return r.s;if(S.free||i===0)return 'available';const pr=S.p[path[i-1].c];return pr&&pr.s?'available':'locked'}
const ST={locked:'Terkunci',available:'Tersedia',learning:'Sedang dipelajari',review:'Perlu diulang',mastered:'Dikuasai'};
function recommend(){let f=-1;for(const t of ['review','learning','available']){f=path.findIndex((p,i)=>status(i)===t);if(f>=0)return f}return -1}
const cnt=(f)=>path.filter((p,i)=>f(p,status(i))).length;
const pct=(a,b)=>b?Math.round(a/b*100):0;
const inF=p=>S.filter==='all'||(S.filter==='N5'&&p.lv==='N5')||(S.filter==='Jembatan'&&p.lv==='Jembatan')||(S.filter==='N4'&&p.lv==='N4');

function chip(p,i){const s=status(i),k=info[p.c];return `<button class="jch ${s}" onclick="jlOpen(${i})" title="${ST[s]}"><span class="jk">${p.c}</span><small>${s==='locked'?'🔒':esc((k[2]||'').split(/[;/]/)[0])}</small></button>`}
window.NQJ={html:function(){
 const rec=recommend(),tot=path.length,m=cnt((p,s)=>s==='mastered'),l=cnt((p,s)=>s==='learning'),rv=cnt((p,s)=>s==='review');
 const by=lv=>{const a=path.filter(p=>p.lv===lv),ms=a.filter(p=>status(idx[p.c])==='mastered').length;return [ms,a.length]};
 const bar=(n,lv)=>{const [a,b]=by(lv);return `<div class="jbar"><span>${n}</span><div class="progress"><span style="width:${pct(a,b)}%"></span></div><b>${a}/${b}</b></div>`};
 const recK=rec>=0?path[rec]:null;
 let h=`<div class="jsum"><div class="jpos">${recK?`Kanji <b>${rec+1}</b> dari ${tot} pada jalur`:'Jalur selesai 🎉'}</div><div class="jlvl">${recK?`${LVN[recK.lv]} · Tahap ${recK.stage}`:''}</div>${bar('N5','N5')}${bar('Jembatan','Jembatan')}${bar('N4','N4')}<div class="jmini"><span><i class="d mastered"></i>${m} dikuasai</span><span><i class="d learning"></i>${l} dipelajari</span><span><i class="d review"></i>${rv} perlu diulang</span></div>`;
 if(recK)h+=`<div class="jnext"><div class="jk">${recK.c}</div><div><small>Rekomendasi berikutnya</small><b>${esc(info[recK.c][2])}</b></div><button class="btn" onclick="jlOpen(${rec})">Lanjutkan belajar</button></div>`;
 h+=`</div><div class="jbtns"><button class="btn light" onclick="jlOpen(0)">⏮ Mulai dari awal</button><button class="btn light" ${rv?'':'disabled'} onclick="jlReview()">↻ Ulangi yang salah (${rv})</button><button class="btn light${S.free?' on':''}" onclick="jlFree()">${S.free?'🔓 Pelajari bebas: AKTIF':'🔒 Pelajari bebas'}</button></div>`;
 h+=`<div class="pills">${[['all','Semua'],['N5','N5'],['Jembatan','Jembatan N5–N4'],['N4','N4']].map(f=>`<button class="pill${S.filter===f[0]?' active':''}" onclick="jlFilter('${f[0]}')">${f[1]}</button>`).join('')}</div>`;
 h+=panel();
 h+=J.map((s,si)=>{const ps=path.filter(p=>p.stage===s.n);if(!ps.length||!inF(ps[0]))return '';const ms=ps.filter(p=>status(idx[p.c])==='mastered').length;
  return `<div class="jst bgi" style="--i:${Math.min(si,14)}"><div class="jsh"><span class="jsn">${s.n}</span><div><b>${esc(s.name)}</b><small>${LVN[s.lv]} · ${ps.length} kanji · urutan ${ps[0].order}–${ps[ps.length-1].order}</small></div><span class="tag">${pct(ms,ps.length)}%</span></div><div class="jgrid">${ps.map(p=>chip(p,idx[p.c])).join('')}</div></div>`}).join('');
 h+=`<p class="notice">Urutan ini adalah <b>urutan rekomendasi pembelajaran aplikasi</b> (dari kanji dasar ke kanji yang lebih kompleks, mengikuti tema), bukan urutan resmi ujian. Tingkat N5/N4 mengikuti daftar kanji aplikasi (daftar JLPT tidak resmi yang beredar).</p><button class="btn light wide" onclick="jlReset()">Reset progres jalur</button>`;
 return h}};
window.jlFilter=f=>{S.filter=f;save();renderKanji()};
window.jlFree=()=>{S.free=!S.free;save();renderKanji()};
window.jlReset=()=>{if(confirm('Hapus semua progres jalur kanji (status, skor, riwayat salah)?')){S.p={};save();renderKanji()}};

// ---------- halaman detail ----------
const det=document.createElement('section');det.id='kjdetail';det.className='page';$('kanji').after(det);
let cur=0,queue=null,qi=0,sess={ok:0,n:0},ans=false,Q=null;
const shuf=a=>a.slice().sort(()=>Math.random()-.5);
window.jlOpen=function(i,fromQ){if(i<0||i>=path.length)return;cur=i;const p=path[i],k=info[p.c],s=status(i);
 if(s==='available'){R(p.c).s='learning';save()}
 const st=status(i),pre=i?path[i-1]:null,nx=i<path.length-1?path[i+1]:null,b=BU[p.c];
 const locked=st==='locked';
 det.innerHTML=`<div class="subhead"><button class="back" onclick="jlBack()">←</button><div><h2>Kanji ${i+1} / ${path.length}</h2><p>${LVN[p.lv]} · Tahap ${p.stage}</p></div></div>
 ${queue?`<div class="jq">Sesi ulang: soal ${Math.min(qi+1,queue.length)} / ${queue.length}</div>`:''}
 <div class="jbig ${st}"><span class="badge ${st}">${ST[st]}</span><div class="bigk">${p.c}</div><h3>${esc(k[2])}</h3><div class="jread">${(window.NQRD||esc)(k)}</div><div class="jex">Contoh: <b>${esc(k[3])}</b></div>
 <div class="jmeta"><span>${LVN[p.lv]}</span><span>Tahap ${p.stage}</span><span>Urutan ${p.order}</span>${b?`<span>Bushu ${b} ${esc((BN[b]||[''])[0])}</span>`:''}</div>
 <div class="jstat">Percobaan ${R(p.c).a} · Benar ${R(p.c).ok} · Salah ${R(p.c).ng}</div></div>
 <div class="jlinks">${pre?`<button class="btn light" onclick="jlOpen(${i-1})">‹ ${pre.c} sebelumnya</button>`:'<span></span>'}${nx?`<button class="btn light" onclick="jlOpen(${i+1})">${nx.c} berikutnya ›</button>`:'<span></span>'}</div>
 ${locked?`<div class="hero-mini"><h3>🔒 Kanji ini masih terkunci</h3><p>Pelajari dulu kanji sebelumnya (<b>${pre?pre.c:''}</b>), atau aktifkan <b>Pelajari bebas</b> untuk membuka semua kanji tanpa menghilangkan urutan rekomendasi.</p></div><button class="btn wide" onclick="jlFree();jlOpen(${i})">Aktifkan Pelajari bebas</button>`:`<div id="jquiz"></div><div class="bpact"><button class="btn" onclick="jlQuiz()">✏️ Uji diri</button><button class="btn light" onclick="jlMaster()">${st==='mastered'?'↺ Tandai belum hafal':'✓ Tandai dikuasai'}</button></div>`}`;
 if(!$('kjdetail').classList.contains('active'))go('kjdetail');else det.scrollTop=0;
 if(queue&&!locked)jlQuiz()};
window.jlBack=function(){queue=null;go('kanji');renderKanji()};
window.jlMaster=function(){const c=path[cur].c,r=R(c);if(r.s==='mastered'){r.s='learning';r.st=0}else{r.s='mastered';r.st=2}save();jlOpen(cur)};
window.jlQuiz=function(){const p=path[cur],k=info[p.c],box=$('jquiz');if(!box)return;ans=false;
 const type=Math.random()<.5?'arti':'bacaan',ix=type==='arti'?2:1;
 const pool=K.filter(x=>x[0]!==p.c&&x[4]===k[4]&&x[ix]!==k[ix]).map(x=>x[ix]);
 const opts=shuf([k[ix]].concat(shuf([...new Set(pool)]).slice(0,3)));
 Q={type,ok:opts.indexOf(k[ix]),opts};
 box.innerHTML=`<div class="card jqz"><b>${type==='arti'?'Apa arti kanji ini?':'Bacaan mana yang benar?'}</b><div class="qk">${p.c}</div>${opts.map((o,j)=>`<button class="quizopt" onclick="jlAns(${j},this)">${esc(o)}</button>`).join('')}<div id="jfb"></div></div>`;
 box.scrollIntoView({behavior:'smooth',block:'nearest'})};
window.jlAns=function(j,btn){if(ans||!Q)return;ans=true;const c=path[cur].c,k=info[c],r=R(c),good=j===Q.ok;
 r.a++;r.last=new Date().toISOString().slice(0,10);
 if(good){r.ok++;r.st=(r.st||0)+1;r.s=r.st>=2?'mastered':(r.s==='review'?'learning':'learning')}else{r.ng++;r.st=0;r.s='review'}
 save();sess.n++;if(good)sess.ok++;
 const all=document.querySelectorAll('#jquiz .quizopt');all.forEach((b,x)=>{b.disabled=true;if(x===Q.ok)b.classList.add('ok');else if(x===j)b.classList.add('bad')});
 $('jfb').innerHTML=`<div class="hero-mini" style="background:${good?'#e8f8f0':'#fff0f4'}"><b>${good?'🎉 Benar!':'🌱 Belum tepat'}</b><p>${esc(c)} = <b>${esc(k[2])}</b> · bacaan ${esc(k[1])} · contoh ${esc(k[3])}</p><p class="muted">Status sekarang: ${ST[r.s]}${good&&r.s!=='mastered'?' (benar sekali lagi untuk menguasai)':''}</p></div>`
 +(queue?`<button class="btn wide" onclick="jlNextQ()">${qi<queue.length-1?'Soal berikutnya →':'Selesai sesi'}</button>`:`<div class="bpact"><button class="btn light" onclick="jlQuiz()">Soal lagi</button><button class="btn" onclick="jlOpen(${Math.min(cur+1,path.length-1)})">Kanji berikutnya ›</button></div>`)};
window.jlReview=function(){const q=path.filter((p,i)=>status(i)==='review').map(p=>idx[p.c]);if(!q.length)return;queue=shuf(q);qi=0;sess={ok:0,n:0};jlOpen(queue[0])};
window.jlNextQ=function(){qi++;if(qi>=queue.length){const o=sess.ok,n=sess.n;queue=null;go('kanji');renderKanji();alert('Sesi selesai!\nBenar '+o+' dari '+n+' soal.')}else jlOpen(queue[qi])};


// ---------- target hafalan harian & acak quiz ----------
function todaySet(){const o=[];for(let i=0;i<path.length&&o.length<S.goal;i++){const r=S.p[path[i].c];if(!r||r.s!=='mastered')o.push(path[i].c)}return o}
function rec(c,good){const r=R(c);r.a++;r.last=new Date().toISOString().slice(0,10);if(good){r.ok++;r.st=(r.st||0)+1;r.s=r.st>=2?'mastered':'learning'}else{r.ng++;r.st=0;r.s='review'}save()}
function panel(){const t=todaySet(),g=S.goal,N=[5,10,15,20,30,40];
 const opts=v=>J.map(s=>`<option value="${s.n}"${s.n===v?' selected':''}>Tahap ${s.n}</option>`).join('');
 return `<div class="jpanel"><h4>🎯 Target hafalan harian</h4><p class="muted">Mau hafal berapa kanji sehari? Pilih bebas, atau ketik angkanya: <input class="jnum" type="number" min="1" max="100" value="${g}" onchange="jlGoal(this.value)"></p><div class="pills">${N.map(n=>`<button class="pill${g===n?' active':''}" onclick="jlGoal(${n})">${n}</button>`).join('')}</div>
 <div class="jtoday"><b>Hari ini: ${t.length} kanji</b><div class="jgrid mini">${t.map(c=>`<span class="jch available"><span class="jk">${c}</span></span>`).join('')}</div><div class="bpact"><button class="btn" onclick="jlToday('card')">🃏 Hafalkan</button><button class="btn light" onclick="jlToday('quiz')">✏️ Quiz hari ini</button></div></div></div>
 <div class="jpanel"><h4>🎲 Acak quiz</h4><p class="muted">Soal diacak dari kanji pada tahap yang kamu pilih (mulai dari tahap pertama).</p><div class="rng"><span>Tahap</span><select onchange="jlRqA(this.value)">${opts(S.rq.a)}</select><span>sampai</span><select onchange="jlRqB(this.value)">${opts(S.rq.b)}</select></div><div class="rng"><span>Jumlah soal</span>${[5,10,20,30].map(n=>`<button class="pill${S.rq.n===n?' active':''}" onclick="jlRqN(${n})">${n}</button>`).join('')}</div><button class="btn wide" onclick="jlRand()">🎲 Mulai acak quiz</button></div>`}
window.jlGoal=n=>{S.goal=Math.max(1,Math.min(100,+n||10));save();renderKanji()};
window.jlRqA=v=>{S.rq.a=+v;if(S.rq.b<S.rq.a)S.rq.b=S.rq.a;save();renderKanji()};
window.jlRqB=v=>{S.rq.b=+v;if(S.rq.a>S.rq.b)S.rq.a=S.rq.b;save();renderKanji()};
window.jlRqN=n=>{S.rq.n=n;save();renderKanji()};
window.jlToday=m=>{const t=todaySet();if(!t.length)return;t.forEach(c=>{const r=R(c);if(!r.s)r.s='learning'});save();if(m==='card'){if(window.fdToday)fdToday(t);go('flashcard')}else startRQ(t)};
window.jlRand=()=>{const pool=path.filter(p=>p.stage>=S.rq.a&&p.stage<=S.rq.b).map(p=>p.c);if(pool.length<1)return;startRQ(shuf(pool).slice(0,S.rq.n))};
const rq=document.createElement('section');rq.id='kjrq';rq.className='page';$('kanji').after(rq);
let RQ=null;
function mk(c){const k=info[c],t=['arti','bacaan','kanji'][Math.floor(Math.random()*3)],val=t==='kanji'?c:k[t==='arti'?2:1];
 const pool=[...new Set(K.filter(x=>x[0]!==c&&x[4]===k[4]).map(x=>t==='kanji'?x[0]:x[t==='arti'?2:1]).filter(v=>v&&v!==val))];
 const opts=shuf([val].concat(shuf(pool).slice(0,3)));return{c,t,opts,ok:opts.indexOf(val)}}
function startRQ(list){RQ={q:list.slice(),i:0,ok:0,wrong:[],ans:false,cur:null};drawRQ();go('kjrq')}
window.startRQ=startRQ;
function drawRQ(){const r=RQ,head=(t,p)=>`<div class="subhead"><button class="back" onclick="jlRqExit()">←</button><div><h2>${t}</h2><p>${p||''}</p></div></div>`;
 if(r.i>=r.q.length){if(!r.saved){r.saved=1;S.hist=S.hist.concat({d:new Date().toISOString().slice(0,10),ok:r.ok,n:r.q.length}).slice(-30);save()}
  rq.innerHTML=head('Hasil acak quiz')+`<div class="hero-mini"><h3>Skor ${r.ok} / ${r.q.length}</h3><p>${r.ok===r.q.length?'Sempurna! 🎉':'Terus berlatih. Yang salah masuk "Perlu diulang".'}</p></div>${r.wrong.length?`<div class="jpanel"><h4>Perlu diulang</h4><div class="jgrid mini">${r.wrong.map(c=>`<span class="jch review"><span class="jk">${c}</span><small>${esc(info[c][2].split(/[;/]/)[0])}</small></span>`).join('')}</div></div>`:''}<div class="bpact">${r.wrong.length?`<button class="btn" onclick="startRQ(RQ.wrong)">↻ Ulangi yang salah</button>`:''}<button class="btn light" onclick="jlRand()">🎲 Acak lagi</button></div><button class="btn wide" onclick="jlRqExit()">Selesai</button>`;return}
 const c=r.q[r.i];if(!r.cur)r.cur=mk(c);const m=r.cur,k=info[c];
 const pr=m.t==='arti'?'Apa arti kanji ini?':m.t==='bacaan'?'Bacaan mana yang benar?':'Kanji mana yang berarti: <b>'+esc(k[2])+'</b>?';
 rq.innerHTML=head('Acak quiz','Soal '+(r.i+1)+' / '+r.q.length)+`<div class="progress"><span style="width:${r.i/r.q.length*100}%"></span></div><div class="card jqz"><b>${pr}</b>${m.t==='kanji'?'':`<div class="qk">${c}</div>`}${m.opts.map((o,j)=>`<button class="quizopt${m.t==='kanji'?' bigopt':''}${r.ans?(j===m.ok?' ok':j===r.sel?' bad':''):''}" ${r.ans?'disabled':''} onclick="jlRqAns(${j})">${esc(o)}</button>`).join('')}</div>${r.ans?`<div class="hero-mini"><b>${r.good?'🎉 Benar!':'🌱 Belum tepat'}</b><p>${c} = <b>${esc(k[2])}</b> · bacaan ${esc(k[1])} · contoh ${esc(k[3])}</p></div><button class="btn wide" onclick="jlRqNext()">${r.i<r.q.length-1?'Soal berikutnya →':'Lihat hasil'}</button>`:''}`}
window.jlRqAns=j=>{const r=RQ;if(!r||r.ans)return;r.ans=true;r.sel=j;r.good=j===r.cur.ok;rec(r.cur.c,r.good);if(r.good)r.ok++;else r.wrong.push(r.cur.c);drawRQ()};
window.jlRqNext=()=>{RQ.i++;RQ.ans=false;RQ.cur=null;drawRQ()};
window.jlRqExit=()=>{RQ=null;go('kanji');renderKanji()};

// ---------- validasi (dipakai untuk pengujian) ----------
NQJ.validate=function(){const e=[],ids=new Set(),ord=new Set(),ch=new Set();
 path.forEach(p=>{if(ids.has(p.id))e.push('ID ganda '+p.id);ids.add(p.id);if(ord.has(p.order))e.push('urutan ganda '+p.order);ord.add(p.order);if(ch.has(p.c))e.push('karakter ganda '+p.c);ch.add(p.c);
  if(!info[p.c])e.push('tanpa data '+p.c);else{const k=info[p.c];if(!k[1]||!k[2]||!k[3])e.push('data tak lengkap '+p.c)}});
 path.forEach(p=>p.pre.forEach(r=>{if(!ids.has(r))e.push('prasyarat tidak valid '+p.id)}));
 // siklus: setiap prasyarat harus punya urutan lebih kecil
 path.forEach((p,i)=>p.pre.forEach(r=>{if(path.findIndex(x=>x.id===r)>=i)e.push('siklus '+p.id)}));
 let seen4=false;path.forEach(p=>{if(p.lv!=='N5')seen4=true;else if(seen4)e.push('N5 setelah N4 '+p.c)});
 return {total:path.length,n5:path.filter(p=>p.lv==='N5').length,jembatan:path.filter(p=>p.lv==='Jembatan').length,n4:path.filter(p=>p.lv==='N4').length,stages:J.length,errors:e}};
NQJ.path=path;NQJ.record=rec;NQJ.todaySet=todaySet;NQJ.state=()=>S;
})();
