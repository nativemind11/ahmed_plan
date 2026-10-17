const LP=(()=>{
const E=new TextEncoder(),D=new TextDecoder(),ls=localStorage,$=(s,r=document)=>r.querySelector(s);
const b64=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s)};
const ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let key,data={},t;
const dk=async(pw,salt)=>crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},await crypto.subtle.importKey('raw',E.encode(pw),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},true,['encrypt','decrypt']);
const enc=async buf=>{const iv=crypto.getRandomValues(new Uint8Array(12)),c=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,buf)),o=new Uint8Array(12+c.length);o.set(iv);o.set(c,12);return o.buffer};
const dec=async buf=>{const a=new Uint8Array(buf);return crypto.subtle.decrypt({name:'AES-GCM',iv:a.slice(0,12)},key,a.slice(12))};
const encS=async s=>b64(await enc(E.encode(s))),decS=async s=>D.decode(await dec(ub(s).buffer));
const db=()=>new Promise((res,rej)=>{const r=indexedDB.open('sys',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=rej});
const tx=async(m,f)=>{const d=await db();return new Promise((res,rej)=>{const x=d.transaction('f',m),q=f(x.objectStore('f'));x.oncomplete=()=>res(q&&q.result);x.onerror=rej})};
const files={
put:async(k,blob)=>{const b=await enc(await blob.arrayBuffer());return tx('readwrite',s=>s.put({t:blob.type,b},k))},
get:async k=>{const v=await tx('readonly',s=>s.get(k));return v?new Blob([await dec(v.b)],{type:v.t}):null},
keys:async p=>(await tx('readonly',s=>s.getAllKeys())).filter(k=>k.startsWith(p)),
del:k=>tx('readwrite',s=>s.delete(k))};
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const ar=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
const age=(y,m)=>{const x=(y-2001)*12+(m-11);return `${ar(Math.floor(x/12))} سنة و${ar(x%12)} شهر`};
const daysTo=()=>Math.ceil((new Date('2030-12-31T23:59:59')-new Date())/864e5);
const Q=['🌱 خطوة صغيرة كل يوم أحسن من اندفاعة وبعدها توقف.','🕋 اعمل اللي عليك والباقي على ربنا.','🔥 الانضباط هو الجسر بين الهدف والإنجاز.','🏗 اللي بتبنيه النهارده هو اللي هتعيش فيه سنة ٢٠٣٠.','💪 مش لازم تكون متحمس، لازم تكون ملتزم.','🌅 يوم جديد، صفحة جديدة، نية صافية.','📚 كل ساعة تعلّم دلوقتي بتتحوّل لفرصة بعدين.','🤲 والله عند ظن عبده به، فظنّ خيرًا واسعَ بقوة.'];
const wk=ds=>{const d=new Date(ds+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7+3);const y=d.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y+'-W'+pad(1+Math.round(((d-f)/864e5-3+(f.getUTCDay()+6)%7)/7))};
async function boot(){const sk=sessionStorage.lp_k;if(!sk){location.replace('index.html');await new Promise(()=>{})}
key=await crypto.subtle.importKey('raw',ub(sk),'AES-GCM',true,['encrypt','decrypt']);
if(ls.lp_chk){let ok=false;try{ok=await decS(ls.lp_chk)==='ok'}catch(e){}
if(!ok){if(confirm('بيانات النظام القديمة متشفّرة ببيانات دخول تانية. تمسحها وتبدأ من جديد؟ لو عندك نسخة احتياطية استوردها بعد كده.')){ls.removeItem('lp_data');ls.removeItem('lp_chk')}else{await new Promise(()=>{})}}}
if(!ls.lp_chk)ls.lp_chk=await encS('ok')}
const save=()=>{clearTimeout(t);t=setTimeout(async()=>{ls.lp_data=await encS(JSON.stringify(data))},300)};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pages=[['index','🧭 الخطة'],['today','🌅 اليوم'],['calendar','🗓 التقويم'],['vision','🔭 الرؤية'],['money','💰 الفلوس'],['review','📊 التقييم'],['letters','✉️ رسائل'],['challenge','🏆 التحدي']];
function nav(){const cur=location.pathname.split('/').pop().replace('.html','')||'index';const n=document.createElement('nav');n.className='nav';n.innerHTML=pages.map(([p,x])=>`<a href="${p}.html" class="${p===cur?'on':''}">${x}</a>`).join('')+'<span class=sp></span><button id=ex>💾 نسخة احتياطية</button><button id=im>📥 استيراد</button><button id=lk>🔒 قفل</button>';document.body.prepend(n);
$('#lk').onclick=()=>{sessionStorage.removeItem('lp_k');location.href='index.html'};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({c:ls.lp_chk,d:ls.lp_data})]));a.download='my-system-backup-'+ymd(new Date())+'.json';a.click()};
$('#im').onclick=()=>{const i=document.createElement('input');i.type='file';i.onchange=async()=>{try{const j=JSON.parse(await i.files[0].text());if(!confirm('ده هيستبدل بياناتك الحالية، وهتحتاج الباسورد بتاع النسخة دي. متأكد؟'))return;ls.lp_chk=j.c;ls.lp_data=j.d;location.reload()}catch(e){alert('الملف غير صالح')}};i.click()}}
async function ready(fn){await new Promise(r=>document.readyState==='loading'?addEventListener('DOMContentLoaded',r):r());await boot();try{data=ls.lp_data?JSON.parse(await decS(ls.lp_data)):{}}catch(e){data={}}await new Promise(r=>{const s=document.createElement('script');s.src='photos.js';s.onload=s.onerror=r;document.head.append(s)});if(window.PHOTOS&&PHOTOS.length)document.body.style.setProperty('--ph',`url("img/${PHOTOS[Math.floor(Math.random()*PHOTOS.length)]}")`);document.body.classList.add('u');nav();fn(data,save)}
return{esc,ready,files,ymd,ar,age,$,pad,wk,daysTo,Q}})();
