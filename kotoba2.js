// Kotoba: favorit, filter "sering salah", pencarian termasuk romaji, halaman detail kata.
(function(){
const U=NQU,L=U.LS,esc=U.esc,$=id=>document.getElementById(id),W=window.NQ_WORDS||[],K=window.NQ_KANJIS||[];
// ===== rentang bab (dipakai Kotoba & Latihan) =====
(function(){const RK='nqrange';let st={f:0,t:0,tam:false};try{st=Object.assign(st,JSON.parse(localStorage.getItem(RK)||'{}'))}catch(e){}
const num=w=>{const m=/^Bab (\d+)$/.exec(w[4]||'');return m?+m[1]:0},cbs=[];
const R=window.NQRange={get:()=>st,test:w=>st.tam?w[4]==='Tambahan':(!st.f||(num(w)>=st.f&&num(w)<=st.t)),
 label:()=>st.tam?'Tambahan':st.f?(st.f===st.t?'Bab '+st.f:'Bab '+st.f+'–'+st.t):'Semua bab',
 set:(f,t,tam)=>{f=+f||0;t=+t||f;if(t<f){const x=f;f=t;t=x}st={f,t,tam:!!tam};try{localStorage.setItem(RK,JSON.stringify(st))}catch(e){}cbs.forEach(c=>c())},
 on:c=>cbs.push(c),
 mount:el=>{const o=Array.from({length:50},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');el.className='rng';
  el.innerHTML=`<span>Bab</span><select class="rf"><option value="">Semua</option>${o}<option value="T">Tambahan</option></select><span>sampai</span><select class="rt">${o}</select>`;
  const rf=el.querySelector('.rf'),rt=el.querySelector('.rt');
  const sync=()=>{rf.value=st.tam?'T':st.f?String(st.f):'';rt.value=st.t?String(st.t):'1';rt.disabled=!st.f};
  rf.onchange=()=>{const v=rf.value;if(v==='')R.set(0,0,false);else if(v==='T')R.set(0,0,true);else R.set(v,Math.max(+v,st.t||+v),false)};
  rt.onchange=()=>R.set(st.f||rt.value,rt.value,false);cbs.push(sync);sync()}};})();
const KJ=/[一-鿿]/g,FK='nqfav',LIM=120;let shown=LIM,wb='';
const fav=()=>new Set(L.get(FK,[]));
const kmap={};K.forEach(k=>kmap[k[0]]=k);
const pills=$('wordpills');
const CATS=['Semua','Kata benda','Kata kerja','Sifat い','Sifat な','Keterangan','Ungkapan'];
if(pills){pills.innerHTML=CATS.map((c,i)=>`<button class="pill${i?'':' active'}" data-c="${c}" onclick="wordFilter('${c}',this)">${c}</button>`).join('')}
if(pills&&!$('rngK')){pills.insertAdjacentHTML('afterend','<div id="rngK"></div><button class="btn wide" id="rlat" onclick="kwLat()"></button>');NQRange.mount($('rngK'))}
NQRange.on(()=>{shown=LIM;renderWords()});
window.kwLat=function(){const c=(wf==='Semua'||wf==='★'||wf==='!')?'':wf;go('latihan');ltStart('kotoba',c)};
if(pills&&!$('pfav')){pills.insertAdjacentHTML('beforeend','<button class="pill" id="pfav" onclick="wordFilter2(\'★\',this)">★ Favorit</button><button class="pill" id="pwr" onclick="wordFilter2(\'!\',this)">Sering salah</button>')}
window.kwBab=function(){};
window.wordFilter2=function(f,b){wf=f;shown=LIM;pills.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderWords()};
const wf0=window.wordFilter;window.wordFilter=function(f,b){shown=LIM;return wf0(f,b)};
window.renderWords=function(){const s=($('wordsearch')?.value||'').trim().toLowerCase(),F=fav(),f=wf;
 const wrong=f==='!'?new Set(U.SRS.wrong().map(r=>r.key)):null;
 const a=W.filter(w=>{if(f==='★'&&!F.has(w[0]))return false;if(wrong&&!wrong.has('k:'+w[0]))return false;
  if(!NQRange.test(w))return false;if(f!=='Semua'&&f!=='★'&&f!=='!'&&w[3]!==f)return false;
  if(!s)return true;return (w[0]+w[1]+w[2]).toLowerCase().includes(s)||U.romaji(w[1]).includes(s)});
 const ro=U.settings().romaji;
 $('wordlist').innerHTML=a.slice(0,shown).map(w=>`<div class="word" onclick="kwOpen('${w[0].replace(/'/g,"\\'")}')"><div class="glyph">${esc(w[0].slice(0,2))}</div><div style="flex:1"><h4>${esc(w[0])}</h4><p>${esc(w[1])}${ro?' · '+esc(U.romaji(w[1])):''} · ${w[2]?esc(w[2]):'<i>(arti belum diisi)</i>'}</p><span class="muted">${esc(w[4])}</span></div><span class="tag">${F.has(w[0])?'★ ':''}${esc(w[3])}</span></div>`).join('')
  +(a.length>shown?`<button class="btn wide" onclick="kwMore()">Tampilkan lebih banyak (${a.length-shown} lagi)</button>`:'')
  ||'<p class="notice">'+(f==='★'?'Belum ada favorit. Buka sebuah kata lalu ketuk ★.':f==='!'?'Belum ada kata yang sering salah.':'Kata tidak ditemukan.')+'</p>'};
window.kwMore=()=>{shown+=LIM;renderWords()};
const dlg=document.createElement('div');dlg.id='kwdlg';dlg.className='kw-ov';dlg.hidden=true;document.querySelector('.app').appendChild(dlg);
dlg.onclick=e=>{if(e.target===dlg)dlg.hidden=true};
window.kwOpen=function(w){const x=W.find(v=>v[0]===w);if(!x)return;const F=fav(),ks=[...new Set(x[0].match(KJ)||[])],
 st=(window.NQ_STORIES||[]).filter(s=>(s.jp+JSON.stringify(s.s)+JSON.stringify(s.vocab)).includes(x[0])),r=U.SRS.all()['k:'+x[0]];
 dlg.hidden=false;dlg.innerHTML=`<div class="kw-card"><button class="back" onclick="kwClose()">✕</button><div class="kz-big kj">${esc(x[0])}</div><p class="kz-sub">${esc(x[1])}${U.settings().romaji?' · '+esc(U.romaji(x[1])):''}</p><h3>${x[2]?esc(x[2]):'<i>(arti belum diisi)</i>'}</h3><p class="muted">${esc(x[3])} · ${esc(x[4])}</p>
 ${ks.length?`<h4 class="kz-h">Kanji di kata ini</h4>${ks.map(c=>kmap[c]?`<div class="word"><div class="glyph" style="font-size:36px">${c}</div><div style="flex:1"><h4>${esc(kmap[c][2])}</h4><p>${esc(kmap[c][1])}</p><span class="muted">${esc(kmap[c][4])}</span></div></div>`:`<p class="muted">${c}: belum ada di daftar kanji aplikasi</p>`).join('')}`:''}
 ${st.length?`<h4 class="kz-h">Muncul di cerita</h4>${st.map(s=>`<p>📖 ${esc(s.id||s.jp)}</p>`).join('')}`:''}
 ${r?`<p class="muted">Latihan: ${r.ok} benar · ${r.ng} salah · ulang berikutnya ${esc(r.due)}</p>`:''}
 <div class="kz-act"><button class="btn" onclick="kwFav('${x[0].replace(/'/g,"\\'")}')">${F.has(x[0])?'★ Hapus favorit':'☆ Favorit'}</button><button class="btn ghost" onclick="kwSrs('${x[0].replace(/'/g,"\\'")}')">+ Ulangi Cerdas</button></div></div>`};
window.kwClose=()=>{dlg.hidden=true;renderWords()};
window.kwFav=w=>{const F=fav();F.has(w)?F.delete(w):F.add(w);L.set(FK,[...F]);kwOpen(w)};
window.kwSrs=w=>{const x=W.find(v=>v[0]===w);if(!x)return;const a=U.SRS.all();if(!a['k:'+w])U.SRS.rec('k:'+w,false,{type:'kotoba',lb:x[0],rd:x[1],mn:x[2]});kwOpen(w)};
const cntPills=()=>{const base=W.filter(NQRange.test);pills.querySelectorAll('.pill[data-c]').forEach(b=>{const c=b.dataset.c,n=c==='Semua'?base.length:base.filter(w=>w[3]===c).length;b.textContent=c+' · '+n});const cc=(wf==='Semua'||wf==='★'||wf==='!'||!wf)?'':wf,nn=base.filter(w=>!cc||w[3]===cc).length,rl=$('rlat');if(rl){rl.textContent='✏️ Latihan · '+NQRange.label()+(cc?' · '+cc:'')+' ('+nn+' kata)';rl.disabled=nn<4}};
const rw0=window.renderWords;window.renderWords=function(){rw0();cntPills()};
renderWords();
})();
