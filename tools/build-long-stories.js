// node tools/build-long-stories.js  -> menulis data/stories-long.js (romaji dibuat otomatis) dan menampilkan pemeriksaan.
global.window=global;require('./kana-node.js');const K=NQKana;const fs=require('fs');
const SRC=require('./long-stories-src.js');
const PUNCT=s=>s.replace(/「/g,'"').replace(/」/g,'"').replace(/、/g,',').replace(/。/g,'.').replace(/！/g,'!').replace(/？/g,'?');
const PR={'での':'dewa'.replace('dewa','deno'),'でも':'demo','では':'dewa','には':'niwa','とは':'towa','からは':'karawa','から':'kara','まで':'made','より':'yori','は':'wa','が':'ga','を':'o','に':'ni','で':'de','と':'to','の':'no','も':'mo','へ':'e','や':'ya'};
const ALT='(での|でも|では|には|とは|からは|から|まで|より|は|が|を|に|で|と|の|も|へ|や)';
const RE_MARK=new RegExp('^(.*[\\]》ァ-ヶー])'+ALT+'$');            // partikel setelah kanji[ruby], 《kata》, atau katakana
const RE_WL=/^(.*(?:たち|おれい|わたし|こと|おみやげ|となり|とき|ため|ひとり|ふたつ|だち|さん|さい|いっぱい|すぐ|そう|それ))(の|に|で|と|も)$/;
const RE_OKU=/^(.*\][ぁ-ん]{1,2})(の|に|で|と|も)$/;
const RE_VT=/^(.{2,}[るくう])(と)$/;
const RE_DESU=/^(.+?)(です|でした)(か|ね|よ|が|よね)?$/;
const RE_KANA=new RegExp('^(.+?)(では|には|とは|からは|は|が|を|へ)$'); // partikel khas setelah kana biasa
function tokRo(core){return K.toRomaji(core.replace(/([一-鿿々]+)\[([^\]]+)\]/g,'$2').replace(/[《》]/g,''))}
function ro(t){const flags=[];
 const toks=t.replace(/([、。！？」])/g,'$1 ').replace(/(「)/g,' $1').split(/\s+/).filter(Boolean);
 const parts=[];
 toks.forEach(tok=>{let lead='',trail='',x=tok;
  if(x.startsWith('「')){lead='"';x=x.slice(1)}
  const m=x.match(/^(.*?)([」、。！？]*)$/);x=m[1];trail=PUNCT(m[2]);
  if(x===''){parts.push((lead+trail));return}
  const NOSPLIT=['子[こ]ども'];let a=(PR[x]||NOSPLIT.includes(x))?null:(x.match(RE_MARK)||(/[ぁ-ん]$/.test(x)?x.match(RE_KANA):null));
  if(!a&&!NOSPLIT.includes(x)){const w=x.match(RE_WL);if(w)a=w;else{const o=x.match(RE_OKU);if(o&&!/[んっ]$/.test(o[1]))a=o;else{const v=x.match(RE_VT);if(v&&!PR[x])a=v}}}
  const dm=!a&&x.match(RE_DESU);
  if(dm&&dm[1]){parts.push(lead+tokRo(dm[1]));parts.push(({'です':'desu','でした':'deshita'})[dm[2]]+(dm[3]?'':trail));if(dm[3])parts.push(({'か':'ka','ね':'ne','よ':'yo','が':'ga','よね':'yone'})[dm[3]]+trail);return}
  if(a&&a[1]&&a[1].length>=1){const core=a[1],pt=a[2];
    // "ごちそうを" dst: core hiragana murni berakhiran partikel-bukan? aman karena RE_KANA hanya は が を へ
    parts.push(lead+tokRo(core));parts.push(PR[pt]+trail);
  }else if(PR[x]){parts.push(lead+PR[x]+trail)}else{parts.push(lead+tokRo(x)+trail)}
  if(/は/.test(x)&&!(a&&a[2]&&/は/.test(a[2]))&&!/^は|^おは|^はじ|^はた|^はこ|^はな|^はは|^はし/.test(x))flags.push(tok)});
 parts.forEach((p,i)=>{if(p==='deno')parts[i]='de no'});let r='';parts.forEach(p=>{if(!r)r=p;else if(/^[,.!?]/.test(p)||/^"[,.!?]/.test(p)&&false)r+=p;else r+=' '+p});
 r=r.replace(/ ([,.!?])/g,'$1').replace(/([!?.,]) "(?=\s|$)/g,'$1"').replace(/\s+/g,' ').trim();
 r=r.replace(/([a-z])(desu|deshita)(?![a-z])/g,'$1 $2').replace(/(mashita|masu|masen|deshita|desu)(ka|ne|yo)(?![a-z])/g,'$1 $2');r=r.replace(/([.!?]\s+)("?)([a-z])/g,(m,a,q,c)=>a+q+c.toUpperCase());
 r=r.replace(/^("?)([a-z])/,(m,q,c)=>q+c.toUpperCase());return{r,flags}}
let flagged=[],probs=[];
const out=SRC.map(s=>{
 s.s.forEach((x,i)=>{if(!x[2]||!x[1])probs.push(s.id+' kalimat '+(i+1)+' kosong')});
 s.quiz.forEach((q,i)=>{if(q.o.length!==4||new Set(q.o).size!==4||q.a<0||q.a>3)probs.push(s.id+' kuis '+(i+1)+' opsi/jawaban tidak valid')});
 return{id:s.id,jp:s.jp,idn:s.idn,level:s.level,tema:s.tema,sumber:s.sumber,lisensi:s.lisensi,
  s:s.s.map(x=>{const r=ro(x[1]);if(r.flags.length)flagged.push(s.id+': '+r.flags.join(' '));const o={t:x[1],ro:r.r,id:x[2]};if(x[0])o.bab=x[0];return o}),
  vocab:s.vocab,quiz:s.quiz}});
fs.writeFileSync(__dirname+'/../data/stories-long.js','// Cerita panjang orisinal (dibuat oleh tools/build-long-stories.js dari tools/long-stories-src.js).\nwindow.NQ_STORIES=(window.NQ_STORIES||[]).concat('+JSON.stringify(out)+');\n');
console.log('cerita:',out.map(o=>o.id+' '+o.s.length+' kalimat').join(' | '));
console.log('masalah struktur:',probs.length,probs);console.log('token dgn は di tengah (cek manual):',flagged.length,flagged);
// daftar ruby untuk diperiksa
const rub={};SRC.forEach(s=>s.s.forEach(x=>{(x[1].match(/([一-鿿々]+)\[([^\]]+)\]/g)||[]).forEach(m=>{const mm=m.match(/^(.+)\[(.+)\]$/);rub[mm[1]+'|'+mm[2]]=1})}));
fs.writeFileSync('/tmp/ruby.json',JSON.stringify(Object.keys(rub)));console.log('pasangan kanji[bacaan] unik:',Object.keys(rub).length);
console.log('contoh romaji:');out.forEach(o=>console.log(' ',o.s[1].ro,'|',o.s[5].ro));
