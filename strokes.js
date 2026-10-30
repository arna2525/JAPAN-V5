// Urutan goresan kanji (animasi), halaman detail kanji, dan mode "Radikal".
// Data goresan: KanjiVG (https://kanjivg.tagaini.net), hak cipta Ulrich Apel, lisensi CC BY-SA 3.0 (lihat README & data/strokes.js).
(function(){
const SD=window.NQ_STROKES||{},K=window.NQ_KANJIS||[],BU=window.NQ_BUSHU||{},BN=window.NQ_BUSHUNAME||{},W=window.NQ_WORDS||[],$=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const info={};K.forEach(k=>info[k[0]]=k);
const first=s=>String(s||'').split(/[;/]/)[0];
const rdTxt=k=>(window.NQRD?window.NQRD(k):esc(k[1]));
// ---------- penampil urutan goresan ----------
let V=null;
function stopTimers(){if(V&&V.t)V.t.forEach(clearTimeout);if(V)V.t=[]}
function startPt(d){const m=/^[Mm]\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/.exec(d);return m?[+m[1],+m[2]]:[0,0]}
function viewerHTML(c){const s=SD[c];if(!s)return `<p class="notice">Data urutan goresan untuk ${esc(c)} belum tersedia.</p>`;
 const ps=s.d.map((d,i)=>`<path class="stg" data-i="${i}" d="${d}" pathLength="1"/>`).join('');
 const gh=s.d.map(d=>`<path d="${d}"/>`).join('');
 const nm=s.d.map((d,i)=>{const p=startPt(d);return `<text class="stn" data-i="${i}" x="${(p[0]-4).toFixed(1)}" y="${(p[1]-2).toFixed(1)}">${i+1}</text>`}).join('');
 return `<div class="stwrap"><div class="stbox"><svg class="stsvg" viewBox="0 0 109 109" role="img" aria-label="Urutan goresan ${esc(c)}"><line class="sgd" x1="54.5" y1="4" x2="54.5" y2="105"/><line class="sgd" x1="4" y1="54.5" x2="105" y2="54.5"/><g class="stghost">${gh}</g><g class="stink">${ps}</g><g class="stnums">${nm}</g></svg></div>
 <div class="stlbl">Goresan 0 / ${s.d.length}</div>
 <div class="stctl"><button class="btn" onclick="stPlay()">▶ Putar</button><button class="btn light" onclick="stStep(-1)" aria-label="Goresan sebelumnya">◀</button><button class="btn light" onclick="stStep(1)" aria-label="Goresan berikutnya">▶</button><button class="btn light" onclick="stAll()">Semua</button></div>
 <label class="stchk"><input type="checkbox" class="stnumchk" onchange="stNums(this.checked)"> Tampilkan nomor goresan</label></div>`}
function mount(el,c){stopTimers();V=null;const box=typeof el==='string'?$(el):el;if(!box)return;box.innerHTML=viewerHTML(c);if(!SD[c])return;
 V={c,root:box,n:0,N:SD[c].d.length,t:[]};setTimeout(()=>play(),150)}
const els=()=>V&&V.root?[...V.root.querySelectorAll('.stg')]:[];
function setAll(shown,cur){els().forEach((p,i)=>{p.style.transition='none';p.classList.toggle('cur',i===cur);p.style.strokeDashoffset=(i<shown)?0:1});}
function lbl(n){const e=V&&V.root&&V.root.querySelector('.stlbl');if(e)e.textContent='Goresan '+n+' / '+V.N}
function drawOne(i,anim){const p=els()[i];if(!p)return;p.getBoundingClientRect();p.style.transition=anim?'stroke-dashoffset .65s ease':'none';p.style.strokeDashoffset=0}
function play(){if(!V)return;stopTimers();setAll(0,-1);V.n=0;lbl(0);const E=els();
 E.forEach((p,i)=>{V.t.push(setTimeout(()=>{if(!V)return;E.forEach(x=>x.classList.remove('cur'));p.classList.add('cur');drawOne(i,true);V.n=i+1;lbl(i+1)},i*750+80))});
 V.t.push(setTimeout(()=>{E.forEach(x=>x.classList.remove('cur'))},E.length*750+700))}
function step(d){if(!V)return;stopTimers();const n=Math.max(0,Math.min(V.N,V.n+d));V.n=n;setAll(n-1,n-1);if(n>0){const p=els()[n-1];p.style.strokeDashoffset=1;drawOne(n-1,true)}lbl(n)}
function all(){if(!V)return;stopTimers();V.n=V.N;setAll(V.N,-1);lbl(V.N)}
window.stPlay=play;window.stStep=step;window.stAll=all;
window.stNums=on=>{const g=V&&V.root&&V.root.querySelector('.stnums');if(g)g.classList.toggle('on',!!on)};
window.NQStroke={mount,has:c=>!!SD[c],count:c=>SD[c]?SD[c].d.length:0,components:c=>SD[c]?SD[c].c:[]};

// ---------- halaman detail kanji ----------
const kd=document.createElement('section');kd.id='kdetail';kd.className='page';$('kanji').after(kd);
const rdp=document.createElement('section');rdp.id='raddetail';rdp.className='page';kd.after(rdp);
let CTX={list:[],i:0,back:'kanji'};
const lvTag=l=>`<span class="lvb lv-${esc((l||'').replace('+','p'))}">${esc(l==='N3+'?'Lain':l||'')}</span>`;
window.kdOpen=function(c,ctx){if(!info[c]&&!SD[c])return;if(ctx)CTX=ctx;else CTX={list:[c],i:0,back:$('kanji').classList.contains('active')?'kanji':(CTX.back||'kanji')};
 const k=info[c];let i=CTX.list.indexOf(c);if(i<0){CTX.list=[c];i=0}CTX.i=i;draw(c,k);go('kdetail');kd.scrollTop=0};
function draw(c,k){const b=BU[c],comps=NQStroke.components(c),pr=CTX.list[CTX.i-1],nx=CTX.list[CTX.i+1];
 const words=k?W.filter(w=>w[0].includes(c)&&w[2]).slice(0,10):[];
 kd.innerHTML=`<div class="subhead"><button class="back" onclick="kdBack()">←</button><div><h2>Detail kanji</h2><p>${k?lvTag(k[4])+' ':''}${NQStroke.count(c)} goresan</p></div></div>
 <div class="kdhero"><span class="kdbig">${esc(c)}</span><div><h3>${k?esc(k[2]):'—'}</h3>${k?`<div class="kdread">${rdTxt(k)}</div>`:''}</div></div>
 <div class="sec"><h3>Cara menulis</h3></div><div id="kdstroke"></div>
 ${k?`<div class="kdinfo"><div><small>Contoh kata</small><b>${esc(k[3])}</b></div>${b?`<div><small>Bushu</small><b>${esc(b)} ${esc((BN[b]||['',''])[1]||'')}</b></div>`:''}</div>`:''}
 ${comps.length?`<div class="sec"><h3>Komponen penyusun</h3></div><div class="kdcomp">${comps.map(x=>`<button class="kdc" ${SD[x]&&BN[x]?`onclick="radOpen('${x}')"`:''}><b>${esc(x)}</b><small>${esc((BN[x]||['',''])[1]||'')}</small></button>`).join('')}</div>`:''}
 ${words.length?`<div class="sec"><h3>Kosakata dengan ${esc(c)}</h3></div>${words.map(w=>`<div class="word"><div style="flex:1"><h4>${esc(w[0])}</h4><p>${esc(w[1])} · ${esc(w[2])}</p></div></div>`).join('')}`:''}
 ${CTX.list.length>1?`<div class="bpnav"><button class="btn light" ${pr?'':'disabled'} onclick="kdOpen('${pr||''}')">‹ ${pr||''}</button><span class="muted">${CTX.i+1} / ${CTX.list.length}</span><button class="btn light" ${nx?'':'disabled'} onclick="kdOpen('${nx||''}')">${nx||''} ›</button></div>`:''}
 <p class="notice">Urutan goresan: KanjiVG (Ulrich Apel), lisensi CC BY-SA 3.0 — kanjivg.tagaini.net</p>`;
 NQStroke.mount('kdstroke',c)}
window.kdBack=function(){stopTimers();const b=CTX.back||'kanji';go(b);if(b==='kanji'&&window.renderKanji)renderKanji()};

// ---------- mode Radikal ----------
const rads=Object.keys(BN).filter(r=>SD[r]);
const strokeN=r=>NQStroke.count(r);
function related(r){const o=[];K.forEach(k=>{if(BU[k[0]]===r||(SD[k[0]]&&SD[k[0]].c.includes(r)&&k[0]!==r))o.push(k[0])});
 const rank={N5:0,N4:1,N3:2,'N3+':3};return o.sort((a,b)=>(rank[info[a][4]]??9)-(rank[info[b][4]]??9))}
const REL={};rads.forEach(r=>REL[r]=related(r));
window.NQRad={html(){const g={};rads.forEach(r=>(g[strokeN(r)]=g[strokeN(r)]||[]).push(r));
 return `<div class="notice" style="text-align:left">Ketuk radikal untuk melihat cara menulisnya dan kanji yang memakainya. Ketuk kanji untuk melihat urutan goresannya.</div>`+Object.keys(g).map(Number).sort((a,b)=>a-b).map(n=>`<div class="radgrp"><h4 class="radh"><span>${n}</span> goresan</h4><div class="radgrid">${g[n].map(r=>`<button class="radt" onclick="radOpen('${r}')"><b>${esc(r)}</b><small>${esc((BN[r]||['',''])[1])}</small><i>${REL[r].length}</i></button>`).join('')}</div></div>`).join('')},
 related:r=>REL[r]||[],radicals:()=>rads};
window.radOpen=function(r){if(!SD[r])return;const ks=REL[r]||[],n=BN[r]||['',''];
 rdp.innerHTML=`<div class="subhead"><button class="back" onclick="radBack()">←</button><div><h2>Radikal ${esc(r)}</h2><p>${esc(n[1])}${n[0]?' · '+esc(n[0]):''} · ${strokeN(r)} goresan</p></div></div>
 <div class="sec"><h3>Cara menulis</h3></div><div id="radstroke"></div>
 <div class="sec"><h3>Kanji dengan radikal ini (${ks.length})</h3></div>${ks.length?`<div class="radk">${ks.map(c=>`<button class="radkb" onclick='kdOpen("${c}",{list:${JSON.stringify(ks)},i:${ks.indexOf(c)},back:"raddetail"})'>${lvTag(info[c][4])}<b>${esc(c)}</b><small>${esc(first(info[c][2]))}</small></button>`).join('')}</div>`:'<p class="notice">Belum ada kanji di aplikasi yang memakai radikal ini.</p>'}
 <p class="notice">Urutan goresan: KanjiVG (Ulrich Apel), CC BY-SA 3.0.</p>`;
 NQStroke.mount('radstroke',r);go('raddetail');rdp.scrollTop=0};
window.radBack=function(){stopTimers();go('kanji');if(window.renderKanji)renderKanji()};

// ---------- sambungkan ke jalur kanji (detail jalur) ----------
const jo=window.jlOpen;
if(typeof jo==='function'&&window.NQJ){window.jlOpen=function(i,fq){jo(i,fq);const p=NQJ.path[i];if(!p)return;const d=$('kjdetail'),big=d&&d.querySelector('.jbig');if(!big||d.querySelector('#jlstroke'))return;
 const w=document.createElement('div');w.id='jlstroke';w.className='jlstroke';big.after(w);
 const ctxList=NQJ.path.map(x=>x.c);const more=document.createElement('button');more.className='btn light wide';more.style.margin='8px 0';more.textContent='Detail lengkap & kosakata →';more.onclick=()=>kdOpen(p.c,{list:ctxList,i,back:'kjdetail'});
 w.appendChild(document.createElement('div')).id='jlstrokebox';NQStroke.mount('jlstrokebox',p.c);w.appendChild(more)}}
})();
