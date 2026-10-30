// node tools/build-jft-paket.js -> menulis data/jft-paket.js
// Bagian 1 (kosakata & kanji) dibuat dari data aplikasi dengan pengacak berbenih (hasil tetap & berbeda tiap paket); bagian 2 dan 3 ditulis sendiri (tools/jft-paket-src.js).
global.window=global;require('../data/kotoba.js');require('../data/kanji.js');
const SRC=require('./jft-paket-src.js'),fs=require('fs');
const W=NQ_WORDS.map(w=>[w[0],w[1],w[2].replace(/\s*\((I|II|III)\)\s*/,'').trim(),w[3],w[4]]),K=NQ_KANJIS;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hasK=s=>/[\u4e00-\u9fff]/.test(s);
const SECNAME=['Kosakata & Kanji','Tata Bahasa & Ungkapan','Membaca'];
const used=new Set();
function shuf(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mc(R,correct,pool,extra){const d=[...new Set(pool.filter(x=>x&&x!==correct))];const opts=shuf([correct].concat(shuf(d,R).slice(0,3)),R);return Object.assign({o:opts,a:opts.indexOf(correct)},extra)}
function sec0(seed){const R=rng(seed),out=[];
 const bab=w=>{const m=/^Bab (\d+)$/.exec(w[4]);return m?+m[1]:99};
 const cand=W.filter(w=>hasK(w[0])&&w[0].length>=2&&w[0].length<=5&&!/[〜～（(]/.test(w[0])&&bab(w)<=25&&!/[(（]/.test(w[2].replace(/\s*\((I|II|III)\)\s*/,''))&&w[2].length<=30&&!used.has(w[0]));
 const pick=(n,filter)=>{const r=[];for(const w of shuf(cand,R)){if(r.length>=n)break;if(used.has(w[0]))continue;if(filter&&!filter(w))continue;used.add(w[0]);r.push(w)}return r};
 pick(4).forEach(w=>{let pool=W.filter(x=>x[0]!==w[0]&&x[1]!==w[1]&&/^[ぁ-ん]{2,}$/.test(x[1])&&Math.abs(x[1].length-w[1].length)<=1&&bab(x)<=25).map(x=>x[1]);
  const same=pool.filter(r=>r.slice(-1)===w[1].slice(-1));if(same.length>=6)pool=same;
  out.push(mc(R,w[1],pool,{sec:0,q:'Bagaimana cara membaca kata ini?',big:w[0],e:`${w[0]}（${w[1]}）= ${w[2]}.`}))});
 pick(3).forEach(w=>{const pool=W.filter(x=>x[0]!==w[0]&&x[2]!==w[2]&&x[3]===w[3]&&bab(x)<=25&&!/[()（）~～\[\]]/.test(x[2])&&x[2].length<=22).map(x=>x[2]);
  out.push(mc(R,w[2],pool,{sec:0,q:'Apa arti kata ini?',big:w[0],sub:w[1],e:`${w[0]}（${w[1]}）= ${w[2]}.`}))});
 const kc=shuf(K.filter(k=>(k[4]==='N5'||k[4]==='N4')&&!used.has('k'+k[0])),R).slice(0,3);
 kc.forEach(k=>{used.add('k'+k[0]);const pool=K.filter(x=>x[0]!==k[0]&&x[2]!==k[2]).map(x=>x[2]);
  out.push(mc(R,k[2],pool,{sec:0,q:'Apa arti kanji ini?',big:k[0],e:`${k[0]} = ${k[2]} (bacaan: ${k[1]}).`}))});
 return out}
const packs=[],seeds={'2024':2401,'2025':2502,'2026':2603};
Object.keys(SRC).forEach(y=>{const p=SRC[y],R=rng(seeds[y]+7);const s0=sec0(seeds[y]);
 const s1=p.g.map(g=>{const m=mc(R,g.o[g.a],g.o,{sec:1,q:g.q,big:g.big,furi:'cerita',e:g.e,nOpt:4});m.o=shuf(g.o,R);m.a=m.o.indexOf(g.o[g.a]);return m});
 const s2=[];p.r.forEach(r=>r.qs.forEach(q=>{const o=shuf(q[1],R);s2.push({sec:2,q:q[0],big:r.big,furi:'cerita',o,a:o.indexOf(q[1][q[2]]),e:q[3]})}));
 packs.push({id:y,tahun:+y,judul:p.judul,dur:30*60,soal:s0.concat(s1,s2)})});
// validasi
let err=[];packs.forEach(p=>{if(p.soal.length!==30)err.push(p.id+' jumlah '+p.soal.length);
 p.soal.forEach((q,i)=>{if(!q.o||q.o.length!==4||new Set(q.o).size!==4)err.push(p.id+' #'+(i+1)+' opsi tidak 4 unik');if(q.a<0||q.a>3)err.push(p.id+' #'+(i+1)+' jawaban');if(!q.e)err.push(p.id+' #'+(i+1)+' tanpa penjelasan')});
 const keys=p.soal.map(q=>q.q+'|'+q.big);const dup=keys.filter((k,i)=>keys.indexOf(k)!==i);if(dup.length&&false)err.push('dup')});
const allQ=packs.flatMap(p=>p.soal.filter(q=>q.sec===0).map(q=>q.big));if(new Set(allQ).size!==allQ.length)err.push('bagian 1 ada soal ganda antar paket');
fs.writeFileSync(__dirname+'/../data/jft-paket.js','// Paket latihan bergaya JFT Basic per seri tahun. ORISINAL, bukan soal resmi. Dibuat oleh tools/build-jft-paket.js\nwindow.NQ_JFTPAKET='+JSON.stringify(packs)+';\n');
console.log('paket:',packs.map(p=>p.id+':'+p.soal.length).join(' '),'| error:',err.length,err);
packs.forEach(p=>{console.log('--',p.id);p.soal.filter(q=>q.sec===0).slice(0,10).forEach(q=>console.log(' ',q.q,q.big,'|',q.o.join(' / '),'| benar:',q.o[q.a]))});
