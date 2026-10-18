const LP=(()=>{
const E=new TextEncoder(),D=new TextDecoder(),ls=localStorage,$=(s,r=document)=>r.querySelector(s),SDK='https://www.gstatic.com/firebasejs/10.14.1/';
const b64=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s)};
const ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let key,data={},t,fdb,uid,last={};
const enc=async buf=>{const iv=crypto.getRandomValues(new Uint8Array(12)),c=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,buf)),o=new Uint8Array(12+c.length);o.set(iv);o.set(c,12);return o.buffer};
const dec=async buf=>{const a=new Uint8Array(buf);return crypto.subtle.decrypt({name:'AES-GCM',iv:a.slice(0,12)},key,a.slice(12))};
const encS=async s=>b64(await enc(E.encode(s))),decS=async s=>D.decode(await dec(ub(s).buffer));
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('sys',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=rej});
const tx=async(m,f)=>{const d=await idb();return new Promise((res,rej)=>{const x=d.transaction('f',m),q=f(x.objectStore('f'));x.oncomplete=()=>res(q&&q.result);x.onerror=rej})};
const L={put:async(k,blob)=>{const b=await enc(await blob.arrayBuffer());return tx('readwrite',s=>s.put({t:blob.type,b},k))},get:async k=>{const v=await tx('readonly',s=>s.get(k));return v?new Blob([await dec(v.b)],{type:v.t}):null},keys:async p=>(await tx('readonly',s=>s.getAllKeys())).filter(k=>k.startsWith(p)),del:k=>tx('readwrite',s=>s.delete(k))};
const cloud=()=>!!(fdb&&uid);
const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.append(s)});
async function cloudInit(){try{await load('firebase-config.js')}catch(e){return}const c=window.FIREBASE_CONFIG;if(!c||!c.apiKey)return;
try{for(const f of['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js'])await load(SDK+f);firebase.initializeApp(c);fdb=firebase.firestore();try{await fdb.enablePersistence({synchronizeTabs:true})}catch(e){}
const u=await new Promise(r=>{const o=firebase.auth().onAuthStateChanged(x=>{o();r(x)})});if(u)uid=u.uid;else fdb=null}catch(e){fdb=null}}
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const ar=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
const age=(y,m)=>{const x=(y-2001)*12+(m-11);return `${ar(Math.floor(x/12))} سنة و${ar(x%12)} شهر`};
const daysTo=()=>Math.ceil((new Date('2030-12-31T23:59:59')-new Date())/864e5);
const Q=['🌱 خطوة صغيرة كل يوم أحسن من اندفاعة وبعدها توقف.','🕋 اعمل اللي عليك والباقي على ربنا.','🔥 الانضباط هو الجسر بين الهدف والإنجاز.','🏗 اللي بتبنيه النهارده هو اللي هتعيش فيه سنة ٢٠٣٠.','💪 مش لازم تكون متحمس، لازم تكون ملتزم.','🌅 يوم جديد، صفحة جديدة، نية صافية.','📚 كل ساعة تعلّم دلوقتي بتتحوّل لفرصة بعدين.','🤲 والله عند ظن عبده به، فظنّ خيرًا واسعَ بقوة.'];
const wk=ds=>{const d=new Date(ds+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+3);const y=d.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y+'-W'+pad(1+Math.round(((d-f)/864e5-3+(f.getUTCDay()+6)%7)/7))};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function boot(){const sk=sessionStorage.lp_k;if(!sk){location.replace('index.html');await new Promise(()=>{})}
key=await crypto.subtle.importKey('raw',ub(sk),'AES-GCM',true,['encrypt','decrypt']);
if(ls.lp_chk){let ok=false;try{ok=await decS(ls.lp_chk)==='ok'}catch(e){}
if(!ok){if(confirm('بيانات النظام القديمة متشفّرة ببيانات دخول تانية. تمسحها وتبدأ من جديد؟')){ls.removeItem('lp_data');ls.removeItem('lp_chk')}else{await new Promise(()=>{})}}}
if(!ls.lp_chk)ls.lp_chk=await encS('ok')}
async function loadData(){data={};const local=async()=>{if(ls.lp_data)try{data=JSON.parse(await decS(ls.lp_data))}catch(e){data={}}};
if(!cloud())return local();
try{const qs=await fdb.collection(`users/${uid}/kv`).get();if(qs.empty&&qs.metadata.fromCache){fdb=null;return local()}
await Promise.all(qs.docs.map(async d=>{try{const s=await decS(d.data().c),v=JSON.parse(s);last[d.id]=s;if(d.id.startsWith('days:'))Object.assign(data.days=data.days||{},v);else data[d.id]=v}catch(e){console.warn('skip',d.id)}}));
if(qs.empty)await local()}catch(e){fdb=null;await local()}}
async function flush(){if(!cloud()){ls.lp_data=await encS(JSON.stringify(data));return}
const ch={};for(const k in data){if(k==='days'){const g={};for(const d in data.days){const m='days:'+d.slice(0,7);(g[m]=g[m]||{})[d]=data.days[d]}for(const m in g)ch[m]=JSON.stringify(g[m])}else ch[k]=JSON.stringify(data[k])}
const b=fdb.batch(),up=[];for(const k in ch){if(ch[k]===last[k])continue;const c=await encS(ch[k]);if(c.length>950000){alert('حجم بيانات "'+k+'" كبير أوي. قلّل النص.');continue}b.set(fdb.doc(`users/${uid}/kv/${k}`),{c});up.push(k)}
if(up.length)try{await b.commit();up.forEach(k=>last[k]=ch[k])}catch(e){console.error(e)}}
const save=()=>{clearTimeout(t);t=setTimeout(flush,400)};
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
const files={
put:async(k,blob)=>{if(!cloud())return L.put(k,blob);const c=b64(await enc(await blob.arrayBuffer()));if(c.length>950000){alert('الملف كبير أوي. صغّره أو قصّر التسجيل.');return}await fdb.doc(`users/${uid}/files/${k}`).set({t:blob.type,c});data.files=data.files||[];if(!data.files.includes(k)){data.files.push(k);save()}},
get:async k=>{if(cloud()){const s=await fdb.doc(`users/${uid}/files/${k}`).get();if(s.exists){const{t:ty,c}=s.data();return new Blob([await dec(ub(c).buffer)],{type:ty})}}return L.get(k)},
keys:async p=>[...new Set([...(cloud()?data.files||[]:[]).filter(k=>k.startsWith(p)),...await L.keys(p)])],
del:async k=>{if(cloud()){await fdb.doc(`users/${uid}/files/${k}`).delete();data.files=(data.files||[]).filter(x=>x!==k);save()}await L.del(k)}};
async function compose(blob,bg){const i=await createImageBitmap(blob),c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.fillStyle=bg==='dark'?'#1f2842':'#ffffff';g.fillRect(0,0,c.width,c.height);if(bg==='grid'){g.strokeStyle='#d9deea';g.lineWidth=1;for(let p=0;p<=c.width;p+=64){g.beginPath();g.moveTo(p,0);g.lineTo(p,c.height);g.stroke()}for(let p=0;p<=c.height;p+=64){g.beginPath();g.moveTo(0,p);g.lineTo(c.width,p);g.stroke()}}g.drawImage(i,0,0);return c.toDataURL('image/png')}
const pages=[['index','🏠 نظامي'],['today','🌅 اليوم'],['draw','✏️ الرسم'],['calendar','🗓 التقويم'],['vision','🔭 الرؤية'],['money','💰 الفلوس'],['review','📊 التقييم'],['letters','✉️ رسائل'],['challenge','🏆 التحدي']];
function nav(){const cur=location.pathname.split('/').pop().replace('.html','')||'index',h=document.createElement('header');h.className='bar';h.innerHTML='<a class=brand href="plan.html">🧭 Ahmed Plan</a><span class=sp></span><small class=m>'+(cloud()?'☁️ متزامن':'💾 على الجهاز بس')+'</small><button id=mn aria-label="القائمة">☰</button>';
const dw=document.createElement('aside');dw.className='drawer';dw.innerHTML=pages.map(([p,x])=>`<a href="${p}.html" class="${p===cur?'on':''}">${x}</a>`).join('')+'<hr style="border:0;border-top:1px solid var(--l);width:100%"><button id=ex>💾 نسخة احتياطية</button><button id=lk>🚪 خروج</button>';
const v=document.createElement('div');v.className='veil';document.body.prepend(v);document.body.prepend(dw);document.body.prepend(h);
const tg=o=>{dw.classList.toggle('o',o);v.classList.toggle('o',o)};$('#mn').onclick=()=>tg(!dw.classList.contains('o'));v.onclick=()=>tg(false);
$('#lk').onclick=async()=>{try{if(window.firebase&&firebase.apps.length)await firebase.auth().signOut()}catch(e){}sessionStorage.removeItem('lp_k');location.href='index.html'};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)]));a.download='my-system-backup-'+ymd(new Date())+'.json';a.click()}}
async function ready(fn){await new Promise(r=>document.readyState==='loading'?addEventListener('DOMContentLoaded',r):r());await boot();await cloudInit();await loadData();await new Promise(r=>{const s=document.createElement('script');s.src='photos.js';s.onload=s.onerror=r;document.head.append(s)});if(window.PHOTOS&&PHOTOS.length)document.body.style.setProperty('--ph',`url("img/${PHOTOS[Math.floor(Math.random()*PHOTOS.length)]}")`);document.body.classList.add('u');nav();fn(data,save)}
return{esc,ready,files,compose,flush,ymd,ar,age,$,pad,wk,daysTo,Q}})();
