(async()=>{
const E=new TextEncoder(),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),P=document.getElementById('p'),salt=ub(P.dataset.s),it=+P.dataset.i,blob=ub(P.textContent.trim());
const b64=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s)};
const open=async k=>{try{return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:blob.slice(0,12)},k,blob.slice(12)))}catch(e){return null}};
const derive=async(em,pw)=>{const m=await crypto.subtle.importKey('raw',E.encode(pw),'PBKDF2',false,['deriveKey']),e=E.encode(em.trim().toLowerCase()),s=new Uint8Array(salt.length+e.length);s.set(salt);s.set(e,salt.length);return crypto.subtle.deriveKey({name:'PBKDF2',salt:s,iterations:it,hash:'SHA-256'},m,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])};
const show=h=>{document.open();document.write(h);document.close()};
if(sessionStorage.lp_k){try{const h=await open(await crypto.subtle.importKey('raw',ub(sessionStorage.lp_k),'AES-GCM',true,['decrypt']));if(h)return show(h)}catch(e){}sessionStorage.removeItem('lp_k')}
const o=document.createElement('div');o.className='lock';o.innerHTML='<form><h1>🧭 Ahmed Plan</h1><p class=m>سجّل دخولك</p><input id=em type=email placeholder="الإيميل" autocomplete=username required><input id=pw type=password placeholder="الباسورد" autocomplete=current-password required><button class=btn id=go>دخول</button><p id=er style="color:#f87171"></p></form>';document.body.append(o);
o.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=o.querySelector('#go'),er=o.querySelector('#er');b.disabled=true;er.textContent='';try{const k=await derive(o.querySelector('#em').value,o.querySelector('#pw').value),h=await open(k);if(h){sessionStorage.lp_k=b64(await crypto.subtle.exportKey('raw',k));return show(h)}er.textContent='الإيميل أو الباسورد غلط'}catch(x){er.textContent='حصل خطأ، جرّب تاني'}b.disabled=false};
})();
