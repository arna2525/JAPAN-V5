// Flashcard bebas pilih: kotoba (rentang bab + jenis), kanji (rentang tahap jalur), masih sulit, hafalan hari ini.
(function(){
const $=id=>document.getElementById(id),W=window.NQ_WORDS||[],K=window.NQ_KANJIS||[],J=window.NQ_JALUR||[],KEY='nqfd';
let FD={src:'kotoba',cat:'',shuf:false,ts:1,te:1,today:[]};
try{FD=Object.assign(FD,JSON.parse(localStorage.getItem(KEY))||{})}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(FD))}catch(e){}};
const shuf=a=>a.slice().sort(()=>Math.random()-.5),info={},inPath=new Set();
K.forEach(k=>info[k[0]]=k);J.forEach(s=>[...s.k].forEach(c=>inPath.add(c)));
const KC=c=>[c,info[c][1],info[c][2]];
let cards=[],OPEN=false;
// ukuran teks menyesuaikan panjang (frasa panjang tidak lagi memenuhi layar)
const len=el=>[...(el.textContent||'').replace(/\s/g,'')].length,sm=()=>innerHeight<700?.8:1;
function fit(){const q=(s,f)=>{const e=document.querySelector('#flashcard .flash '+s);if(e)e.style.setProperty('font-size',Math.round(f(len(e))*sm())+'px','important')};
 q('.kanji',n=>n<=1?96:n<=2?80:n<=3?68:n<=4?58:n<=6?46:n<=9?36:n<=13?30:n<=18?26:22);
 q('.reading',n=>n<=8?32:n<=14?26:n<=22?21:18);q('.meaning',n=>n<=18?26:n<=36?22:18);
 const k=document.querySelector('#flashcard .flash .kanji');if(k){k.style.lineHeight='1.3';k.style.overflowWrap='anywhere'}}
function fitQ(){const e=document.querySelector('#latihan .qword');if(e)e.style.setProperty('font-size',Math.round((len(e)<=4?46:len(e)<=8?36:len(e)<=14?28:len(e)<=22?22:18)*sm())+'px','important')}

function build(){let c=[];
 if(FD.src==='kotoba')c=W.filter(w=>NQRange.test(w)&&(!FD.cat||(FD.cat==='Sifat'?/^Sifat/.test(w[3]):w[3]===FD.cat))).map(w=>[w[0],w[1],w[2]]);
 else if(FD.src==='kanji'){const ch=[];J.forEach(s=>{if(s.n>=FD.ts&&s.n<=FD.te)ch.push(...s.k)});if(FD.te>J.length)K.forEach(k=>{if(!inPath.has(k[0]))ch.push(k[0])});c=ch.filter(x=>info[x]).map(KC)}
 else if(FD.src==='sulit'){const h=typeof saved!=='undefined'?saved.hard:[];c=W.filter(w=>h.includes(w[0])).map(w=>[w[0],w[1],w[2]]).concat(K.filter(k=>h.includes(k[0])).map(k=>[k[0],k[1],k[2]]))}
 else if(FD.src==='today')c=FD.today.filter(x=>info[x]).map(KC);
 return FD.shuf?shuf(c):c}
window.currentDeck=function(){return cards};
const P=document.createElement('div');P.id='fdpanel';$('flashcard').querySelector('.subhead').after(P);
const slot=document.createElement('div');NQRange.mount(slot);
function desc(){return FD.src==='kotoba'?(NQRange.get().f||NQRange.get().tam?NQRange.label()+' · ':'')+(FD.cat?(FD.cat==='Sifat'?'Kata sifat':FD.cat):'Semua jenis'):FD.src==='kanji'?(FD.te>J.length||FD.ts>J.length?'Kanji lainnya':'Tahap '+FD.ts+(FD.te>FD.ts?'–'+Math.min(FD.te,J.length):'')):FD.src==='sulit'?'Masih sulit':'Hafalan hari ini'}
function ui(){const T=[['kotoba','Kotoba'],['kanji','Kanji'],['sulit','Masih sulit'],['today','Hari ini']];
 const opt=v=>J.map(s=>`<option value="${s.n}"${s.n===v?' selected':''}>Tahap ${s.n}</option>`).join('')+`<option value="${J.length+1}"${v>J.length?' selected':''}>Lainnya</option>`;
 let h=`<div class="fdbar"><span id="fdinfo"></span><span><button class="pill" onclick="fdOpen()">${OPEN?'✓ Tutup':'⚙️ Pilih materi'}</button> <button class="pill${FD.shuf?' active':''}" onclick="fdShuf()">🔀</button></span></div>`;
 if(OPEN)h+=`<div class="pills">${T.map(t=>`<button class="pill${FD.src===t[0]?' active':''}" onclick="fdSrc('${t[0]}')">${t[1]}</button>`).join('')}</div>`;
 if(OPEN&&FD.src==='kotoba')h+=`<div id="fdslot"></div><div class="pills">${[['','Semua'],['Kata benda','Benda'],['Kata kerja','Kerja'],['Sifat','Sifat'],['Keterangan','Ket.'],['Ungkapan','Ungk.']].map(c=>`<button class="pill${FD.cat===c[0]?' active':''}" onclick="fdCat('${c[0]}')">${c[1]}</button>`).join('')}</div>`;
 if(OPEN&&FD.src==='kanji')h+=`<div class="rng"><span>Tahap</span><select onchange="fdTs(this.value)">${opt(FD.ts)}</select><span>sampai</span><select onchange="fdTe(this.value)">${opt(FD.te)}</select></div>`;
 P.innerHTML=h;const s=$('fdslot');if(s)s.replaceWith(slot)}
function apply(){cards=build();ci=0;showCard();const i=$('fdinfo');if(i)i.textContent=cards.length+' kartu · '+desc()}
const all=()=>{save();ui();apply()};
window.fdOpen=()=>{OPEN=!OPEN;ui();const i=$('fdinfo');if(i)i.textContent=cards.length+' kartu · '+desc()};
window.fdSrc=s=>{if(s==='today'&&!FD.today.length){FD.src='kanji'}else FD.src=s;all()};
window.fdCat=c=>{FD.cat=c;all()};window.fdShuf=()=>{FD.shuf=!FD.shuf;all()};
window.fdTs=v=>{FD.ts=+v;if(FD.te<FD.ts)FD.te=FD.ts;all()};window.fdTe=v=>{FD.te=+v;if(FD.ts>FD.te)FD.ts=FD.te;all()};
window.fdToday=l=>{FD.today=l;FD.src='today';all()};
NQRange.on(()=>{if(FD.src==='kotoba')all()});
const rc=window.rateCard;window.rateCard=function(k){const d=cards[ci];rc(k);if(d&&/^[一-鿿々]$/.test(d[0])&&window.NQJ&&NQJ.record)NQJ.record(d[0],k)};
const sc=window.showCard;window.showCard=function(){sc();fit();const i=$('fdinfo');if(i)i.textContent=cards.length+' kartu · '+desc()};
const fc=window.flipCard;if(fc)window.flipCard=function(){fc.apply(this,arguments);fit()};
const rq=window.renderQ;if(rq)window.renderQ=function(){rq.apply(this,arguments);fitQ()};
if(FD.src==='today'&&!FD.today.length)FD.src='kotoba';
ui();apply();
})();
