/* ═══════════════════════════════════════════════════════════════
   NEVEL MED · App de Conteúdo — lógica
   ═══════════════════════════════════════════════════════════════ */

/* ---------- Constantes ---------- */
const TYPES = [
  { id:'reels',     label:'Reels' },
  { id:'carrossel', label:'Carrossel' },
  { id:'story',     label:'Story' },
  { id:'imagem',    label:'Imagem' },
  { id:'live',      label:'Live' },
];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const WEEKDAYS_LONG = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

/* ---------- Ícones (inline SVG) ---------- */
const I = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  chevL:'<path d="m15 18-6-6 6-6"/>',
  chevR:'<path d="m9 18 6-6-6-6"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  drive:'<path d="M8 3 2 14l3 5 6-11zM16 3H8l6 11h8zM14 14H7l-3 5h13z"/>',
  trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  send:'<path d="m22 2-7 20-4-9-9-4 20-7z"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chart:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
  reach:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  comment:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  instagram:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  trend:'<path d="m3 17 6-6 4 4 8-8M21 7v6h-6"/>',
};
function icon(name, w=18){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="${w}" height="${w}">${I[name]||''}</svg>`}

/* ---------- Estado ---------- */
const STORE_KEY = 'nevel_posts_v1';
let posts = load();
let viewDate = new Date(); viewDate.setDate(1);
let activeDayKey = null;
let editingId = null;
let draftType = 'reels';

function load(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }catch{ return {}; }
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(posts)); }

/* ---------- Utilidades de data ---------- */
function keyOf(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); }
function isToday(d){ const t=new Date(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate(); }
function uid(){ return 'p'+Math.random().toString(36).slice(2,9); }
function postsFor(key){ return (posts[key]||[]).slice().sort((a,b)=>(a.time||'').localeCompare(b.time||'')); }

/* ---------- Perfis do Instagram ---------- */
const PROF_KEY = 'nevel_profiles_v1';
const PROFILE_PALETTE = ['#06C4FE','#2D5AD8','#10B981','#F59E0B','#8B5CF6','#EF4444'];
let profiles = loadProfiles();
let activeProfileFilter = 'all';
let draftProfile = profiles[0] ? profiles[0].id : null;

function loadProfiles(){
  try{ const p = JSON.parse(localStorage.getItem(PROF_KEY)); if(Array.isArray(p) && p.length) return p; }catch{}
  return [
    { id:'pf1', name:'@nevel.med', color:PROFILE_PALETTE[0] },
    { id:'pf2', name:'@perfil 2',  color:PROFILE_PALETTE[1] },
  ];
}
function saveProfiles(){ localStorage.setItem(PROF_KEY, JSON.stringify(profiles)); }
function profileById(id){ return profiles.find(p=>p.id===id) || null; }
function nextProfileColor(){ return PROFILE_PALETTE[profiles.length % PROFILE_PALETTE.length]; }
function matchesFilter(p){ return activeProfileFilter==='all' || p.profile===activeProfileFilter; }

/* ---------- Backend (Vercel /api) ---------- */
// Quando aberto localmente (file://), não há backend → o app cai no modo demo.
// Em produção (https), usa as rotas reais.
const ON_SERVER = location.protocol === 'http:' || location.protocol === 'https:';
async function api(path, { method='GET', body } = {}){
  const opts = { method, headers:{}, credentials:'same-origin' };
  if(body){ opts.headers['Content-Type']='application/json'; opts.body=JSON.stringify(body); }
  const r = await fetch(path, opts);
  let data = {}; try{ data = await r.json(); }catch{}
  if(!r.ok){ const e = new Error(data.error || ('HTTP '+r.status)); e.status = r.status; e.data = data; throw e; }
  return data;
}

/* ═══════════════════════  NAVEGAÇÃO ENTRE TELAS  ═══════════════════════ */
function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+name));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
}

/* ═══════════════════════  CALENDÁRIO  ═══════════════════════ */
function renderCalendar(){
  const y=viewDate.getFullYear(), m=viewDate.getMonth();
  document.getElementById('cal-month-label').textContent = `${MONTHS[m]} ${y}`;

  const first = new Date(y,m,1);
  const startOffset = first.getDay();              // 0 = domingo
  const daysInMonth = new Date(y,m+1,0).getDate();
  const daysPrev = new Date(y,m,0).getDate();

  const cells = [];
  // dias do mês anterior (preenchimento)
  for(let i=startOffset-1;i>=0;i--) cells.push({day:daysPrev-i, outside:true, date:new Date(y,m-1,daysPrev-i)});
  // dias do mês
  for(let d=1; d<=daysInMonth; d++) cells.push({day:d, outside:false, date:new Date(y,m,d)});
  // completa última semana
  while(cells.length % 7 !== 0){ const d=cells.length-(startOffset+daysInMonth)+1; cells.push({day:d, outside:true, date:new Date(y,m+1,d)}); }

  const grid = document.getElementById('cal-days');
  grid.innerHTML = cells.map(c=>{
    const key = keyOf(c.date);
    const dayPosts = postsFor(key).filter(matchesFilter);
    const evtHtml = dayPosts.slice(0,3).map(p=>{
      const t = TYPES.find(t=>t.id===p.type)?.label || p.type;
      const title = p.content ? p.content.split('\n')[0] : t;
      const pr = profileById(p.profile);
      const profDot = `<span class="evt-prof" style="background:${pr?pr.color:'var(--color-neutral-400)'}"></span>`;
      return `<div class="evt t-${p.type}">${profDot}<span class="evt-time">${p.time||'--:--'}</span><span class="evt-title">${escapeHtml(title)}</span></div>`;
    }).join('');
    const more = dayPosts.length>3 ? `<div class="evt-more">+${dayPosts.length-3} mais</div>` : '';
    return `<div class="cal-cell ${c.outside?'outside':''} ${isToday(c.date)?'today':''} ${dayPosts.length?'has-events':''}" data-key="${key}" data-outside="${c.outside}">
      <span class="day-num">${c.day}</span>
      <button class="cell-add" data-add="${key}" title="Adicionar conteúdo">${icon('plus',15)}</button>
      <div class="day-events">${evtHtml}${more}</div>
    </div>`;
  }).join('');
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ═══════════════════════  DRAWER (detalhe do dia)  ═══════════════════════ */
function openDay(key, focusForm=false){
  activeDayKey = key; editingId = null; draftType='reels';
  const d = parseKey(key);
  document.getElementById('drawer-weekday').textContent = WEEKDAYS_LONG[d.getDay()];
  document.getElementById('drawer-date').textContent = `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  renderDayList();
  resetForm();
  document.getElementById('overlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  if(focusForm) setTimeout(()=>document.getElementById('f-content')?.focus(),300);
}
function closeDrawer(){
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  activeDayKey=null; editingId=null;
}

function renderDayList(){
  const list = document.getElementById('day-list');
  const dayPosts = postsFor(activeDayKey);
  document.getElementById('day-count').textContent = dayPosts.length ? `${dayPosts.length} ${dayPosts.length>1?'conteúdos':'conteúdo'}` : '';
  if(!dayPosts.length){
    list.innerHTML = `<div class="day-list-empty">Nenhum conteúdo agendado.<br>Preencha o formulário abaixo para programar o primeiro.</div>`;
    return;
  }
  list.innerHTML = dayPosts.map(p=>{
    const t = TYPES.find(t=>t.id===p.type);
    const title = p.content ? p.content.split('\n')[0] : (t?.label||p.type);
    const pr = profileById(p.profile);
    const profPill = pr ? `<span class="type-pill prof-tag"><span class="dot" style="background:${pr.color}"></span>${escapeHtml(pr.name)}</span>` : '';
    return `<div class="post-card ${editingId===p.id?'editing':''}" data-edit="${p.id}">
      <div class="post-card-top">
        <span class="post-card-time">${icon('clock',14)} ${p.time||'--:--'}</span>
      </div>
      <div class="post-card-title">${escapeHtml(title)}</div>
      <div class="post-card-meta">
        ${profPill}
        <span class="type-pill type-${p.type}"><span class="dot"></span>${t?.label||p.type}</span>
        ${p.driveUrl?`<span class="type-pill type-imagem"><span class="dot"></span>Drive</span>`:''}
      </div>
    </div>`;
  }).join('');
}

function renderSegmented(){
  document.getElementById('seg-type').innerHTML = TYPES.map(t=>
    `<button type="button" class="seg ${draftType===t.id?'active':''}" data-type="${t.id}">
      <span class="dot" style="background:var(--type-${t.id})"></span>${t.label}</button>`
  ).join('');
  renderProfileSeg();
}

/* Seletor de perfil no formulário */
function renderProfileSeg(){
  const el = document.getElementById('seg-profile');
  if(!el) return;
  if(!profiles.length){ el.innerHTML = `<span class="hint">Nenhum perfil — clique em "Gerenciar perfis".</span>`; return; }
  el.innerHTML = profiles.map(pr=>
    `<button type="button" class="seg ${draftProfile===pr.id?'active':''}" data-prof="${pr.id}">
      <span class="dot" style="background:${pr.color}"></span>${escapeHtml(pr.name)}</button>`
  ).join('');
}

/* Filtro de perfil no topo do calendário */
function renderProfileFilter(){
  const el = document.getElementById('profile-filter');
  if(!el) return;
  const pill = (id,label,color)=>`<button class="prof-pill ${activeProfileFilter===id?'active':''}" data-filter="${id}">${color?`<span class="dot" style="background:${color}"></span>`:''}${escapeHtml(label)}</button>`;
  el.innerHTML = pill('all','Todos','') + profiles.map(pr=>pill(pr.id,pr.name,pr.color)).join('');
}

/* Gerenciador de perfis (modal) */
function openProfManager(){
  renderProfManager();
  document.getElementById('prof-overlay').classList.add('open');
  document.getElementById('prof-modal').classList.add('open');
}
function closeProfManager(){
  document.getElementById('prof-overlay').classList.remove('open');
  document.getElementById('prof-modal').classList.remove('open');
}
function renderProfManager(){
  const list = document.getElementById('prof-list');
  list.innerHTML = profiles.map(pr=>
    `<div class="prof-row" data-id="${pr.id}">
      <button class="prof-color" data-color="${pr.id}" style="background:${pr.color}" title="Trocar cor"></button>
      <input class="prof-name-input" data-name="${pr.id}" value="${escapeHtml(pr.name)}" placeholder="@perfil" maxlength="30">
      <button class="btn-icon-del" data-del="${pr.id}" title="Remover perfil">${icon('trash',16)}</button>
    </div>`
  ).join('') || `<div class="day-list-empty">Nenhum perfil ainda. Adicione o primeiro.</div>`;
}
function afterProfilesChanged(){
  renderProfileFilter(); renderCalendar(); renderProfileSeg();
}
function addProfile(){
  profiles.push({ id:'pf'+uid(), name:'@novo perfil', color:nextProfileColor() });
  saveProfiles(); renderProfManager(); afterProfilesChanged();
}
function cycleProfileColor(id){
  const pr = profileById(id); if(!pr) return;
  const i = PROFILE_PALETTE.indexOf(pr.color);
  pr.color = PROFILE_PALETTE[(i+1)%PROFILE_PALETTE.length];
  saveProfiles(); renderProfManager(); afterProfilesChanged();
}
function renameProfile(id, name){
  const pr = profileById(id); if(!pr) return;
  pr.name = name.trim() || pr.name;
  saveProfiles(); afterProfilesChanged();
}
function deleteProfile(id){
  profiles = profiles.filter(p=>p.id!==id);
  if(activeProfileFilter===id) activeProfileFilter='all';
  if(draftProfile===id) draftProfile = profiles[0]?profiles[0].id:null;
  saveProfiles(); renderProfManager(); afterProfilesChanged();
}

function resetForm(){
  editingId=null; draftType='reels';
  draftProfile = profiles[0] ? profiles[0].id : null;
  document.getElementById('f-content').value='';
  document.getElementById('f-time').value='';
  document.getElementById('f-drive').value='';
  document.getElementById('f-caption').value='';
  document.getElementById('btn-delete').style.display='none';
  document.getElementById('form-title').textContent = 'Novo conteúdo';
  updateCharCount();
  renderSegmented();
  renderDayList();
}

function loadIntoForm(id){
  const p = (posts[activeDayKey]||[]).find(x=>x.id===id);
  if(!p) return;
  editingId=id; draftType=p.type;
  draftProfile = p.profile || (profiles[0]?profiles[0].id:null);
  document.getElementById('f-content').value=p.content||'';
  document.getElementById('f-time').value=p.time||'';
  document.getElementById('f-drive').value=p.driveUrl||'';
  document.getElementById('f-caption').value=p.caption||'';
  document.getElementById('btn-delete').style.display='inline-flex';
  document.getElementById('form-title').textContent = 'Editar conteúdo';
  updateCharCount();
  renderSegmented();
  renderDayList();
  document.getElementById('f-content').focus();
}

function collectForm(){
  return {
    type: draftType,
    profile: draftProfile,
    content: document.getElementById('f-content').value.trim(),
    time: document.getElementById('f-time').value,
    driveUrl: document.getElementById('f-drive').value.trim(),
    caption: document.getElementById('f-caption').value.trim(),
  };
}

function saveForm(){
  const data = collectForm();
  if(!data.content && !data.caption){ toast('Preencha o conteúdo ou a legenda', false); return; }
  if(!posts[activeDayKey]) posts[activeDayKey]=[];
  if(editingId){
    const p = posts[activeDayKey].find(x=>x.id===editingId);
    Object.assign(p, data);
    toast('Conteúdo atualizado');
  } else {
    const p = { id:uid(), ...data };
    posts[activeDayKey].push(p);
    editingId = p.id;
    toast('Conteúdo salvo');
  }
  save();
  renderCalendar();
  renderDayList();
}

function deletePost(){
  if(!editingId) return;
  posts[activeDayKey] = (posts[activeDayKey]||[]).filter(p=>p.id!==editingId);
  if(!posts[activeDayKey].length) delete posts[activeDayKey];
  save(); renderCalendar(); resetForm(); toast('Conteúdo removido');
}

function updateCharCount(){
  const v = document.getElementById('f-caption').value.length;
  document.getElementById('caption-count').textContent = `${v} / 2200`;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, ok=true){
  const el=document.getElementById('toast');
  el.querySelector('span').textContent=msg;
  el.querySelector('svg').style.color = ok ? 'var(--color-primary)' : 'var(--color-error)';
  el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}

/* ═══════════════════════  SEED (exemplo inicial)  ═══════════════════════ */
const SEED_KEY = 'nevel_seeded_v1';
function seedIfEmpty(){
  // só semeia uma única vez (na primeira abertura). Depois disso, nunca mais
  // re-insere os exemplos — assim conteúdos excluídos não voltam ao recarregar.
  if(localStorage.getItem(SEED_KEY)==='1') return;
  localStorage.setItem(SEED_KEY,'1');
  if(Object.keys(posts).length) return;
  const t=new Date(); const y=t.getFullYear(), m=t.getMonth();
  const mk=(day)=>keyOf(new Date(y,m,day));
  const base=Math.min(t.getDate(), 24);
  posts[mk(base)] = [
    {id:uid(),type:'reels',profile:'pf1',time:'09:00',content:'5 sinais de burnout médico',caption:'Você reconhece esses sinais? Salve este post. 🩺\n\n#saude #medicina',driveUrl:'https://drive.google.com/exemplo'},
    {id:uid(),type:'story',profile:'pf2',time:'12:30',content:'Enquete: maior dúvida na consulta',caption:'',driveUrl:''},
  ];
  posts[mk(Math.min(base+2,28))] = [
    {id:uid(),type:'carrossel',profile:'pf1',time:'18:00',content:'Como estruturar um plano de saúde',caption:'Arraste para o lado →',driveUrl:''},
  ];
  save();
}

/* ═══════════════════════  EVENTOS  ═══════════════════════ */
function bindEvents(){
  // navegação telas
  document.querySelectorAll('.nav-item').forEach(n=> n.addEventListener('click',()=>switchView(n.dataset.view)) );

  // navegação meses
  document.getElementById('prev-month').addEventListener('click',()=>{ viewDate.setMonth(viewDate.getMonth()-1); renderCalendar(); });
  document.getElementById('next-month').addEventListener('click',()=>{ viewDate.setMonth(viewDate.getMonth()+1); renderCalendar(); });
  document.getElementById('today-btn').addEventListener('click',()=>{ viewDate=new Date(); viewDate.setDate(1); renderCalendar(); });
  document.getElementById('new-content-btn').addEventListener('click',()=> openDay(keyOf(new Date()), true) );

  // cliques no grid (delegação)
  document.getElementById('cal-days').addEventListener('click',(e)=>{
    const addBtn=e.target.closest('.cell-add');
    if(addBtn){ openDay(addBtn.dataset.add, true); return; }
    const cell=e.target.closest('.cal-cell');
    if(cell && cell.dataset.outside==='false') openDay(cell.dataset.key);
  });

  // drawer
  document.getElementById('overlay').addEventListener('click', closeDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeDrawer(); });

  // lista do dia → editar
  document.getElementById('day-list').addEventListener('click',(e)=>{
    const card=e.target.closest('[data-edit]');
    if(card) loadIntoForm(card.dataset.edit);
  });

  // segmented tipo
  document.getElementById('seg-type').addEventListener('click',(e)=>{
    const b=e.target.closest('[data-type]'); if(!b) return;
    draftType=b.dataset.type; renderSegmented();
  });

  // segmented perfil (no formulário)
  document.getElementById('seg-profile').addEventListener('click',(e)=>{
    const b=e.target.closest('[data-prof]'); if(!b) return;
    draftProfile=b.dataset.prof; renderProfileSeg();
  });

  // filtro de perfil (topo do calendário)
  document.getElementById('profile-filter').addEventListener('click',(e)=>{
    const b=e.target.closest('[data-filter]'); if(!b) return;
    activeProfileFilter=b.dataset.filter; renderProfileFilter(); renderCalendar();
  });

  // gerenciador de perfis
  document.getElementById('manage-profiles').addEventListener('click', openProfManager);
  document.getElementById('prof-overlay').addEventListener('click', closeProfManager);
  document.getElementById('prof-close').addEventListener('click', closeProfManager);
  document.getElementById('prof-done').addEventListener('click', closeProfManager);
  document.getElementById('add-profile').addEventListener('click', addProfile);
  document.getElementById('prof-list').addEventListener('click',(e)=>{
    const col=e.target.closest('[data-color]'); if(col){ cycleProfileColor(col.dataset.color); return; }
    const del=e.target.closest('[data-del]'); if(del){ deleteProfile(del.dataset.del); return; }
  });
  document.getElementById('prof-list').addEventListener('input',(e)=>{
    const inp=e.target.closest('[data-name]'); if(inp) renameProfile(inp.dataset.name, inp.value);
  });

  // ações do form
  document.getElementById('btn-save').addEventListener('click',()=>saveForm());
  document.getElementById('btn-delete').addEventListener('click', deletePost);
  document.getElementById('btn-new-post').addEventListener('click', resetForm);
  document.getElementById('f-caption').addEventListener('input', updateCharCount);

  // drive preview abre link
  document.getElementById('f-drive').addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); const u=e.target.value.trim(); if(u) window.open(u,'_blank'); } });
}

/* ═══════════════════════  AUTENTICAÇÃO  ═══════════════════════ */
/* Aviso: credenciais no cliente servem como trava de acesso da equipe,
   não como segurança forte. A autenticação real virá com o backend. */
const AUTH_KEY = 'nevel_auth';
const CRED = { user:'nevel2026', pass:'marketing' };

function isAuthedLocal(){ return localStorage.getItem(AUTH_KEY)==='1'; }
function showApp(){ document.getElementById('auth-screen').classList.add('hidden'); }
function showLoginError(){
  const err = document.getElementById('auth-error');
  err.classList.add('show');
  document.getElementById('auth-password').value='';
  document.getElementById('auth-password').focus();
}
async function logout(){
  if(ON_SERVER){ try{ await api('/api/logout',{method:'POST'}); }catch{} }
  localStorage.removeItem(AUTH_KEY);
  location.reload();
}

async function initAuth(){
  // tenta validar a sessão no backend; se indisponível, usa a trava local
  let authed = false;
  if(ON_SERVER){
    try{ await api('/api/me'); authed = true; }
    catch(e){ if(e.status===undefined) authed = isAuthedLocal(); /* backend ausente */ }
  } else {
    authed = isAuthedLocal();
  }
  if(authed) showApp();

  document.getElementById('auth-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const u = document.getElementById('auth-user').value.trim();
    const p = document.getElementById('auth-password').value;
    const err = document.getElementById('auth-error');

    if(ON_SERVER){
      try{
        await api('/api/login', { method:'POST', body:{ user:u, pass:p } });
        localStorage.setItem(AUTH_KEY,'1'); // lembra também localmente
        err.classList.remove('show'); showApp(); return;
      }catch(e){
        if(e.status===401){ showLoginError(); return; }
        // backend ausente → cai para checagem local abaixo
      }
    }
    if(u===CRED.user && p===CRED.pass){
      localStorage.setItem(AUTH_KEY,'1'); err.classList.remove('show'); showApp();
    } else { showLoginError(); }
  });

  // mostrar/ocultar senha
  document.getElementById('toggle-pass').addEventListener('click',()=>{
    const inp=document.getElementById('auth-password');
    inp.type = inp.type==='password' ? 'text' : 'password';
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
}

/* ---------- Init ---------- */
seedIfEmpty();
bindEvents();
renderProfileFilter();
renderCalendar();
initAuth();
