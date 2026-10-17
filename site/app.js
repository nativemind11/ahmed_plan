// ===== خطة أحمد — تتبّع الإنجاز والمهارات =====
// كل حاجة بتتخزن في localStorage على نفس الجهاز/المتصفح.

const LS_PREFIX = "ahmedplan_";

function lsGet(key, fallback){
  try{
    const v = localStorage.getItem(LS_PREFIX + key);
    return v === null ? fallback : JSON.parse(v);
  }catch(e){ return fallback; }
}
function lsSet(key, value){
  try{ localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); }catch(e){}
}

/* ---------- خطوات المرحلة: تعليم "تم" ---------- */
function initSteps(){
  const cards = document.querySelectorAll(".step-card[data-step-id]");
  if(!cards.length) return;

  cards.forEach(card => {
    const id = card.getAttribute("data-step-id");
    const box = document.createElement("label");
    box.className = "step-check";
    box.innerHTML = `<input type="checkbox" /> <span>تم ✓</span>`;
    card.prepend(box);
    const input = box.querySelector("input");

    const done = lsGet("step_" + id, false);
    input.checked = done;
    if(done) card.classList.add("done");

    input.addEventListener("change", () => {
      lsSet("step_" + id, input.checked);
      card.classList.toggle("done", input.checked);
      updateProgressBar();
    });
  });

  updateProgressBar();
}

function updateProgressBar(){
  const bar = document.getElementById("progress-bar");
  if(!bar) return;
  const cards = document.querySelectorAll(".step-card[data-step-id]");
  const total = cards.length;
  const done = document.querySelectorAll(".step-card.done").length;
  const pct = total ? Math.round((done/total)*100) : 0;
  bar.querySelector(".progress-fill").style.width = pct + "%";
  bar.querySelector(".progress-label").textContent = `${done} من ${total} خطوة مكتملة (${pct}%)`;
}

/* ---------- تقدّم كل مرحلة في الصفحة الرئيسية ---------- */
function initHomeProgress(){
  const nodes = document.querySelectorAll("[data-phase-total]");
  if(!nodes.length) return;
  nodes.forEach(node => {
    const phase = node.getAttribute("data-phase");
    const total = parseInt(node.getAttribute("data-phase-total"), 10);
    let done = 0;
    for(let i=1;i<=total;i++){
      if(lsGet(`step_${phase}-step-${i}`, false)) done++;
    }
    const pct = total ? Math.round((done/total)*100) : 0;
    const label = node.querySelector(".mini-progress-label");
    const fill = node.querySelector(".mini-progress-fill");
    if(label) label.textContent = `${done}/${total} مكتملة`;
    if(fill) fill.style.width = pct + "%";
  });
}

/* ---------- قائمة المهارات والمعرفة المطلوبة ---------- */
function initSkills(defaultItems, pageKey){
  const list = document.getElementById("skills-list");
  if(!list) return;

  let items = lsGet("skills_" + pageKey, null);
  if(!items){
    items = defaultItems.map((text, i) => ({ id: "d"+i, text, done:false, note:"" }));
  }

  function save(){ lsSet("skills_" + pageKey, items); }

  function render(){
    list.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "skill-item" + (item.done ? " done" : "");

      const row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML = `
        <label class="skill-check">
          <input type="checkbox" ${item.done ? "checked" : ""}/>
          <span>${item.text}</span>
        </label>
        <button type="button" class="note-toggle" title="أضف ملاحظة">📝</button>
        ${item.custom ? '<button type="button" class="del-btn" title="حذف">✕</button>' : ""}
      `;
      li.appendChild(row);

      const noteBox = document.createElement("textarea");
      noteBox.className = "skill-note";
      noteBox.placeholder = "اكتب هنا أي حاجة اتعلمتها أو مصدر مفيد...";
      noteBox.value = item.note || "";
      noteBox.style.display = item.noteOpen ? "block" : "none";
      li.appendChild(noteBox);

      row.querySelector("input").addEventListener("change", e => {
        item.done = e.target.checked;
        li.classList.toggle("done", item.done);
        save();
      });
      row.querySelector(".note-toggle").addEventListener("click", () => {
        item.noteOpen = !item.noteOpen;
        noteBox.style.display = item.noteOpen ? "block" : "none";
      });
      noteBox.addEventListener("input", () => {
        item.note = noteBox.value;
        save();
      });
      const delBtn = row.querySelector(".del-btn");
      if(delBtn){
        delBtn.addEventListener("click", () => {
          items = items.filter(it => it.id !== item.id);
          save();
          render();
        });
      }

      list.appendChild(li);
    });
  }

  render();

  const form = document.getElementById("skills-add-form");
  if(form){
    form.addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("skills-add-input");
      const text = input.value.trim();
      if(!text) return;
      items.push({ id: "c" + Date.now(), text, done:false, note:"", custom:true });
      input.value = "";
      save();
      render();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSteps();
  initHomeProgress();
});
