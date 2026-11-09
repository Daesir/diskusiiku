(function(){
'use strict';
const $=s=>document.querySelector(s);
const REDUCED=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const MAX=5;
const OVER={over:true};
let S={hearts:MAX,mistakes:0};
let P={};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------- Suara ---------- */
let actx=null,soundOn=true;
function beep(f,d,type,v){
  if(!soundOn)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended')actx.resume();
    const o=actx.createOscillator(),g=actx.createGain();
    o.type=type||'square';o.frequency.value=f;g.gain.value=v||0.02;
    o.connect(g);g.connect(actx.destination);
    o.start();o.stop(actx.currentTime+(d||0.04));
  }catch(e){}
}

/* ---------- Piksel ---------- */
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function shade(hex,a){
  const n=parseInt(hex.slice(1),16);
  const cl=v=>Math.max(0,Math.min(255,v));
  const r=cl((n>>16)+a),g=cl(((n>>8)&255)+a),b=cl((n&255)+a);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
const CH={
  hakim:{name:'Hakim Sepuh',role:'Hakim Ketua',tag:'#f2b632',pitch:170,scene:'hakim',skin:'#e6bd97',suit:'#1d1b2a',hair:'#f1efe9',style:'hakim'},
  bima:{name:'Bima',role:'Pengacara',tag:'#6fa8ff',pitch:330,scene:'meja',skin:'#f0c69c',suit:'#2b5aa3',hair:'#2a1b14',style:'spiky'},
  kinan:{name:'Jaksa Kinan',role:'Jaksa',tag:'#ff8fa0',pitch:260,scene:'meja',skin:'#d6a173',suit:'#6e2438',hair:'#241a2b',style:'bob'},
  dinda:{name:'Dinda',role:'Saksi',tag:'#8fe3a4',pitch:400,scene:'saksi',skin:'#eebf98',suit:'#f2f2f2',hair:'#1b1b1b',hijab:'#bcd0ee',style:'hijab'},
  raka:{name:'Pak Raka',role:'Saksi',tag:'#e6b27a',pitch:220,scene:'saksi',skin:'#c99468',suit:'#8c5a2c',hair:'#7d7d85',style:'glasses'}
};
const pctx=$('#portrait').getContext('2d'),bctx=$('#bg').getContext('2d'),fctx=$('#fg').getContext('2d');
let cur={key:'hakim',emo:'n',open:false},curScene='';

function drawScene(kind){
  const b=bctx,f=fctx;
  b.clearRect(0,0,160,90);f.clearRect(0,0,160,90);
  R(b,0,0,160,62,'#cdb98f');
  for(let i=0;i<160;i+=20)R(b,i,10,1,46,'#bca77c');
  R(b,0,0,160,8,'#8f6b3e');R(b,0,8,160,2,'#6e4f2a');
  R(b,0,56,160,6,'#8f6b3e');R(b,0,56,160,1,'#a98150');
  R(b,0,62,160,28,'#6d4c2f');
  for(let y=64;y<90;y+=6)R(b,0,y,160,1,'#5d3f26');
  if(kind==='hakim'){
    R(b,70,12,20,20,'#d9a937');R(b,72,10,16,24,'#d9a937');R(b,68,14,24,16,'#d9a937');
    R(b,74,14,12,16,'#f3d57a');
    R(b,75,18,10,1,'#8f6b3e');R(b,79,18,2,10,'#8f6b3e');R(b,74,20,4,1,'#8f6b3e');R(b,82,20,4,1,'#8f6b3e');R(b,77,28,6,1,'#8f6b3e');
    R(f,12,66,136,24,'#5a3a1f');R(f,8,64,144,4,'#8a5d31');
    for(let i=0;i<5;i++)R(f,26+i*26,70,2,20,'#4a2f18');
  }else{
    [18,118].forEach(wx=>{
      R(b,wx,14,24,34,'#8f6b3e');R(b,wx+2,16,20,30,'#a7d2ee');
      R(b,wx+11,16,2,30,'#8f6b3e');R(b,wx+2,30,20,2,'#8f6b3e');
    });
    if(kind==='saksi'){
      R(f,32,72,96,18,'#5a3a1f');R(f,28,70,104,3,'#8a5d31');
      R(f,52,75,1,15,'#4a2f18');R(f,107,75,1,15,'#4a2f18');
    }else{
      R(f,0,75,160,15,'#5a3a1f');R(f,0,73,160,3,'#8a5d31');R(f,0,82,160,1,'#4a2f18');
    }
  }
}

function drawChar(){
  const c=CH[cur.key],x=pctx,emo=cur.emo;
  x.clearRect(0,0,64,64);
  const sk=c.skin,skS=shade(sk,-30);
  const m='#5a2a2a',ey='#1a1a1a';
  const br=c.style==='hakim'?'#8d8984':shade(c.hair,-15);
  // belakang
  if(c.style==='hijab')R(x,10,8,44,42,c.hijab);
  if(c.style==='bob')R(x,12,10,40,38,c.hair);
  if(c.style!=='hijab')R(x,27,38,10,10,skS);
  // badan
  switch(c.style){
    case 'hakim':
      R(x,6,46,52,18,c.suit);R(x,6,46,52,2,'#d9a937');R(x,27,44,10,14,'#f5f5f5');R(x,29,47,6,1,'#cfcfcf');R(x,29,50,6,1,'#cfcfcf');break;
    case 'spiky':
      R(x,6,46,52,18,c.suit);R(x,20,46,6,16,shade(c.suit,-30));R(x,38,46,6,16,shade(c.suit,-30));
      R(x,25,44,14,10,'#f5f5f5');R(x,30,46,4,12,'#d23a2e');R(x,13,50,3,3,'#f2b632');break;
    case 'bob':
      R(x,6,46,52,18,c.suit);R(x,20,46,5,16,shade(c.suit,-30));R(x,39,46,5,16,shade(c.suit,-30));
      R(x,26,45,12,9,'#f5f5f5');R(x,28,46,8,6,'#f0e6d0');break;
    case 'hijab':
      R(x,6,46,52,18,'#f2f2f2');R(x,6,46,52,2,'#d7d7d7');R(x,10,41,44,9,c.hijab);R(x,27,48,10,4,'#2f4f8f');break;
    case 'glasses':
      R(x,6,46,52,18,c.suit);
      for(let i=0;i<6;i++){R(x,10+i*8,50+(i%2)*4,3,3,'#e0b36a');R(x,14+i*8,56-(i%2)*3,2,2,'#d08a4a');}
      R(x,26,44,12,5,'#7a4a20');break;
  }
  // wajah
  R(x,18,13,28,27,sk);
  if(c.style!=='hijab'){R(x,15,22,3,9,sk);R(x,46,22,3,9,sk);R(x,16,24,1,5,skS);R(x,47,24,1,5,skS);}
  // rambut depan
  switch(c.style){
    case 'spiky':
      R(x,16,8,32,9,c.hair);R(x,14,12,4,12,c.hair);R(x,46,12,4,12,c.hair);
      R(x,18,4,6,6,c.hair);R(x,28,1,8,9,c.hair);R(x,39,4,6,6,c.hair);R(x,18,17,10,2,c.hair);R(x,34,17,6,2,c.hair);break;
    case 'hakim':
      R(x,14,8,36,9,c.hair);R(x,11,14,6,20,c.hair);R(x,47,14,6,20,c.hair);R(x,9,22,4,6,c.hair);R(x,51,22,4,6,c.hair);
      R(x,23,30,18,3,c.hair);R(x,21,36,22,10,c.hair);break;
    case 'bob':
      R(x,18,12,28,6,c.hair);R(x,18,18,5,4,c.hair);R(x,41,18,5,4,c.hair);break;
    case 'hijab':
      R(x,18,12,28,4,c.hijab);R(x,14,38,36,10,c.hijab);R(x,12,14,2,30,shade(c.hijab,-25));break;
    case 'glasses':{
      R(x,16,9,32,8,c.hair);R(x,14,13,4,9,c.hair);R(x,46,13,4,9,c.hair);
      const L=(a,b)=>{R(x,a,b,10,1,'#222');R(x,a,b+7,10,1,'#222');R(x,a,b,1,8,'#222');R(x,a+9,b,1,8,'#222');};
      L(21,23);L(33,23);R(x,31,26,2,1,'#222');break;}
  }
  // ekspresi
  if(emo==='shock'){
    R(x,22,23,8,8,'#fff');R(x,34,23,8,8,'#fff');R(x,25,26,2,2,'#111');R(x,37,26,2,2,'#111');
    R(x,22,17,8,2,br);R(x,34,17,8,2,br);
    R(x,29,33,6,5,'#5a1a1a');R(x,30,36,4,2,'#c2575a');
  }else{
    if(emo==='angry'){
      R(x,24,26,4,3,ey);R(x,36,26,4,3,ey);
      R(x,22,20,4,2,br);R(x,26,22,3,2,br);R(x,38,20,4,2,br);R(x,35,22,3,2,br);
    }else if(emo==='sweat'){
      R(x,24,25,4,4,ey);R(x,36,25,4,4,ey);
      R(x,22,22,4,2,br);R(x,26,20,3,2,br);R(x,38,22,4,2,br);R(x,35,20,3,2,br);
    }else if(emo==='smug'){
      R(x,24,26,4,2,ey);R(x,36,26,4,2,ey);
      R(x,23,21,6,2,br);R(x,35,20,6,2,br);
    }else{
      R(x,24,25,4,4,ey);R(x,36,25,4,4,ey);
      R(x,23,21,6,2,br);R(x,35,21,6,2,br);
    }
    if(cur.open){R(x,29,33,6,3,'#5a1a1a');R(x,30,35,4,1,'#c2575a');}
    else if(emo==='smug'){R(x,29,34,6,1,m);R(x,35,33,2,1,m);}
    else if(emo==='angry'){R(x,29,34,6,2,m);}
    else if(emo==='sweat'){R(x,28,35,8,1,m);R(x,27,34,1,1,m);R(x,36,34,1,1,m);}
    else R(x,29,34,6,1,m);
  }
  if(emo==='sweat'){R(x,47,14,3,4,'#8fd3ff');R(x,48,13,1,1,'#8fd3ff');R(x,47,18,3,1,'#5fb0e8');}
}
function setMouth(o){cur.open=o;drawChar();}
function setSpeaker(key,emo){
  const c=CH[key];
  cur.key=key;cur.emo=emo||'n';cur.open=false;
  if(curScene!==c.scene){curScene=c.scene;drawScene(c.scene);}
  const w=$('#who');
  w.style.setProperty('--tag',c.tag);
  w.innerHTML=esc(c.name.toUpperCase())+'<small>'+esc(c.role)+'</small>';
  drawChar();
}

/* ---------- Dialog ---------- */
const dialog=$('#dialog'),actions=$('#actions'),stage=$('#stage');
let typing=null,waiter=null;
function showDialog(b){dialog.hidden=!b;if(!b&&typing)typing.finish();}
function typeText(who,text,emo){
  return new Promise(res=>{
    if(typing)typing.finish();
    setSpeaker(who,emo);
    const el=$('#text');el.textContent='';$('#next').hidden=true;
    let i=0,open=false,ended=false,t=null;
    const done=()=>{
      if(ended)return;ended=true;
      if(t)clearInterval(t);
      typing=null;el.textContent=text;setMouth(false);res();
    };
    typing={finish:done};
    if(REDUCED){done();return;}
    t=setInterval(()=>{
      i++;el.textContent=text.slice(0,i);
      if(i%2===0){open=!open;setMouth(open);if(text[i-1]!==' ')beep(CH[who].pitch+(i%3)*18,0.03,'square',0.018);}
      if(i>=text.length)done();
    },20);
  });
}
async function say(who,text,emo,keep){
  if(!keep)setActions(null);
  showDialog(true);dialog.classList.remove('testimony');
  await typeText(who,text,emo||'n');
  $('#next').hidden=false;
  await new Promise(r=>{waiter=r;});
}
function tap(){
  if(typing){typing.finish();return;}
  if(waiter){const w=waiter;waiter=null;$('#next').hidden=true;beep(520,0.03);w();}
}
dialog.addEventListener('click',tap);
dialog.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tap();}});

function setActions(node){
  actions.innerHTML='';actions.classList.remove('busy');
  if(node)actions.appendChild(node);
}
function lock(b){actions.classList.toggle('busy',b);}

/* ---------- Gauge, kilat, getar ---------- */
function renderGauge(hit){
  const g=$('#gauge');g.innerHTML='';
  for(let i=0;i<MAX;i++){
    const s=document.createElement('span');
    s.className='seg'+(i>=S.hearts?' off':'')+(hit&&i===S.hearts?' hit':'');
    g.appendChild(s);
  }
  g.setAttribute('aria-label','Kepercayaan hakim '+S.hearts+' dari '+MAX);
}
function shake(){stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake');}
function penalty(){
  S.hearts--;S.mistakes++;
  renderGauge(true);beep(110,0.2,'sawtooth',0.05);shake();
  return S.hearts<=0;
}
function flash(text,color){
  return new Promise(res=>{
    const f=$('#flash');
    f.querySelector('span').textContent=text;
    f.style.setProperty('--c',color||'#fff');
    f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
    beep(220,0.12,'square',0.05);setTimeout(()=>beep(330,0.12,'square',0.05),90);
    setTimeout(()=>{f.classList.remove('on');res();},REDUCED?650:950);
  });
}

/* ---------- Kuis umum ---------- */
function shuffled(n){
  const a=[...Array(n).keys()];
  for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function ask(o){
  return new Promise((resolve,reject)=>{
    showDialog(false);
    const wrap=document.createElement('div');wrap.className='stack';
    let body=o.body?esc(o.body).replace(/____/g,'<span class="blank"></span>'):'';
    wrap.innerHTML='<div class="card"><div class="kick">'+esc(o.kick)+'</div>'+(body?'<div class="cbody">'+body+'</div>':'')+'</div>'
      +'<div class="q">'+esc(o.prompt)+'</div><div class="opts'+(o.stack?' stackopts':'')+'"></div>'
      +'<div class="fb" hidden></div><button class="btn go" type="button" hidden>LANJUT</button>';
    const opts=wrap.querySelector('.opts'),fb=wrap.querySelector('.fb'),go=wrap.querySelector('.go');
    let solved=false;
    const order=o.shuffle?shuffled(o.options.length):[...o.options.keys()];
    order.forEach(i=>{
      const b=document.createElement('button');
      b.type='button';b.className='opt';b.textContent=o.options[i];
      b.onclick=()=>{
        if(solved)return;
        if(i===o.answer){
          solved=true;b.classList.add('right');
          opts.querySelectorAll('button').forEach(x=>{x.disabled=true;});
          fb.hidden=false;fb.className='fb ok';fb.innerHTML='<b>TEPAT</b>'+esc(o.explain);
          go.hidden=false;beep(660,0.08);beep(880,0.1);
          go.scrollIntoView({block:'nearest'});
        }else{
          b.classList.add('wrong');b.disabled=true;
          if(penalty()){reject(OVER);return;}
          fb.hidden=false;fb.className='fb bad';fb.innerHTML='<b>BELUM TEPAT</b>'+esc(o.hint);
          fb.scrollIntoView({block:'nearest'});
        }
      };
      opts.appendChild(b);
    });
    go.onclick=()=>resolve();
    setActions(wrap);
  });
}

/* ---------- Urutan lima tahap ---------- */
function orderRound(){
  return new Promise((resolve,reject)=>{
    showDialog(false);
    const steps=['Menentukan isu','Mengelompokkan argumen','Membuat kerangka','Menulis draf','Menyunting bersama teman'];
    const hints=[
      'Mulai dari mengetahui apa yang diperdebatkan.',
      'Setelah ada isu, kumpulkan alasan pro dan kontra, lalu kelompokkan.',
      'Kelompok alasan itu disusun menjadi kerangka dulu.',
      'Kerangka sudah ada, saatnya dikembangkan menjadi tulisan.',
      'Tulisan sudah jadi. Terakhir, periksa dan perbaiki bersama teman.'
    ];
    const wrap=document.createElement('div');wrap.className='stack';
    wrap.innerHTML='<div class="card"><div class="kick">URUTKAN LIMA TAHAP</div><ol class="slots">'+steps.map(()=>'<li></li>').join('')+'</ol></div>'
      +'<div class="q">Ketuk tahap berikutnya sesuai urutan yang benar.</div><div class="opts stackopts"></div>'
      +'<div class="fb" hidden></div><button class="btn go" type="button" hidden>LANJUT</button>';
    const slots=[...wrap.querySelectorAll('.slots li')],opts=wrap.querySelector('.opts'),fb=wrap.querySelector('.fb'),go=wrap.querySelector('.go');
    let next=0;
    shuffled(steps.length).forEach(i=>{
      const b=document.createElement('button');
      b.type='button';b.className='opt';b.textContent=steps[i];
      b.onclick=()=>{
        if(i===next){
          slots[next].textContent=steps[i];slots[next].classList.add('filled');
          b.disabled=true;b.classList.add('right');beep(600+next*60,0.08);
          next++;fb.hidden=true;
          if(next===steps.length){
            fb.hidden=false;fb.className='fb ok';
            fb.innerHTML='<b>TEPAT</b>'+esc('Urutannya benar. Tulisan baru dianggap selesai setelah disunting.');
            go.hidden=false;go.scrollIntoView({block:'nearest'});
          }
        }else{
          if(penalty()){reject(OVER);return;}
          fb.hidden=false;fb.className='fb bad';
          fb.innerHTML='<b>BELUM TEPAT</b>'+esc(hints[next]);
        }
      };
      opts.appendChild(b);
    });
    go.onclick=()=>resolve();
    setActions(wrap);
  });
}

/* ---------- Pemeriksaan silang ---------- */
const UJI=[
  {k:'alasan',t:'Tidak ada alasan yang jelas'},
  {k:'cek',t:'Tidak ada contoh atau data yang bisa dicek'},
  {k:'umum',t:'Hanya pengalaman satu orang, tidak berlaku umum'}
];
function crossExam(W){
  return new Promise((resolve,reject)=>{
    const st=W.st,n=st.length,need=st.filter(s=>s.flaw).length;
    let idx=0;const done=new Set();
    const wrap=document.createElement('div');wrap.className='stack';
    wrap.innerHTML='<div class="dots"><span class="kick" id="ceLabel"></span><span class="dotrow" id="ceDots"></span></div>'
      +'<div class="ce-row" id="ceMain">'
      +'<button class="btn nav" id="cePrev" type="button" aria-label="Kesaksian sebelumnya"><span class="tri l"></span></button>'
      +'<button class="btn press" id="cePress" type="button">TEKAN</button>'
      +'<button class="btn obj" id="ceObj" type="button">SANGGAH!</button>'
      +'<button class="btn nav" id="ceNext" type="button" aria-label="Kesaksian berikutnya"><span class="tri r"></span></button></div>'
      +'<div class="stack" id="cePick" hidden><div class="q">Sanggah dengan pertanyaan uji yang mana?</div><div class="opts stackopts" id="cePickOpts"></div>'
      +'<button class="btn nav" id="ceCancel" type="button">BATAL</button></div>'
      +'<p class="hintline">Tekan untuk meminta penjelasan. Sanggah argumen yang gagal uji. Argumen yang kuat jangan disanggah.</p>';
    const q=s=>wrap.querySelector(s);
    const label=q('#ceLabel'),dots=q('#ceDots'),main=q('#ceMain'),pick=q('#cePick'),pickOpts=q('#cePickOpts'),obj=q('#ceObj');
    function show(){
      showDialog(true);dialog.classList.add('testimony');
      typeText(W.who,st[idx].t,st[idx].emo||'n');
      label.innerHTML='KESAKSIAN '+(idx+1)+' DARI '+n+(done.has(idx)?' <span class="tagdone">TERBANTAH</span>':'');
      dots.innerHTML='';
      for(let i=0;i<n;i++){
        const d=document.createElement('span');
        d.className='dot'+(done.has(i)?' done':'')+(i===idx?' on':'');
        if(done.has(i)&&i!==idx)d.className='dot done';
        dots.appendChild(d);
      }
      obj.disabled=done.has(idx);
    }
    q('#cePrev').onclick=()=>{idx=(idx-1+n)%n;show();};
    q('#ceNext').onclick=()=>{idx=(idx+1)%n;show();};
    q('#cePress').onclick=async()=>{
      try{
        lock(true);
        const s=st[idx];
        await flash('TEKAN!','#f2b632');
        await say(W.who,s.press,s.pressEmo||'n',true);
        if(s.flaw&&!done.has(idx))await say('bima',s.hint,'sweat',true);
        lock(false);show();
      }catch(e){reject(e);}
    };
    obj.onclick=()=>{main.hidden=true;pick.hidden=false;};
    q('#ceCancel').onclick=()=>{pick.hidden=true;main.hidden=false;};
    async function choose(k){
      try{
        lock(true);
        const s=st[idx];
        if(s.flaw===k){
          await flash('SANGGAH!','#e0412f');
          await say(W.who,s.react,'shock',true);
          await say('bima',s.refute,'angry',true);
          done.add(idx);
          pick.hidden=true;main.hidden=false;lock(false);
          if(done.size===need){resolve();return;}
          idx=(idx+1)%n;show();
        }else{
          if(penalty()){reject(OVER);return;}
          pick.hidden=true;main.hidden=false;
          const msg=s.flaw
            ?'Sanggahan belum tepat. Argumen itu memang bermasalah, tetapi bukan karena itu. Uji lagi dengan tiga pertanyaan.'
            :'Sanggahan ditolak. Argumen itu punya alasan dan contoh yang bisa dicek.';
          await say('hakim',msg,'n',true);
          lock(false);show();
        }
      }catch(e){reject(e);}
    }
    UJI.forEach(u=>{
      const b=document.createElement('button');
      b.type='button';b.className='opt';b.textContent=u.t;
      b.onclick=()=>choose(u.k);
      pickOpts.appendChild(b);
    });
    setActions(wrap);
    show();
  });
}

/* ---------- Isi permainan ---------- */
const PARAS=[
  'Media sosial sudah menjadi bagian dari keseharian remaja. Sebelum berangkat sekolah, saat istirahat, sampai menjelang tidur, remaja sering menghabiskan waktu di depan layar ponsel. Platform seperti TikTok dan Instagram dipakai untuk mencari hiburan, berbagi momen, hingga belajar.',
  'Kebiasaan ini memunculkan perbedaan pendapat. Sebagian orang menilai media sosial memberi banyak manfaat bagi remaja, sedangkan sebagian lain menganggapnya lebih banyak membawa risiko. Apakah media sosial lebih tepat disebut sahabat atau justru jebakan bagi remaja?',
  'Pihak yang setuju berpendapat bahwa media sosial memberi ruang bagi remaja untuk berkreasi. Karya yang dulu hanya dilihat keluarga kini bisa dinikmati banyak orang dan mendapat masukan. Contohnya, remaja yang suka melukis dapat membagikan proses melukisnya lewat video singkat dan bertemu dengan orang-orang yang punya minat sama.',
  'Selain itu, media sosial menjadi sumber belajar yang mudah dijangkau. Banyak akun membagikan penjelasan materi pelajaran, latihan bahasa asing, sampai tips menulis secara gratis. Remaja yang belum bisa ikut bimbingan belajar tetap dapat belajar dari video-video singkat itu.',
  'Ada pula yang berpendapat bahwa remaja yang aktif di media sosial pasti lebih pintar bergaul dan lebih sukses di masa depan. Menurut mereka, semakin sering seseorang mengunggah sesuatu, semakin besar peluangnya berhasil.',
  'Namun, pihak yang tidak setuju menilai media sosial mudah membuat penggunanya kehilangan waktu. Fitur gulir tanpa akhir dan rekomendasi video yang terus muncul membuat pengguna sulit berhenti. Akibatnya, tugas sekolah tertunda dan waktu tidur berkurang, padahal awalnya hanya berniat membuka aplikasi sebentar.',
  'Selain itu, media sosial membuka peluang terjadinya perundungan siber, yaitu perundungan lewat internet. Komentar kasar bisa dikirim oleh siapa saja tanpa bertatap muka, dan pelakunya sering merasa tidak perlu bertanggung jawab. Platform memang menyediakan fitur blokir dan laporkan, tetapi korban sering baru memakainya setelah merasa malu dan takut membuka akunnya lagi.',
  'Kekhawatiran lainnya adalah informasi yang tidak selalu benar. Kabar bohong bisa menyebar cepat karena banyak orang membagikannya sebelum memeriksa sumbernya. Meskipun tampak meyakinkan, tidak semua kabar yang beredar itu benar. Remaja yang belum terbiasa mengecek kebenaran informasi lebih mudah percaya.',
  'Berdasarkan kedua pandangan tersebut, media sosial bisa menjadi sahabat sekaligus jebakan, tergantung pada cara remaja memakainya. Karena itu, remaja perlu membatasi waktu penggunaan, memeriksa kebenaran informasi sebelum membagikannya, dan memakai fitur blokir serta laporkan agar manfaat media sosial tetap terasa tanpa mengabaikan risikonya.'
];
const PA=[0,0,1,1,1,2,2,2,3];
const PEX=[
  'Paragraf pengantar. Ia memperkenalkan topik bahwa media sosial sudah jadi bagian keseharian remaja.',
  'Ada pertanyaan yang diperdebatkan, yaitu sahabat atau jebakan. Itu ciri bagian isu.',
  'Kata "pihak yang setuju berpendapat" menandai argumen pro: media sosial memberi ruang berkreasi.',
  'Kata "selain itu" melanjutkan argumen pro: media sosial menjadi sumber belajar.',
  'Masih argumen pro, tetapi lemah. Nanti kita uji di ruang saksi.',
  'Kata "namun" dan "pihak yang tidak setuju" menandai pergantian ke argumen kontra.',
  'Kata "selain itu" melanjutkan argumen kontra: perundungan siber.',
  'Kekhawatiran tentang kabar bohong masih bagian argumen kontra, karena membahas risiko.',
  'Kata "berdasarkan kedua pandangan tersebut" menandai simpulan yang merangkum dua sisi.'
];
const PH=[
  'Paragraf ini baru mengenalkan topik. Belum ada pendapat dari pihak mana pun.',
  'Cari kalimat tanya yang menjadi pokok perdebatan.',
  'Lihat siapa yang berpendapat di awal paragraf.',
  'Paragraf ini masih melanjutkan pihak yang sama dengan paragraf sebelumnya.',
  'Siapa yang berpendapat di sini? Apakah mereka menilai media sosial menguntungkan atau merugikan?',
  'Perhatikan kata penanda pertentangan di awal paragraf.',
  'Masih pihak yang menilai media sosial berisiko.',
  'Kekhawatiran apa yang dibahas? Itu manfaat atau risiko?',
  'Cari kata yang merangkum kedua pandangan.'
];
const DINDA={who:'dinda',st:[
  {t:'Saya suka melukis. Proses melukis saya diunggah lewat video singkat, dan banyak orang memberi masukan.',press:'Iya, Pak. Ada yang menyarankan warna lain. Komentarnya masih bisa dibuka di akun saya.'},
  {t:'Remaja yang rajin mengunggah itu pasti lebih sukses, soalnya makin sering tampil, makin besar peluangnya.',flaw:'cek',press:'Eh... itu kata orang-orang di sekitar saya. Angkanya, saya belum pernah lihat.',pressEmo:'sweat',hint:'Alasannya ada, tetapi buktinya di mana?',react:'Ugh! Tapi kan masuk akal...',refute:'Klaim sebesar "pasti sukses" butuh contoh atau data yang bisa dicek. Tanpa itu, argumennya lemah.'},
  {t:'Banyak akun membagikan materi pelajaran dan latihan bahasa asing secara gratis, jadi remaja yang tidak ikut bimbel tetap bisa belajar.',press:'Misalnya penjelasan rumus dan tips menulis. Siapa pun bisa membukanya sendiri.'},
  {t:'Kakak sepupu saya terkenal karena rajin mengunggah video, jadi semua remaja pasti bisa terkenal kalau rajin mengunggah.',flaw:'umum',press:'Hmm... memang baru kakak sepupu saya yang saya tahu.',pressEmo:'sweat',hint:'Dasarnya baru satu orang. Apakah itu mewakili semua remaja?',react:'Itu... itu cuma contoh, kan!',refute:'Satu pengalaman belum mewakili banyak orang. Argumennya tidak berlaku umum.'},
  {t:'Platform menyediakan fitur blokir dan laporkan, jadi pengguna bisa menghentikan komentar kasar.',press:'Fiturnya ada di pengaturan akun. Tinggal pilih blokir atau laporkan.'}
]};
const RAKA={who:'raka',st:[
  {t:'Pokoknya anak yang bermain ponsel itu pemalas.',flaw:'alasan',press:'Ya... pokoknya begitu. Saya sendiri belum punya alasannya.',pressEmo:'sweat',hint:'Kalimat ini hanya menilai. Apa sebabnya?',react:'Tapi... tapi saya sudah lama mengajar!',refute:'Tanpa alasan, kalimat itu hanya opini biasa. Pendapat yang kuat harus punya sebab.'},
  {t:'Fitur gulir tanpa akhir membuat pengguna sulit berhenti, akibatnya tugas tertunda dan waktu tidur berkurang.',press:'Banyak murid mengaku begitu. Niatnya buka sebentar, tahu-tahu sudah malam.'},
  {t:'Komentar kasar bisa dikirim tanpa bertatap muka, sehingga pelaku merasa tidak perlu bertanggung jawab dan perundungan siber terjadi.',press:'Contohnya komentar menghina di unggahan teman, dikirim akun tanpa nama.'},
  {t:'Menurut survei yang saya baca entah di mana, sembilan puluh persen remaja kehilangan prestasi gara-gara media sosial.',flaw:'cek',press:'Em... sumbernya saya lupa. Angkanya pun saya tidak yakin.',pressEmo:'sweat',hint:'Sumbernya tidak jelas. Bisakah angka itu diperiksa?',react:'Itu... saya yakin pernah membacanya!',refute:'Angka tanpa sumber yang jelas tidak bisa dicek. Argumen seperti itu belum bisa dipercaya.'},
  {t:'Kabar bohong menyebar cepat karena banyak orang membagikannya sebelum memeriksa sumbernya.',press:'Makanya biasakan cek sumber dulu sebelum membagikan.'}
]};
const CONJ=[
  {a:'Media sosial memberi ruang untuk berkreasi. ____, penggunanya mudah kehilangan waktu.',o:['Namun','Oleh karena itu','Selain itu','Misalnya'],ans:0,why:'"Namun" dipakai karena kalimat kedua berlawanan dengan kalimat pertama: manfaat lalu risiko.'},
  {a:'Platform menyediakan fitur blokir dan laporkan, ____ korban sering baru memakainya setelah merasa malu.',o:['sehingga','tetapi','dan','karena'],ans:1,why:'"Tetapi" menghubungkan dua hal yang bertentangan: fitur sudah ada, tetapi korban terlambat memakainya.'},
  {a:'____ tampak meyakinkan, tidak semua kabar yang beredar itu benar.',o:['Karena','Misalnya','Meskipun','Jadi'],ans:2,why:'"Meskipun" mengawali bagian yang kalah kuat: tampak meyakinkan, tetapi tetap belum tentu benar.'},
  {a:'Pihak pro menilai media sosial membantu belajar. ____, pihak kontra menilai media sosial justru mengganggu waktu belajar.',o:['Sebaliknya','Akibatnya','Contohnya','Selanjutnya'],ans:0,why:'"Sebaliknya" menunjukkan pandangan yang berlawanan dari pihak lain.'},
  {a:'Banyak remaja senang mengunggah karya. ____, tidak semua unggahan mendapat tanggapan yang baik.',o:['Akan tetapi','Sehingga','Contohnya','Oleh sebab itu'],ans:0,why:'"Akan tetapi" menandai pertentangan: senang mengunggah, tetapi tanggapannya tidak selalu baik.'}
];

async function b1(retry){
  if(!retry){
    await say('hakim','Sidang dimulai. Perkara hari ini: apakah media sosial lebih tepat disebut sahabat atau jebakan bagi remaja?','n');
    await say('hakim','Pengadilan ini tidak menghukum siapa pun. Kita menimbang dua sisi dulu sebelum menyimpulkan.','n');
    await say('bima','Saya Bima. Tugas saya menguji argumen, bukan membela satu pihak. Siap, Yang Mulia.','n');
    await say('kinan','Hmph. Jangan terlalu percaya diri, Pengacara. Argumen yang saya bawa tidak mudah dipatahkan.','smug');
    await say('hakim','Satu aturan: kepercayaan hakim tidak boleh habis. Setiap kesalahan mengurangi satu segmen. Kalau butuh bantuan, buka Catatan Sidang di pojok atas.','n');
    await say('hakim','Babak 1. Barang bukti pertama adalah teks diskusi "Media Sosial bagi Remaja: Sahabat atau Jebakan?". Tentukan fungsi tiap paragraf.','n');
  }else{
    await say('hakim','Babak 1 dilanjutkan. Tentukan fungsi paragraf dengan teliti.','n');
  }
  for(P.b1=P.b1||0;P.b1<PARAS.length;P.b1++){
    const i=P.b1;
    await ask({kick:'PARAGRAF '+(i+1)+' DARI '+PARAS.length,body:PARAS[i],prompt:'Paragraf ini berfungsi sebagai apa?',
      options:['Isu','Argumen pro','Argumen kontra','Simpulan'],answer:PA[i],hint:PH[i],explain:PEX[i]});
  }
  await say('hakim','Strukturnya sudah jelas: isu, argumen pro, argumen kontra, dan simpulan.','n');
  await say('bima','Tapi paragraf 5 terasa janggal. Ada argumen yang perlu diuji dulu.','sweat');
}
async function b2(retry){
  if(!retry){
    await say('hakim','Babak 2. Saksi pertama mewakili pihak pro. Silakan bersaksi, Dinda.','n');
    await say('dinda','Baik, Yang Mulia. Saya pelajar kelas VIII dan memakai media sosial setiap hari.','n');
    await say('bima','Saya periksa kesaksiannya. Argumen yang kuat lolos tiga pertanyaan uji: apa alasannya, adakah contoh atau data yang bisa dicek, dan apakah berlaku untuk banyak orang.','n');
  }else{
    await say('hakim','Pemeriksaan silang saksi pertama diulang.','n');
  }
  await crossExam(DINDA);
  await say('hakim','Dua argumen pro tidak lolos uji. Argumen lainnya tetap berdiri.','n');
}
async function b3(retry){
  if(!retry){
    await say('hakim','Babak 3. Saksi kedua mewakili pihak kontra. Argumen kontra diuji dengan cara yang sama, tanpa dibeda-bedakan.','n');
    await say('raka','Saya guru BK di sebuah SMP. Saya sering melihat dampaknya langsung di sekolah.','n');
  }else{
    await say('hakim','Pemeriksaan silang saksi kedua diulang.','n');
  }
  await crossExam(RAKA);
  await say('hakim','Pihak kontra pun harus punya alasan dan bukti. Tidak ada sisi yang otomatis benar.','n');
}
async function b4(retry){
  if(!retry){
    await say('kinan','Kalau begitu, hadapi pernyataan saya. Lengkapi kata penghubungnya dengan tepat.','smug');
    await say('hakim','Konjungsi pertentangan menunjukkan dua hal yang berlawanan, misalnya namun, tetapi, akan tetapi, meskipun, dan sebaliknya.','n');
  }
  for(P.c=P.c||0;P.c<CONJ.length;P.c++){
    const it=CONJ[P.c];
    await ask({kick:'KALIMAT '+(P.c+1)+' DARI '+CONJ.length,body:it.a,prompt:'Kata penghubung mana yang paling tepat?',
      options:it.o,answer:it.ans,shuffle:true,hint:'Lihat hubungan dua bagian kalimat. Kalau keduanya berlawanan, pilih konjungsi pertentangan.',explain:it.why});
  }
  await say('kinan','Satu lagi. Teman sebangkumu tidak setuju dengan pendapatmu. Bagaimana kamu menanggapinya?','smug');
  await ask({kick:'SANGGAHAN YANG SANTUN',body:'Teman sebangkumu tidak setuju dengan pendapatmu, dan kamu merasa argumenmu lebih kuat.',prompt:'Tanggapan mana yang paling tepat?',stack:true,shuffle:true,
    options:['Pendapatmu salah. Jangan asal bicara.','Saya kurang setuju karena datanya belum jelas. Boleh saya tunjukkan alasan saya?','Terserah, aku malas berdebat.'],answer:1,
    hint:'Sanggahan yang baik menunjuk bagian argumennya dan tetap menghargai orangnya.',
    explain:'Sanggahan yang santun menunjuk bagian argumen yang lemah, memberi alasan, dan tetap menghargai teman. Menyerang orangnya atau diam saja bukan jalan keluar.'});
  await say('hakim','Sanggahan yang baik menunjuk bagian argumennya, bukan menyerang orangnya.','n');
}
async function b5(retry){
  if(!retry){
    await say('hakim','Babak 5, argumen penutup. Teks diskusi tidak lahir sekaligus. Ada lima tahap menyusunnya.','n');
  }
  if(!P.ord){await orderRound();P.ord=1;}
  await say('hakim','Sekarang praktik. Isunya: bolehkah siswa membawa ponsel ke sekolah? Pihak pro bilang ponsel membantu mencari sumber belajar, pihak kontra bilang ponsel mengganggu konsentrasi di kelas.','n');
  await ask({kick:'SIMPULAN',body:'Isu: bolehkah siswa membawa ponsel ke sekolah?\nPro: ponsel membantu mencari sumber belajar.\nKontra: ponsel mengganggu konsentrasi di kelas.',
    prompt:'Simpulan mana yang paling tepat?',stack:true,shuffle:true,
    options:['Siswa boleh membawa ponsel dengan aturan yang jelas, sebab manfaat belajar dan risiko gangguan sama-sama ada.','Ponsel harus dilarang sepenuhnya karena semua anak yang bermain ponsel menjadi malas.','Siswa boleh membawa ponsel. Selain itu, ponsel membuat anak lebih hemat uang jajan.'],answer:0,
    hint:'Simpulan harus merangkum kedua sisi. Jangan memihak satu sisi dan jangan menambah alasan baru.',
    explain:'Simpulan merangkum dua sisi tanpa alasan baru. Pilihan kedua berat sebelah dan hanya opini, pilihan ketiga membawa alasan baru yang belum dibahas.'});
}
async function ending(){
  await say('hakim','Sidang selesai. Kedua sisi sudah ditimbang, dan hanya argumen yang beralasan yang dipakai.','n');
  await say('bima','Satu isu bisa dilihat dari dua sisi. Pendapat yang baik punya alasan dan bukti, termasuk di media sosial.','smug');
  await say('kinan','Hmph. Baiklah, kali ini saya akui.','sweat');
  await flash('PUTUSAN!','#f2b632');
  await say('hakim','Pengacara Bima dinyatakan lolos. Sidang ditutup.','n');
  const m=S.mistakes;
  const rk=m===0?['S','Pengacara Nalar']:m<=3?['A','Pengacara Teliti']:m<=8?['B','Pengacara Muda']:['C','Pengacara Magang'];
  const wrap=document.createElement('div');wrap.className='stack';
  wrap.innerHTML='<div class="card"><div class="kick">PUTUSAN AKHIR</div><div class="rank" style="margin-top:10px"><span class="big">'+rk[0]+'</span><div><p class="t">'+esc(rk[1].toUpperCase())+'</p><p>Kesalahan: '+m+'</p></div></div>'
    +'<ul class="recap"><li>Struktur: isu, argumen pro, argumen kontra, simpulan.</li><li>Tiga pertanyaan uji: alasan, bisa dicek, berlaku umum.</li><li>Konjungsi pertentangan: namun, tetapi, akan tetapi, meskipun, sebaliknya.</li><li>Lima tahap: tentukan isu, kelompokkan, buat kerangka, tulis draf, sunting.</li></ul></div>'
    +'<div class="row2"><button class="btn press" id="btnAgain" type="button">MAIN LAGI</button><button class="btn nav" id="btnNote2" type="button">CATATAN</button></div>';
  setActions(wrap);
  wrap.querySelector('#btnAgain').onclick=restart;
  wrap.querySelector('#btnNote2').onclick=openSheet;
}

const BAB=[
  {t:'BABAK 1: BARANG BUKTI',f:b1},
  {t:'BABAK 2: SAKSI PRO',f:b2},
  {t:'BABAK 3: SAKSI KONTRA',f:b3},
  {t:'BABAK 4: SANGGAHAN',f:b4},
  {t:'BABAK 5: ARGUMEN PENUTUP',f:b5}
];
async function run(){
  for(let i=0;i<BAB.length;i++){
    let retry=false;
    for(;;){
      S.hearts=MAX;renderGauge();
      $('#babak').textContent=BAB[i].t;
      try{await BAB[i].f(retry);break;}
      catch(e){
        if(e!==OVER)throw e;
        retry=true;setActions(null);
        await say('hakim','Kepercayaan hakim sudah habis. Sidang diskors sebentar. Buka Catatan Sidang, lalu coba lagi babak ini.','n');
      }
    }
  }
  await ending();
}
function restart(){
  S={hearts:MAX,mistakes:0};P={};
  setActions(null);showDialog(false);
  run().catch(e=>console.error(e));
}

/* ---------- Catatan Sidang ---------- */
const sheet=$('#sheet');
function buildSheet(){
  $('#sheetBody').innerHTML=
    '<p class="muted">Ringkasan materi teks diskusi. Buka kapan saja selama sidang.</p>'
    +'<h3>STRUKTUR TEKS DISKUSI</h3><dl>'
    +'<div><dt>Isu</dt><dd>Topik yang diperdebatkan, sering berbentuk pertanyaan.</dd></div>'
    +'<div><dt>Argumen pro</dt><dd>Pendapat yang mendukung, lengkap dengan alasan dan contoh.</dd></div>'
    +'<div><dt>Argumen kontra</dt><dd>Pendapat yang menolak atau khawatir, juga dengan alasan dan contoh.</dd></div>'
    +'<div><dt>Simpulan</dt><dd>Merangkum dua sisi tanpa membawa alasan baru.</dd></div></dl>'
    +'<h3>TIGA PERTANYAAN UJI</h3><ol><li>Apa alasannya?</li><li>Adakah contoh atau data yang bisa dicek?</li><li>Berlaku untuk banyak orang atau hanya pengalaman satu orang?</li></ol>'
    +'<p class="muted">Lolos ketiganya berarti argumen kuat. Lolos sebagian berarti cukup kuat. Gagal berarti lemah.</p>'
    +'<h3>FAKTA DAN OPINI</h3><p>Fakta bisa dibuktikan. Opini adalah pendapat, dan baru kuat kalau punya alasan.</p>'
    +'<h3>KONJUNGSI PERTENTANGAN</h3><div class="chips"><span class="chip">namun</span><span class="chip">tetapi</span><span class="chip">akan tetapi</span><span class="chip">meskipun</span><span class="chip">sebaliknya</span></div>'
    +'<h3>LIMA TAHAP MENYUSUN</h3><ol><li>Menentukan isu</li><li>Mengelompokkan argumen</li><li>Membuat kerangka</li><li>Menulis draf</li><li>Menyunting bersama teman</li></ol>'
    +'<h3>BARANG BUKTI</h3><details><summary>Teks lengkap: Media Sosial bagi Remaja, Sahabat atau Jebakan?</summary>'
    +PARAS.map((p,i)=>'<p><b>('+(i+1)+')</b> '+esc(p)+'</p>').join('')+'</details>';
}
let lastFocus=null;
function openSheet(){
  lastFocus=document.activeElement;
  sheet.hidden=false;$('#btnClose').focus();
}
function closeSheet(){
  sheet.hidden=true;
  if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus();
}
$('#btnNote').onclick=openSheet;
$('#btnClose').onclick=closeSheet;
sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden)closeSheet();});
$('#btnSound').onclick=function(){
  soundOn=!soundOn;
  this.textContent=soundOn?'SUARA ON':'SUARA OFF';
  this.setAttribute('aria-pressed',String(soundOn));
};

/* ---------- Mulai ---------- */
buildSheet();
renderGauge();
setSpeaker('hakim','n');
$('#btnStart').onclick=()=>{
  $('#title').hidden=true;
  beep(440,0.08);setTimeout(()=>beep(660,0.1),90);
  S={hearts:MAX,mistakes:0};P={};
  run().catch(e=>console.error(e));
};
})();
