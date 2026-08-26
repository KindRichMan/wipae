(function(){
'use strict';
const DATA={
 relation:[
  ['아버지','父'],['어머니','母'],['할아버지','祖父'],['할머니','祖母'],['증조할아버지','曾祖父'],['증조할머니','曾祖母'],
  ['남편','夫'],['아내','妻'],['아들','子'],['딸','女'],['손자','孫子'],['손녀','孫女'],['형','兄'],['동생','弟'],['누나·언니','姉'],['여동생','妹'],['조상','先祖']
 ],
 chief:[['아들','子'],['딸','女'],['손자','孫子'],['손녀','孫女'],['증손자','曾孫子'],['증손녀','曾孫女'],['남편','夫'],['아내','妻'],['제자','弟子']],
 title:[['후인','后人'],['유인','孺人'],['학생','學生'],['처사','處士'],['공','公'],['대부인','大夫人']],
 surname:[
  ['김','金'],['이','李'],['박','朴'],['최','崔'],['정','鄭'],['강','姜'],['조','趙'],['윤','尹'],['장','張'],['임','林'],['한','韓'],
  ['오','吳'],['서','徐'],['신','申'],['권','權'],['황','黃'],['안','安'],['송','宋'],['전','全'],['홍','洪'],['유','柳'],['고','高'],
  ['문','文'],['양','梁'],['손','孫'],['배','裵'],['백','白'],['허','許'],['남','南'],['심','沈'],['노','盧'],['하','河'],['곽','郭'],
  ['성','成'],['차','車'],['주','朱'],['우','禹'],['구','具'],['민','閔'],['진','陳'],['지','池'],['엄','嚴'],['채','蔡'],['원','元'],
  ['천','千'],['방','方'],['공','孔'],['현','玄'],['함','咸'],['변','卞'],['염','廉'],['여','呂'],['추','秋'],['도','都'],['석','石']
 ]
};
let target=null,kind='relation';
function fire(inp,value){inp.value=value;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));}
function matches(arr,q){q=(q||'').trim().toLowerCase();if(!q)return arr;return arr.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q));}
function chips(box,arr,inp,close){box.innerHTML='';arr.forEach(x=>{const b=document.createElement('button');b.type='button';b.className='hanja-chip';b.innerHTML='<span>'+x[0]+'</span><span class="hz">'+x[1]+'</span>';b.onclick=()=>{fire(inp,x[1]);if(close)hide();};box.appendChild(b);});if(!arr.length){const e=document.createElement('div');e.className='hanja-empty';e.textContent='검색 결과가 없습니다. 기존 입력칸에 직접 입력할 수도 있습니다.';box.appendChild(e);}}
function ensurePopup(){if(document.getElementById('hanjaPopup'))return;const p=document.createElement('div');p.id='hanjaPopup';p.className='hanja-popup';p.innerHTML='<div class="hanja-card"><div class="hanja-card-head"><b id="hanjaPopTitle">한자 쉽게 입력</b><span></span><button type="button" class="hanja-close">✕ 닫기</button></div><input id="hanjaSearch" class="hanja-search" placeholder="한글로 검색하세요. 예: 아버지, 김, 유인"><div id="hanjaResults" class="hanja-results"></div><div class="hanja-help-note">원하는 항목을 누르면 입력칸에 한자가 자동으로 들어갑니다. 찾는 글자가 없으면 닫고 직접 입력해 주세요.</div></div>';document.body.appendChild(p);p.querySelector('.hanja-close').onclick=hide;p.onclick=e=>{if(e.target===p)hide();};document.getElementById('hanjaSearch').oninput=renderPopup;}
function show(inp,k,label){ensurePopup();target=inp;kind=k;document.getElementById('hanjaPopTitle').textContent=(label||'한자')+' 선택';const s=document.getElementById('hanjaSearch');s.value='';document.getElementById('hanjaPopup').classList.add('on');renderPopup();setTimeout(()=>s.focus(),0);}
function hide(){const p=document.getElementById('hanjaPopup');if(p)p.classList.remove('on');target=null;}
function renderPopup(){if(!target)return;const q=document.getElementById('hanjaSearch').value;chips(document.getElementById('hanjaResults'),matches(DATA[kind]||[],q),target,true);}
function addButton(inp,k,label){if(!inp||inp.dataset.hanjaReady)return;inp.dataset.hanjaReady='1';const w=document.createElement('div');w.className='hanja-field-wrap';const b=document.createElement('button');b.type='button';b.className='hanja-open';b.textContent='🔎 '+label+' 한자로 쉽게 선택';b.onclick=()=>show(inp,k,label);w.appendChild(b);inp.insertAdjacentElement('afterend',w);}
function decorate(){addButton(document.getElementById('cRel'),'chief','제주 관계');addButton(document.getElementById('cSur'),'surname','성씨');const cards=document.querySelectorAll('#deadList .dead');cards.forEach(card=>{const fields=card.querySelectorAll('.fld');fields.forEach(f=>{const lab=(f.querySelector('label')||{}).textContent||'';const inp=f.querySelector('input');if(lab==='관계')addButton(inp,'relation','관계');else if(lab==='존칭')addButton(inp,'title','존칭');else if(lab==='성')addButton(inp,'surname','성씨');});});}
function quickPanel(){const grp=document.querySelector('#panelInd .scroll .grp:nth-of-type(2)');if(!grp||document.getElementById('hanjaQuick'))return;const d=document.createElement('div');d.id='hanjaQuick';d.className='hanja-tools';d.innerHTML='<div class="hanja-tools-title">자주 쓰는 한자 — 누르면 바로 입력됩니다</div><div class="hanja-section"><h3>제주 관계</h3><div class="hanja-quick" id="hqChief"></div></div><div class="hanja-section"><h3>성씨</h3><div class="hanja-quick" id="hqSur"></div></div><div class="hanja-help-note">더 많은 항목은 각 입력칸 아래의 「한자로 쉽게 선택」을 눌러 한글로 검색하세요.</div>';grp.appendChild(d);chips(document.getElementById('hqChief'),DATA.chief.slice(0,6),document.getElementById('cRel'),false);chips(document.getElementById('hqSur'),DATA.surname.slice(0,10),document.getElementById('cSur'),false);}
function observe(){const dl=document.getElementById('deadList');if(dl)new MutationObserver(()=>decorate()).observe(dl,{childList:true,subtree:true});}
function init(){quickPanel();decorate();observe();document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();