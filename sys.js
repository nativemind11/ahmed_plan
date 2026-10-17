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
function lockUI(first){return new Promise(res=>{const o=document.createElement('div');o.className='lock';o.innerHTML=`<div><h1>🔒 نظامي</h1><p class=m>${first?'اعمل باسورد قوي (١٠ حروف على الأقل). لو نسيته مفيش طريقة لاسترجاع بياناتك.':'اكتب الباسورد'}</p><input id=p1 type=password placeholder="الباسورد">${first?'<input id=p2 type=password placeholder="أكّد الباسورد">':''}<button class=btn id=go>${first?'إنشاء':'فتح'}</button><p id=er style="color:#f87171"></p></div>`;document.body.append(o);
const go=async()=>{const p=$('#p1').value,er=$('#er');try{if(first){if(p.length<10)return er.textContent='الباسورد لازم يكون ١٠ حروف على الأقل';if(p!==$('#p2').value)return er.textContent='الباسورد مش متطابق';const s=crypto.getRandomValues(new Uint8Array(16));ls.lp_salt=b64(s);key=await dk(p,s);ls.lp_chk=await encS('ok')}else{key=await dk(p,ub(ls.lp_salt));if(await decS(ls.lp_chk)!=='ok')throw 0}sessionStorage.lp_k=b64(await crypto.subtle.exportKey('raw',key));o.remove();res()}catch(e){er.textContent='الباسورد غلط'}};
$('#go').onclick=go;o.onkeydown=e=>e.key==='Enter'&&go()})}
async function boot(){if(ls.lp_chk&&sessionStorage.lp_k){try{key=await crypto.subtle.importKey('raw',ub(sessionStorage.lp_k),'AES-GCM',true,['encrypt','decrypt']);if(await decS(ls.lp_chk)==='ok')return}catch(e){}}await lockUI(!ls.lp_chk)}
const save=()=>{clearTimeout(t);t=setTimeout(async()=>{ls.lp_data=await encS(JSON.stringify(data))},300)};
const pages=[['today','🌅 اليوم'],['calendar','🗓 التقويم'],['vision','🔭 الرؤية'],['money','💰 الفلوس'],['review','📊 التقييم']];
function nav(){const cur=location.pathname.split('/').pop().replace('.html','');const n=document.createElement('nav');n.className='nav';n.innerHTML=pages.map(([p,x])=>`<a href="${p}.html" class="${p===cur?'on':''}">${x}</a>`).join('')+'<span class=sp></span><button id=ex>💾 نسخة احتياطية</button><button id=im>📥 استيراد</button><button id=lk>🔒 قفل</button>';document.body.prepend(n);
$('#lk').onclick=()=>{sessionStorage.removeItem('lp_k');location.reload()};
$('#ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({s:ls.lp_salt,c:ls.lp_chk,d:ls.lp_data})]));a.download='my-system-backup-'+ymd(new Date())+'.json';a.click()};
$('#im').onclick=()=>{const i=document.createElement('input');i.type='file';i.onchange=async()=>{try{const j=JSON.parse(await i.files[0].text());if(!confirm('ده هيستبدل بياناتك الحالية، وهتحتاج الباسورد بتاع النسخة دي. متأكد؟'))return;ls.lp_salt=j.s;ls.lp_chk=j.c;ls.lp_data=j.d;sessionStorage.removeItem('lp_k');location.reload()}catch(e){alert('الملف غير صالح')}};i.click()}}
async function ready(fn){await new Promise(r=>document.readyState==='loading'?addEventListener('DOMContentLoaded',r):r());await boot();try{data=ls.lp_data?JSON.parse(await decS(ls.lp_data)):{}}catch(e){data={}}document.body.classList.add('u');nav();fn(data,save)}
return{ready,files,ymd,ar,age,$,pad,wk,daysTo,Q}})();
