const LP=(()=>{
const ls=localStorage,$=(s,r=document)=>r.querySelector(s),SDK='https://www.gstatic.com/firebasejs/10.14.1/';
let data={},db,uid,last={},t;
const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.append(s)});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const ar=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
const age=(y,m)=>{const x=(y-2001)*12+(m-11);return `${ar(Math.floor(x/12))} سنة و${ar(x%12)} شهر`};
const daysTo=()=>Math.ceil((new Date('2030-12-31T23:59:59')-new Date())/864e5);
const Q=['🌱 خطوة صغيرة كل يوم أحسن من اندفاعة وبعدها توقف.','🕋 اعمل اللي عليك والباقي على ربنا.','🔥 الانضباط هو الجسر بين الهدف والإنجاز.','🏗 اللي بتبنيه النهارده هو اللي هتعيش فيه سنة ٢٠٣٠.','💪 مش لازم تكون متحمس، لازم تكون ملتزم.','🌅 يوم جديد، صفحة جديدة، نية صافية.','📚 كل ساعة تعلّم دلوقتي بتتحوّل لفرصة بعدين.','🤲 والله عند ظن عبده به، فظنّ خيرًا واسعَ بقوة.'];
const wk=ds=>{const d=new Date(ds+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+3);const y=d.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y+'-W'+pad(1+Math.round(((d-f)/864e5-3+(f.getUTCDay()+6)%7)/7))};
function msg(h){const o=document.createElement('div');o.className='lock';o.innerHTML=`<div><h1>🧭 Ahmed Plan</h1><p class=m>${h}</p></div>`;document.body.append(o)}
function login(){if($('.lock'))return;const o=document.createElement('div');o.className='lock';o.innerHTML='<form><h1>🧭 Ahmed Plan</h1><p class=m>سجّل دخولك</p><input id=em type=email placeholder="الإيميل" autocomplete=username required><input id=pw type=password placeholder="الباسورد" autocomplete=current-password required><button class=btn id=go>دخول</button><p><button type=button class="btn g" id=fg>نسيت الباسورد؟</button></p><p id=er style="color:#f87171"></p></form>';document.body.append(o);
const er=$('#er',o),go=$('#go',o);
$('form',o).onsubmit=async e=>{e.preventDefault();er.style.color='#f87171';er.textContent='';go.disabled=true;try{await firebase.auth().signInWithEmailAndPassword($('#em',o).value.trim(),$('#pw',o).value)}catch(x){er.textContent=x.code==='auth/too-many-requests'?'محاولات كتير، استنى شوية وجرّب تاني':'الإيميل أو الباسورد غلط';go.disabled=false}};
$('#fg',o).onclick=async()=>{const em=$('#em',o).value.trim();if(!em){er.textContent='اكتب الإيميل الأول';return}try{await firebase.auth().sendPasswordResetEmail(em);er.style.color='#5fd0c0';er.textContent='لو الإيميل مسجّل هيوصلك لينك تغيير الباسورد'}catch(x){er.textContent='تعذّر الإرسال'}}}
async function init(){
await new Promise(r=>document.readyState==='loading'?addEventListener('DOMContentLoaded',r):r());
try{await load('firebase-config.js')}catch(e){}
const c=window.FIREBASE_CONFIG;
if(!c||!c.apiKey){msg('ملف firebase-config.js لسه فاضي. املاه ببيانات مشروع Firebase (الخطوات في SETUP_AR.txt).');return new Promise(()=>{})}
try{for(const f of['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js'])await load(SDK+f)}catch(e){msg('تعذّر تحميل Firebase. اتأكد من الإنترنت وحاول تاني.');return new Promise(()=>{})}
firebase.initializeApp(c);db=firebase.firestore();try{await db.enablePersistence({synchronizeTabs:true})}catch(e){}
return new Promise(res=>firebase.auth().onAuthStateChanged(u=>{if(u){uid=u.uid;const l=$('.lock');if(l)l.remove();res(u)}else login()}))}
async function loadData(){const qs=await db.collection(`users/${uid}/kv`).get();data={};qs.forEach(d=>{const s=d.data().v,v=JSON.parse(s);last[d.id]=s;if(d.id.startsWith('days:'))Object.assign(data.days=data.days||{},v);else data[d.id]=v})}
async function flush(){if(!db||!uid)return;const ch={};for(const k in data){if(k==='days'){const g={};for(const d in data.days){const m='days:'+d.slice(0,7);(g[m]=g[m]||{})[d]=data.days[d]}for(const m in g)ch[m]=JSON.stringify(g[m])}else ch[k]=JSON.stringify(data[k])}
const b=db.batch(),up=[];for(const k in ch){if(ch[k]===last[k])continue;if(ch[k].length>900000){alert('حجم بيانات "'+k+'" كبير أوي. قلّل النص أو متلصقش صور جوه الملاحظات.');continue}b.set(db.doc(`users/${uid}/kv/${k}`),{v:ch[k]});up.push(k)}
if(up.length)try{await b.commit();up.forEach(k=>last[k]=ch[k])}catch(e){console.error(e)}}
const save=()=>{clearTimeout(t);t=setTimeout(flush,600)};
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
const b2s=blob=>new Promise((r,j)=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.onerror=j;f.readAsDataURL(blob)});
const files={
put:async(k,blob)=>{const d=await b2s(blob);if(d.length>950000){alert('الملف كبير أوي. صغّره أو قصّر التسجيل.');return}await db.doc(`users/${uid}/files/${k}`).set({t:blob.type,d});data.files=data.files||[];if(!data.files.includes(k)){data.files.push(k);save()}},
get:async k=>{const s=await db.doc(`users/${uid}/files/${k}`).get();if(!s.exists)return null;const{t:ty,d}=s.data(),a=atob(d),u=new Uint8Array(a.length);for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return new Blob([u],{type:ty})},
keys:async p=>(data.files||[]).filter(k=>k.startsWith(p)),
del:async k=>{await db.doc(`users/${uid}/files/${k}`).delete();data.files=(data.files||[]).filter(x=>x!==k);save()}};
const pages=[['index','🧭 الخطة'],['today','🌅 اليوم'],['calendar','🗓 التقويم'],['vision','🔭 الرؤية'],['money','💰 الفلوس'],['review','📊 التقييم'],['letters','✉️ رسائل'],['challenge','🏆 التحدي']];
function nav(){const cur=location.pathname.split('/').pop().replace('.html','')||'index',n=document.createElement('nav');n.className='nav';n.innerHTML=pages.map(([p,x])=>`<a href="${p}.html" class="${p===cur?'on':''}">${x}</a>`).join('')+'<span class=sp></span><button id=ex>💾 نسخة احتياطية</button><button id=lk>🚪 خروج</button>';document.body.prepend(n);
$('#lk').onclick=async()=>{await firebase.auth().signOut();location.href='index.html'};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)]));a.download='my-system-backup-'+ymd(new Date())+'.json';a.click()}}
async function ready(fn){await init();await loadData();await new Promise(r=>{const s=document.createElement('script');s.src='photos.js';s.onload=s.onerror=r;document.head.append(s)});if(window.PHOTOS&&PHOTOS.length)document.body.style.setProperty('--ph',`url("img/${PHOTOS[Math.floor(Math.random()*PHOTOS.length)]}")`);document.body.classList.add('u');nav();fn(data,save)}
async function page(){await init();const s=await db.doc(`users/${uid}/pages/${document.body.dataset.page}`).get();if(!s.exists){document.body.innerHTML='<main style="padding:30px"><h2>الصفحة دي لسه ما اتستوردتش</h2><p>افتح <a href=import.html style="text-decoration:underline">import.html</a> وارفع صفحات الخطة من فولدر private_pages.</p></main>';return}document.open();document.write(s.data().html);document.close()}
const setPage=(n,html)=>db.doc(`users/${uid}/pages/${n}`).set({html});
return{esc,ready,page,setPage,files,ymd,ar,age,$,pad,wk,daysTo,Q}})();
