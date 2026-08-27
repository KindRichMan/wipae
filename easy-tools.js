(function(){
'use strict';
const KEY='wipae.easy.saved.v1';
const VERSION=1;
const $=s=>document.querySelector(s);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v));renderList();}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function allControls(){return Array.from(document.querySelectorAll('input,select,textarea')).filter(el=>!el.closest('#easyToolsPanel')&&!el.closest('.hanja-popup'));}
function snapshot(){
  const controls=allControls();
  return controls.map((el,i)=>({
    id:el.id||null,
    name:el.name||null,
    tag:el.tagName,
    type:el.type||null,
    index:i,
    value:el.type==='checkbox'||el.type==='radio'?!!el.checked:el.value
  }));
}
function restoreSnapshot(items){
  const controls=allControls();
  (items||[]).forEach(x=>{
    let el=x.id?document.getElementById(x.id):null;
    if(!el&&x.name)el=document.querySelector(`[name="${CSS.escape(x.name)}"]`);
    if(!el&&Number.isInteger(x.index))el=controls[x.index];
    if(!el)return;
    if(el.type==='checkbox'||el.type==='radio')el.checked=!!x.value; else el.value=x.value??'';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
}
function saveCurrent(){
  const name=$('#easySaveName').value.trim()||('위패 '+new Date().toLocaleString('ko-KR'));
  const list=read();
  list.unshift({id:Date.now(),name,savedAt:new Date().toISOString(),controls:snapshot()});
  write(list);
  $('#easySaveName').value='';
  alert('현재 위패 구성을 저장했습니다.');
}
function loadOne(id){const x=read().find(v=>v.id===id);if(!x)return;restoreSnapshot(x.controls);alert('저장한 위패를 불러왔습니다.');}
function delOne(id){if(confirm('이 저장 위패를 삭제할까요?'))write(read().filter(v=>v.id!==id));}
function renderList(){
  const box=$('#easySavedList');if(!box)return;const list=read();
  if(!list.length){box.innerHTML='<div class="easy-empty">저장된 위패가 없습니다.</div>';return;}
  box.innerHTML=list.map(x=>`<div class="easy-saved"><button class="easy-load" data-id="${x.id}">${esc(x.name)}</button><button class="easy-del" data-id="${x.id}">삭제</button></div>`).join('');
  box.querySelectorAll('.easy-load').forEach(b=>b.onclick=()=>loadOne(+b.dataset.id));
  box.querySelectorAll('.easy-del').forEach(b=>b.onclick=()=>delOne(+b.dataset.id));
}
function backup(){
  const payload={app:'wipae',feature:'easy-tools',version:VERSION,exportedAt:new Date().toISOString(),savedTablets:read()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');const d=new Date();
  a.href=URL.createObjectURL(blob);a.download=`위패자료_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function restoreFile(file){
  const r=new FileReader();
  r.onload=()=>{try{
    const p=JSON.parse(r.result);
    if(p.app!=='wipae'||!Array.isArray(p.savedTablets))throw new Error();
    if(!confirm(`백업에 저장된 위패 ${p.savedTablets.length}개를 불러올까요? 현재 간편 저장 목록은 백업 내용으로 바뀝니다.`))return;
    write(p.savedTablets);alert('자료를 복원했습니다.');
  }catch{alert('올바른 위패 백업 파일이 아닙니다.');}};
  r.readAsText(file,'utf-8');
}
function inject(){
  if($('#easyToolsPanel'))return;
  const style=document.createElement('style');
  style.textContent=`
  #easyToolsToggle{position:fixed;right:14px;top:74px;z-index:8800;border:0;border-radius:12px;background:#6a4938;color:#fff;padding:11px 14px;font-weight:800;box-shadow:0 5px 18px #0003;cursor:pointer}
  #easyToolsPanel{position:fixed;right:14px;top:122px;z-index:8799;width:min(340px,calc(100vw - 28px));max-height:calc(100vh - 140px);overflow:auto;background:#fff;border:1px solid #d8cbb8;border-radius:15px;padding:15px;box-shadow:0 12px 35px #0003;display:none;font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif}
  #easyToolsPanel.on{display:block}.easy-title{font-size:18px;font-weight:900;margin:0 0 5px}.easy-help{font-size:12px;color:#776c61;line-height:1.5;margin-bottom:12px}.easy-sec{border-top:1px solid #eee3d5;padding-top:12px;margin-top:12px}.easy-sec b{display:block;margin-bottom:7px}.easy-in{width:100%;box-sizing:border-box;border:1px solid #cfc3b1;border-radius:9px;padding:10px;font-size:14px}.easy-btn{width:100%;border:0;border-radius:9px;padding:10px;margin-top:7px;background:#6a4938;color:#fff;font-weight:800;cursor:pointer}.easy-btn.sub{background:#f4eee5;color:#382a21;border:1px solid #d8cbb8}.easy-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}.easy-saved{display:flex;gap:6px;margin:6px 0}.easy-load{flex:1;border:1px solid #d8cbb8;border-radius:8px;background:#fff;padding:8px;text-align:left;cursor:pointer}.easy-del{border:0;border-radius:8px;background:#8d4539;color:#fff;padding:7px 9px;cursor:pointer}.easy-empty{font-size:13px;color:#857a6d;padding:5px 0}
  @media print{#easyToolsToggle,#easyToolsPanel{display:none!important}}
  `;document.head.appendChild(style);
  const t=document.createElement('button');t.id='easyToolsToggle';t.type='button';t.textContent='💾 간편 저장';document.body.appendChild(t);
  const p=document.createElement('aside');p.id='easyToolsPanel';p.innerHTML=`
    <div class="easy-title">간편 저장 · 백업</div>
    <div class="easy-help">현재 작성 중인 위패 구성을 저장해 다시 사용할 수 있습니다. 저장 자료는 이 PC 브라우저에 보관됩니다.</div>
    <div class="easy-sec"><b>현재 위패 저장</b><input id="easySaveName" class="easy-in" placeholder="예: 부친 기본 위패"><button id="easySaveBtn" class="easy-btn">현재 위패 저장</button></div>
    <div class="easy-sec"><b>저장된 위패</b><div id="easySavedList"></div></div>
    <div class="easy-sec"><b>자료 백업 / 복원</b><div class="easy-row"><button id="easyBackup" class="easy-btn sub">자료 백업하기</button><button id="easyRestore" class="easy-btn sub">자료 불러오기</button></div><input id="easyRestoreFile" type="file" accept="application/json,.json" hidden><div class="easy-help" style="margin-top:7px">PC 교체나 브라우저 데이터 삭제에 대비해 백업 파일을 따로 보관하세요.</div></div>`;
  document.body.appendChild(p);
  t.onclick=()=>p.classList.toggle('on');
  $('#easySaveBtn').onclick=saveCurrent;$('#easyBackup').onclick=backup;$('#easyRestore').onclick=()=>$('#easyRestoreFile').click();
  $('#easyRestoreFile').onchange=e=>{if(e.target.files[0])restoreFile(e.target.files[0]);e.target.value='';};
  renderList();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();