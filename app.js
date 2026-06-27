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
const IG_KEY = 'nevel_ig_connected';
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

/* ═══════════════════════  NAVEGAÇÃO ENTRE TELAS  ═══════════════════════ */
function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+name));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
  if(name==='metrics') renderMetrics();
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
    const dayPosts = postsFor(key);
    const evtHtml = dayPosts.slice(0,3).map(p=>{
      const t = TYPES.find(t=>t.id===p.type)?.label || p.type;
      const title = p.content ? p.content.split('\n')[0] : t;
      return `<div class="evt t-${p.type}"><span class="evt-time">${p.time||'--:--'}</span><span class="evt-title">${escapeHtml(title)}</span></div>`;
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
    return `<div class="post-card ${editingId===p.id?'editing':''}" data-edit="${p.id}">
      <div class="post-card-top">
        <span class="post-card-time">${icon('clock',14)} ${p.time||'--:--'}</span>
        ${p.posted?`<span class="badge badge-posted">${icon('check',12)} Publicado</span>`
          :p.scheduled?`<span class="badge badge-scheduled">${icon('check',12)} Agendado</span>`:''}
      </div>
      <div class="post-card-title">${escapeHtml(title)}</div>
      <div class="post-card-meta">
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
}

function refreshActionButtons(p){
  const sch=document.getElementById('btn-schedule');
  const post=document.getElementById('btn-post');
  if(p&&p.scheduled){ sch.innerHTML=`${icon('check',16)} Agendado`; sch.classList.add('btn-secondary'); sch.classList.remove('btn-outline'); }
  else { sch.innerHTML=`${icon('send',16)} Agendar`; sch.classList.add('btn-outline'); sch.classList.remove('btn-secondary'); }
  if(p&&p.posted){ post.innerHTML=`${icon('check',16)} Publicado`; post.disabled=true; post.classList.add('btn-secondary'); post.classList.remove('btn-primary'); }
  else { post.innerHTML=`${icon('instagram',16)} Postar agora`; post.disabled=false; post.classList.add('btn-primary'); post.classList.remove('btn-secondary'); }
}

function resetForm(){
  editingId=null; draftType='reels';
  document.getElementById('f-content').value='';
  document.getElementById('f-time').value='';
  document.getElementById('f-drive').value='';
  document.getElementById('f-caption').value='';
  document.getElementById('btn-delete').style.display='none';
  document.getElementById('form-title').textContent = 'Novo conteúdo';
  refreshActionButtons(null);
  updateCharCount();
  renderSegmented();
  renderDayList();
}

function loadIntoForm(id){
  const p = (posts[activeDayKey]||[]).find(x=>x.id===id);
  if(!p) return;
  editingId=id; draftType=p.type;
  document.getElementById('f-content').value=p.content||'';
  document.getElementById('f-time').value=p.time||'';
  document.getElementById('f-drive').value=p.driveUrl||'';
  document.getElementById('f-caption').value=p.caption||'';
  document.getElementById('btn-delete').style.display='inline-flex';
  document.getElementById('form-title').textContent = 'Editar conteúdo';
  refreshActionButtons(p);
  updateCharCount();
  renderSegmented();
  renderDayList();
  document.getElementById('f-content').focus();
}

function collectForm(){
  return {
    type: draftType,
    content: document.getElementById('f-content').value.trim(),
    time: document.getElementById('f-time').value,
    driveUrl: document.getElementById('f-drive').value.trim(),
    caption: document.getElementById('f-caption').value.trim(),
  };
}

function saveForm(markScheduled=null){
  const data = collectForm();
  if(!data.content && !data.caption){ toast('Preencha o conteúdo ou a legenda', false); return; }
  if(!posts[activeDayKey]) posts[activeDayKey]=[];
  if(editingId){
    const p = posts[activeDayKey].find(x=>x.id===editingId);
    Object.assign(p, data);
    if(markScheduled!==null) p.scheduled = markScheduled;
    toast(markScheduled ? 'Conteúdo agendado' : 'Conteúdo atualizado');
  } else {
    const p = { id:uid(), ...data, scheduled: markScheduled===true };
    posts[activeDayKey].push(p);
    editingId = p.id;
    toast(markScheduled ? 'Conteúdo agendado' : 'Conteúdo salvo');
  }
  save();
  renderCalendar();
  renderDayList();
  const cur = (posts[activeDayKey]||[]).find(x=>x.id===editingId);
  refreshActionButtons(cur);
}

/* Publicação direta no Instagram (modo demonstração até a integração com backend) */
function publishPost(){
  const data = collectForm();
  if(!data.content && !data.caption){ toast('Preencha o conteúdo ou a legenda antes de postar', false); return; }
  if(!data.driveUrl){
    if(!confirm('Nenhum link de mídia (Drive) foi informado.\n\nA publicação real precisa de uma imagem ou vídeo. Deseja continuar mesmo assim (modo demonstração)?')) return;
  }
  saveForm(null); // garante que está salvo e que temos editingId
  const p = (posts[activeDayKey]||[]).find(x=>x.id===editingId);
  if(!confirm('Publicar este conteúdo agora no Instagram da Nevel MED?\n\n⚠ No momento em MODO DEMONSTRAÇÃO — a publicação automática real será habilitada com a integração da Instagram Graph API (requer backend + app Meta aprovado).')) return;
  if(p){ p.posted = true; p.scheduled = true; save(); }
  renderCalendar(); renderDayList(); refreshActionButtons(p);
  toast('Publicação simulada ✓ (modo demonstração)');
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

/* ═══════════════════════  MÉTRICAS  ═══════════════════════ */
function isConnected(){ return localStorage.getItem(IG_KEY)==='1'; }

function renderMetrics(){
  const wrap = document.getElementById('metrics-wrap');
  if(!isConnected()){ wrap.innerHTML = connectMarkup(); bindConnect(); return; }
  wrap.innerHTML = dashboardMarkup();
  // anima barras
  requestAnimationFrame(()=>{
    document.querySelectorAll('#metrics-wrap .bar').forEach(b=>{ b.style.height=b.dataset.h+'%'; });
  });
  document.getElementById('btn-disconnect')?.addEventListener('click', ()=>{
    localStorage.removeItem(IG_KEY); renderMetrics(); toast('Conta desconectada');
  });
}

function connectMarkup(){
  return `<div class="connect-card fade-up">
    <div class="ig-icon">${icon('instagram',34)}</div>
    <h2>Conecte sua conta do Instagram</h2>
    <p>Importe automaticamente o desempenho dos seus posts — visualizações, alcance, curtidas, comentários e mais — direto no painel.</p>
    <button class="btn btn-primary" id="btn-connect">${icon('instagram',16)} Conectar Instagram</button>
    <div class="note">A integração real usa a <b>Instagram Graph API</b> (conta Business + app Meta aprovado). Por enquanto, clicar acima carrega um <b>painel de demonstração</b> com dados de exemplo para você visualizar a tela.</div>
  </div>`;
}
function bindConnect(){
  document.getElementById('btn-connect')?.addEventListener('click', ()=>{
    localStorage.setItem(IG_KEY,'1'); renderMetrics(); toast('Instagram conectado (demo)');
  });
}

/* Dados de demonstração */
const DEMO = {
  handle:'@nevel.med', followers:'12.480',
  kpis:[
    {key:'reach',   label:'Alcance',         val:'48.2k', delta:'+12,4%', up:true,  ic:'reach'},
    {key:'views',   label:'Visualizações',   val:'73.9k', delta:'+8,1%',  up:true,  ic:'eye'},
    {key:'likes',   label:'Curtidas',        val:'5.140', delta:'+3,2%',  up:true,  ic:'heart'},
    {key:'comments',label:'Comentários',     val:'412',   delta:'-1,5%',  up:false, ic:'comment'},
    {key:'shares',  label:'Compartilhamentos',val:'1.286', delta:'+21,7%', up:true, ic:'share'},
    {key:'saves',   label:'Salvamentos',     val:'2.034', delta:'+9,9%',  up:true,  ic:'bookmark'},
  ],
  chart:[
    {label:'01/06', v:62},{label:'05/06', v:48},{label:'09/06', v:81},
    {label:'13/06', v:55},{label:'17/06', v:93},{label:'21/06', v:70},{label:'25/06', v:100},
  ],
  rows:[
    {type:'reels',     name:'5 sinais de burnout médico',      reach:'18.4k', likes:'2.1k', comments:148, shares:512, saves:890},
    {type:'carrossel', name:'Como estruturar um plano de saúde',reach:'11.2k', likes:'1.3k', comments:96,  shares:284, saves:640},
    {type:'reels',     name:'Bastidores do consultório',        reach:'9.8k',  likes:'870',  comments:54,  shares:198, saves:310},
    {type:'story',     name:'Enquete: maior dúvida na consulta', reach:'5.1k',  likes:'—',    comments:32,  shares:41,  saves:18},
    {type:'imagem',    name:'Frase institucional da semana',     reach:'3.7k',  likes:'410',  comments:22,  shares:60,  saves:74},
  ],
};
function dashboardMarkup(){
  const maxV = Math.max(...DEMO.chart.map(c=>c.v));
  const bars = DEMO.chart.map(c=>{
    const h = Math.round(c.v/maxV*100);
    return `<div class="bar-col"><div class="bar" data-h="${h}" data-val="${Math.round(c.v/100*48200).toLocaleString('pt-BR')} alcance" style="height:0%"></div><span class="bar-label">${c.label}</span></div>`;
  }).join('');
  const kpis = DEMO.kpis.map((k,i)=>`
    <div class="kpi fade-up d${(i%4)+1}">
      <div class="kpi-top"><span class="kpi-label">${k.label}</span><span class="kpi-ic">${icon(k.ic,17)}</span></div>
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-delta ${k.up?'up':'down'}">${icon('trend',13)} ${k.delta} <span style="color:var(--color-neutral-400)">vs. mês anterior</span></div>
    </div>`).join('');
  const rows = DEMO.rows.map(r=>{
    const t=TYPES.find(t=>t.id===r.type);
    return `<tr>
      <td><div class="post-name"><span class="post-thumb">${icon('cal',16)}</span><div><div>${escapeHtml(r.name)}</div><span class="type-pill type-${r.type}" style="margin-top:4px"><span class="dot"></span>${t?.label||r.type}</span></div></div></td>
      <td class="num">${r.reach}</td><td class="num">${r.likes}</td><td class="num">${r.comments}</td><td class="num">${r.shares}</td><td class="num">${r.saves}</td>
    </tr>`;
  }).join('');

  return `
  <div class="demo-banner fade-up">${icon('info',18)} <span>Exibindo <b>dados de demonstração</b>. A conexão real com a Instagram Graph API será habilitada na próxima fase.</span></div>

  <div class="metrics-head fade-up d1">
    <div class="account-chip">
      <div class="ava">N</div>
      <div><div class="handle">${DEMO.handle}</div><div class="followers">${DEMO.followers} seguidores</div></div>
      <span class="badge badge-scheduled" style="margin-left:6px">${icon('check',12)} Conectado · demo</span>
    </div>
    <button class="btn btn-outline" id="btn-disconnect">Desconectar</button>
  </div>

  <div class="kpi-grid">${kpis}</div>

  <div class="panel fade-up d2">
    <div class="panel-head"><div><h3>Alcance por publicação</h3></div><span class="sub">Últimos 30 dias</span></div>
    <div class="chart">${bars}</div>
  </div>

  <div class="panel fade-up d3">
    <div class="panel-head"><h3>Posts recentes</h3><span class="sub">Desempenho individual</span></div>
    <div class="table-wrap">
      <table class="posts">
        <thead><tr><th>Publicação</th><th class="num">Alcance</th><th class="num">Curtidas</th><th class="num">Comentários</th><th class="num">Compart.</th><th class="num">Salvos</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ═══════════════════════  SEED (exemplo inicial)  ═══════════════════════ */
function seedIfEmpty(){
  if(Object.keys(posts).length) return;
  const t=new Date(); const y=t.getFullYear(), m=t.getMonth();
  const mk=(day)=>keyOf(new Date(y,m,day));
  const base=Math.min(t.getDate(), 24);
  posts[mk(base)] = [
    {id:uid(),type:'reels',time:'09:00',content:'5 sinais de burnout médico',caption:'Você reconhece esses sinais? Salve este post. 🩺\n\n#saude #medicina',driveUrl:'https://drive.google.com/exemplo',scheduled:true},
    {id:uid(),type:'story',time:'12:30',content:'Enquete: maior dúvida na consulta',caption:'',driveUrl:'',scheduled:false},
  ];
  posts[mk(Math.min(base+2,28))] = [
    {id:uid(),type:'carrossel',time:'18:00',content:'Como estruturar um plano de saúde',caption:'Arraste para o lado →',driveUrl:'',scheduled:false},
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

  // ações do form
  document.getElementById('btn-save').addEventListener('click',()=>saveForm(null));
  document.getElementById('btn-schedule').addEventListener('click',()=>{
    const p = editingId ? (posts[activeDayKey]||[]).find(x=>x.id===editingId) : null;
    saveForm(p?.scheduled ? false : true);
  });
  document.getElementById('btn-post').addEventListener('click', publishPost);
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

function isAuthed(){ return localStorage.getItem(AUTH_KEY)==='1'; }
function showApp(){ document.getElementById('auth-screen').classList.add('hidden'); }
function logout(){ localStorage.removeItem(AUTH_KEY); location.reload(); }

function initAuth(){
  if(isAuthed()) showApp();

  document.getElementById('auth-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const u = document.getElementById('auth-user').value.trim();
    const p = document.getElementById('auth-password').value;
    const err = document.getElementById('auth-error');
    if(u===CRED.user && p===CRED.pass){
      localStorage.setItem(AUTH_KEY,'1');
      err.classList.remove('show');
      showApp();
    } else {
      err.classList.add('show');
      document.getElementById('auth-password').value='';
      document.getElementById('auth-password').focus();
    }
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
renderCalendar();
initAuth();
