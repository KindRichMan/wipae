(function(){
'use strict';
const KEY='wipae.easy.saved.v1';
const LAYOUT_KEY='wipae.easy.layout.v2';
const VERSION=2;
const $=s=>document.querySelector(s);
const DEFAULT_LAYOUT={fontScale:100,spacing:0,x:0,y:0};

function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v));renderList();}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function allControls(){return Array.from(document.querySelectorAll('input,select,textarea')).filter(el=>!el.closest('#easyToolsPanel')&&!el.closest('.hanja-popup'));}
function snapshot(){return allControls().map((el,i)=>({id:el.id||null,name:el.name||null,tag:el.tagName,type:el.type||null,index:i,value:(el.type==='checkbox'||el.type==='radio')?!!el.checked:el.value}));}
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
function isInd(){const p=$('#panelInd');return !!p&&getComputedStyle(p).display!=='none';}
function nativeSize(){return isInd()?{w:$('#iWidth'),h:$('#iHeight')}:{w:$('#mWidth'),h:$('#mHeight')};}
function currentLayout(){
  const n=nativeSize();
  return {
    fontScale:+($('#easyFontSize')?.value||DEFAULT_LAYOUT.fontScale),
    spacing:+($('#easySpacing')?.value||DEFAULT_LAYOUT.spacing),
    x:+($('#easyMoveX')?.value||DEFAULT_LAYOUT.x),
    y:+($('#easyMoveY')?.value||DEFAULT_LAYOUT.y),
    widthMm:n.w?Math.round((parseFloat(n.w.value)||0)*10):null,
    heightMm:n.h?Math.round((parseFloat(n.h.value)||0)*10):null
  };
}
function savedLayout(){try{return Object.assign({},DEFAULT_LAYOUT,JSON.parse(localStorage.getItem(LAYOUT_KEY)||'{}'))}catch{return {...DEFAULT_LAYOUT}}}
function saveLayout(l){localStorage.setItem(LAYOUT_KEY,JSON.stringify(l));}
function updateOutputs(){
  const map=[['easyFontSize','easyFontSizeOut'],['easySpacing','easySpacingOut'],['easyMoveX','easyMoveXOut'],['easyMoveY','easyMoveYOut']];
  map.forEach(([a,b])=>{const x=$('#'+a),o=$('#'+b);if(x&&o)o.textContent=x.value;});
}
function syncSizeFields(){
  const n=nativeSize(),w=$('#easyPaperW'),h=$('#easyPaperH');
  if(n.w&&w)w.value=Math.round((parseFloat(n.w.value)||0)*10);
  if(n.h&&h)h.value=Math.round((parseFloat(n.h.value)||0)*10);
}
function applyFrames(){
  const scale=+($('#easyFontSize')?.value||100)/100;
  document.querySelectorAll('.frame').forEach(f=>{
    let cur=parseFloat(f.style.getPropertyValue('--fs'));
    if(!Number.isFinite(cur))return;
    let base=parseFloat(f.dataset.easyBaseFs||'');
    if(!Number.isFinite(base)||Math.abs(cur-base*scale)>.15){base=cur/(scale||1);f.dataset.easyBaseFs=String(base);}
    f.style.setProperty('--fs',(base*scale)+'cqw');
  });
}
function applyVisual(save=true){
  const l=currentLayout();
  document.documentElement.style.setProperty('--easy-spacing',l.spacing+'px');
  document.documentElement.style.setProperty('--easy-x',l.x+'px');
  document.documentElement.style.setProperty('--easy-y',l.y+'px');
  applyFrames();updateOutputs();
  if(save)saveLayout(l);
}
function applySize(which){
  const n=nativeSize();
  if(which==='w'&&n.w){n.w.value=(+$('#easyPaperW').value||1)/10;n.w.dispatchEvent(new Event('input',{bubbles:true}));}
  if(which==='h'&&n.h){n.h.value=(+$('#easyPaperH').value||1)/10;n.h.dispatchEvent(new Event('input',{bubbles:true}));}
  setTimeout(()=>{syncSizeFields();applyVisual();},0);
}
function applyLayout(l){
  l=Object.assign({},DEFAULT_LAYOUT,l||{});
  if($('#easyFontSize'))$('#easyFontSize').value=l.fontScale;
  if($('#easySpacing'))$('#easySpacing').value=l.spacing;
  if($('#easyMoveX'))$('#easyMoveX').value=l.x;
  if($('#easyMoveY'))$('#easyMoveY').value=l.y;
  const n=nativeSize();
  if(l.widthMm&&n.w){n.w.value=l.widthMm/10;n.w.dispatchEvent(new Event('input',{bubbles:true}));}
  if(l.heightMm&&n.h){n.h.value=l.heightMm/10;n.h.dispatchEvent(new Event('input',{bubbles:true}));}
  setTimeout(()=>{syncSizeFields();applyVisual();},0);
}
function resetLayout(){
  ['easyFontSize','easySpacing','easyMoveX','easyMoveY'].forEach((id,i)=>{const el=$('#'+id);if(el)el.value=[100,0,0,0][i];});
  document.querySelectorAll('.frame').forEach(f=>delete f.dataset.easyBaseFs);
  applyVisual();
}
function saveCurrent(){
  const name=$('#easySaveName').value.trim()||('위패 '+new Date().toLocaleString('ko-KR'));
  const list=read();
  list.unshift({id:Date.now(),name,savedAt:new Date().toISOString(),controls:snapshot(),layout:currentLayout()});
  write(list);$('#easySaveName').value='';alert('현재 위패 구성을 저장했습니다.');
}
function loadOne(id){const x=read().find(v=>v.id===id);if(!x)return;restoreSnapshot(x.controls);setTimeout(()=>{applyLayout(x.layout||DEFAULT_LAYOUT);alert('저장한 위패를 불러왔습니다.');},30);}
function delOne(id){if(confirm('이 저장 위패를 삭제할까요?'))write(read().filter(v=>v.id!==id));}
function renderList(){
  const box=$('#easySavedList');if(!box)return;const list=read();
  if(!list.length){box.innerHTML='<div class="easy-empty">아직 저장된 위패가 없습니다.</div>';return;}
  box.innerHTML=list.map(x=>`<div class="easy-saved"><button class="easy-load" data-id="${x.id}">${esc(x.name)}</button><button class="easy-del" data-id="${x.id}">삭제</button></div>`).join('');
  box.querySelectorAll('.easy-load').forEach(b=>b.onclick=()=>loadOne(+b.dataset.id));
  box.querySelectorAll('.easy-del').forEach(b=>b.onclick=()=>delOne(+b.dataset.id));
}
function backup(){
  const payload={app:'wipae',feature:'easy-tools',version:VERSION,exportedAt:new Date().toISOString(),savedTablets:read(),layout:currentLayout()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a'),d=new Date();
  a.href=URL.createObjectURL(blob);a.download=`위패자료_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function restoreFile(file){
  const r=new FileReader();
  r.onload=()=>{try{const p=JSON.parse(r.result);if(p.app!=='wipae'||!Array.isArray(p.savedTablets))throw Error();if(!confirm(`백업에 저장된 위패 ${p.savedTablets.length}개를 불러올까요? 현재 저장 목록은 백업 내용으로 바뀝니다.`))return;write(p.savedTablets);if(p.layout)applyLayout(p.layout);alert('자료를 불러왔습니다.');}catch{alert('올바른 위패 백업 파일이 아닙니다.');}};r.readAsText(file,'utf-8');
}
function inject(){
  if($('#easyToolsPanel'))return;
  const style=document.createElement('style');style.textContent=`
  :root{--easy-spacing:0px;--easy-x:0px;--easy-y:0px}.seg{letter-spacing:var(--easy-spacing)!important}.zone{transform:translate(var(--easy-x),var(--easy-y))!important}
  #easyToolsToggle{position:fixed;right:14px;top:74px;z-index:8800;border:0;border-radius:12px;background:#6a4938;color:#fff;padding:11px 14px;font-weight:800;box-shadow:0 5px 18px #0003;cursor:pointer}
  #easyToolsPanel{position:fixed;right:14px;top:122px;z-index:8799;width:min(390px,calc(100vw - 28px));max-height:calc(100vh - 140px);overflow:auto;background:#fff;border:1px solid #d8cbb8;border-radius:15px;padding:17px;box-shadow:0 12px 35px #0003;display:none;font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif}#easyToolsPanel.on{display:block}.easy-title{font-size:21px;font-weight:900;margin:0 0 6px}.easy-help{font-size:12px;color:#776c61;line-height:1.5;margin-bottom:11px}.easy-sec{border-top:1px solid #eee3d5;padding-top:13px;margin-top:13px}.easy-sec>b{display:block;margin-bottom:8px;font-size:15px}.easy-in{width:100%;box-sizing:border-box;border:1px solid #cfc3b1;border-radius:9px;padding:10px;font-size:14px}.easy-btn{width:100%;border:0;border-radius:9px;padding:10px;margin-top:7px;background:#6a4938;color:#fff;font-weight:800;cursor:pointer}.easy-btn.sub{background:#f4eee5;color:#382a21;border:1px solid #d8cbb8}.easy-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.easy-size label{display:block;font-weight:800;margin-bottom:5px}.easy-slider{display:grid;grid-template-columns:88px 1fr 42px;gap:8px;align-items:center;margin:10px 0}.easy-slider input{width:100%}.easy-slider output{text-align:right;font-weight:700}.easy-saved{display:flex;gap:6px;margin:6px 0}.easy-load{flex:1;border:1px solid #d8cbb8;border-radius:8px;background:#fff;padding:9px;text-align:left;cursor:pointer}.easy-del{border:0;border-radius:8px;background:#8d4539;color:#fff;padding:7px 9px;cursor:pointer}.easy-empty{font-size:13px;color:#857a6d;padding:5px 0}@media(max-width:640px){#easyToolsPanel{top:112px}.easy-slider{grid-template-columns:82px 1fr 38px}}@media print{#easyToolsToggle,#easyToolsPanel{display:none!important}}
  `;document.head.appendChild(style);
  const t=document.createElement('button');t.id='easyToolsToggle';t.type='button';t.textContent='⚙ 크기 · 저장';document.body.appendChild(t);
  const p=document.createElement('aside');p.id='easyToolsPanel';p.innerHTML=`
    <div class="easy-title">크기와 배치</div><div class="easy-help">위패 크기와 글씨 위치를 보면서 쉽게 조정할 수 있습니다. 기존 위패 도안과 인쇄 기능은 그대로 사용합니다.</div>
    <div class="easy-row easy-size"><label>위패 가로(mm)<input id="easyPaperW" class="easy-in" type="number" min="30" max="250" step="1"></label><label>위패 세로(mm)<input id="easyPaperH" class="easy-in" type="number" min="80" max="500" step="1"></label></div>
    <div class="easy-slider"><span>글자 크기</span><input id="easyFontSize" type="range" min="60" max="150" value="100"><output id="easyFontSizeOut">100</output></div>
    <div class="easy-slider"><span>글자 간격</span><input id="easySpacing" type="range" min="0" max="30" value="0"><output id="easySpacingOut">0</output></div>
    <div class="easy-slider"><span>좌우 위치</span><input id="easyMoveX" type="range" min="-80" max="80" value="0"><output id="easyMoveXOut">0</output></div>
    <div class="easy-slider"><span>상하 위치</span><input id="easyMoveY" type="range" min="-120" max="120" value="0"><output id="easyMoveYOut">0</output></div>
    <button id="easyReset" class="easy-btn sub">배치 초기화</button>
    <div class="easy-sec"><b>현재 위패 저장</b><input id="easySaveName" class="easy-in" placeholder="예: 부친 기본 위패"><button id="easySaveBtn" class="easy-btn">현재 위패 저장</button></div>
    <div class="easy-sec"><b>저장된 위패</b><div id="easySavedList"></div></div>
    <div class="easy-sec"><b>자료 백업 / 불러오기</b><div class="easy-row"><button id="easyBackup" class="easy-btn sub">자료 백업하기</button><button id="easyRestore" class="easy-btn sub">자료 불러오기</button></div><input id="easyRestoreFile" type="file" accept="application/json,.json" hidden><div class="easy-help" style="margin-top:8px">저장된 위패와 크기·배치 설정을 한 파일로 백업합니다.</div></div>`;document.body.appendChild(p);
  t.onclick=()=>{p.classList.toggle('on');syncSizeFields();};
  $('#easyPaperW').onchange=()=>applySize('w');$('#easyPaperH').onchange=()=>applySize('h');
  ['easyFontSize','easySpacing','easyMoveX','easyMoveY'].forEach(id=>$('#'+id).oninput=()=>applyVisual());
  $('#easyReset').onclick=resetLayout;$('#easySaveBtn').onclick=saveCurrent;$('#easyBackup').onclick=backup;$('#easyRestore').onclick=()=>$('#easyRestoreFile').click();$('#easyRestoreFile').onchange=e=>{if(e.target.files[0])restoreFile(e.target.files[0]);e.target.value='';};
  renderList();syncSizeFields();applyLayout(savedLayout());
  document.addEventListener('click',e=>{if(e.target.closest('.modeTab,.styleTab,.perrow,#newBtn'))setTimeout(()=>{syncSizeFields();document.querySelectorAll('.frame').forEach(f=>delete f.dataset.easyBaseFs);applyVisual(false);},20);},true);
  new MutationObserver(()=>requestAnimationFrame(()=>applyFrames())).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();