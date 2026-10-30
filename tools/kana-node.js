// Mesin tampilan teks Jepang untuk cerita: parser penanda, hiragana->katakana (hanya kata terpilih), romaji (Hepburn).
// Aturan penting: partikel, okurigana, dan akhiran kata kerja TIDAK pernah diubah ke katakana.
(function(){
const hira2kata=s=>s.replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const kata2hira=s=>s.replace(/[\u30a1-\u30f6]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const R={あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ゔ:'vu'};
const C={きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',てぃ:'ti',でぃ:'di',ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',うぃ:'wi',うぇ:'we',うぉ:'wo',しぇ:'she',じぇ:'je',ちぇ:'che'};
// Hiragana (atau katakana) -> romaji. Bukan kanji: kanji harus sudah diganti bacaannya.
function toRomaji(str){const s=kata2hira(str.replace(/ー/g,'ー'));let out='',i=0,dbl=false;
 while(i<s.length){const ch=s[i],two=s.substr(i,2);
  if(ch==='っ'){dbl=true;i++;continue}
  let r=null,len=1;
  if(C[two]){r=C[two];len=2}else if(R[ch]){r=R[ch]}
  else if(ch==='ー'){const m=out.match(/[aiueo]$/);out+=m?m[0]:'';i++;continue}
  else{out+=ch;dbl=false;i++;continue}
  if(ch==='ん'){const nx=s[i+1];r=(nx&&/[あいうえおやゆよ]/.test(nx))?"n'":'n'}
  if(dbl){r=(r.startsWith('ch')?'t':r[0])+r;dbl=false}
  out+=r;i+=len}
 return out}
// Parser penanda -> token
function parse(src){const re=/\{([^|}]+)\|([^}]+)\}|\[([^\]]+)\]|<([^>]+)>/g,t=[];let last=0,m;
 while((m=re.exec(src))){if(m.index>last)t.push({t:'x',s:src.slice(last,m.index)});
  if(m[1]!==undefined)t.push({t:'r',s:m[1],rt:m[2]});else if(m[3]!==undefined)t.push({t:'c',s:m[3]});else t.push({t:'p',s:m[4]});last=re.lastIndex}
 if(last<src.length)t.push({t:'x',s:src.slice(last)});return t}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// mode: 'asli' | 'hira' | 'kata'
function render(src,mode){return parse(src).map(k=>{
 if(k.t==='r'){if(mode==='asli')return esc(k.s);const rt=mode==='kata'?hira2kata(k.rt):k.rt;return `<ruby>${esc(k.s)}<rt>${esc(rt)}</rt></ruby>`}
 if(k.t==='c')return esc(mode==='kata'?hira2kata(k.s):k.s);
 return esc(k.s)}).join('')}
// Teks polos (tanpa penanda), mis. untuk soal kuis
const plain=src=>parse(src).map(k=>k.s).join('');
// Romaji kalimat: kanji diganti bacaan; spasi di antara kata isi/partikel (akhiran menempel pada kata sebelumnya)
function romaji(src){let out='';parse(src).forEach(k=>{let kana,sp=true;
  if(k.t==='r')kana=k.rt;else if(k.t==='c')kana=k.s;
  else if(k.t==='p'){kana=k.s==='は'?'わ':k.s==='へ'?'え':k.s}else{kana=k.s;sp=false;if(/^「/.test(kana)&&out&&!/\s$/.test(out))out+=' '}
  const r=toRomaji(kana);if(sp&&out&&!/[\s「(]$/.test(out))out+=' ';out+=r});
 return out.replace(/\s+([、。」,.!?])/g,'$1').replace(/、/g,',').replace(/。/g,'.').replace(/「/g,'"').replace(/」/g,'"').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase())}
// Kanji yang dipakai (dari bagian kanji pada penanda ruby)
const kanjiOf=src=>{const o=[];parse(src).forEach(k=>{if(k.t==='r')[...k.s].forEach(c=>{if(/[\u4e00-\u9fff]/.test(c)&&o.indexOf(c)<0)o.push(c)})});return o};
window.NQKana={hira2kata,kata2hira,toRomaji,parse,render,plain,romaji,kanjiOf};
})();
