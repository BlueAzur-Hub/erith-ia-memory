(() => {
  'use strict';
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const STORE = 'night-vault-public-browser-v1';
  const ALERTS = 'night-vault-public-alerts-v1';
  const THEME = 'night-vault-public-theme-v1';
  const VISUAL = 'night-vault-public-visual-v1';
  const EQ = 'night-vault-public-eq-v1';
  const eqPresets = [
    {cls:'eq-preset-0', name:'VELVET CASTLE', label:'actif'},
    {cls:'eq-preset-1', name:'PINK CONSTELLATION', label:'actif'},
    {cls:'eq-preset-2', name:'BLUE HORIZON', label:'actif'}
  ];
  const recipientCopy = {
    night: {hint:'Fiche locale de réflexion Night.', chip:'🔒 Locale', message:'Écris une note ou une mémoire dans ton navigateur. Rien ne part automatiquement.', title:'Enregistrer localement'},
    sun: {hint:'Fiche locale de création Sun.', chip:'☀ Locale', message:'Prépare une idée de production. Elle reste sur cet appareil tant que tu ne l’exportes pas.', title:'Enregistrer pour Sun'},
    duo: {hint:'Fiche locale destinée à être exportée pour le Duo.', chip:'🗝 Locale', message:'Prépare une fiche pour Sun + Night, puis télécharge-la en Markdown si tu veux la déplacer.', title:'Enregistrer pour le Duo'}
  };
  const starWords = ['','à classer','faible','utile','à garder','forte','essentielle','canonique'];
  let state = loadStore();
  let activities = loadActivities();
  let recipient = 'night';
  let stars = 1;
  let currentId = null;
  let fileEditId = null;
  let toastTimer = null;

  function loadStore(){
    try { const data = JSON.parse(localStorage.getItem(STORE) || '[]'); return Array.isArray(data) ? data : []; }
    catch (_) { return []; }
  }
  function saveStore(){ localStorage.setItem(STORE, JSON.stringify(state)); }
  function loadActivities(){ try { const data = JSON.parse(localStorage.getItem(ALERTS) || '[]'); return Array.isArray(data) ? data : []; } catch (_) { return []; } }
  function saveActivities(){ localStorage.setItem(ALERTS, JSON.stringify(activities.slice(0,30))); }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function dateText(iso){ try { return new Date(iso).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}); } catch (_) { return iso || ''; } }
  function starsText(n){ return '★'.repeat(Math.max(1,Math.min(7,Number(n)||1))); }
  function nextId(){
    const nums = state.map(x => Number((String(x.id).match(/(\d+)$/)||[])[1]||0));
    return `NV-PUB-${String(Math.max(0,...nums)+1).padStart(4,'0')}`;
  }
  function futhark(text){
    const map={A:'ᛉ',B:'ᛒ',C:'ᚲ',D:'ᛞ',E:'ᛖ',F:'ᚠ',G:'ᚷ',H:'ᚺ',I:'ᛁ',J:'ᛃ',K:'ᚲ',L:'ᛚ',M:'ᛗ',N:'ᚾ',O:'ᛟ',P:'ᛈ',Q:'ᚲ',R:'ᚱ',S:'ᛊ',T:'ᛏ',U:'ᚢ',V:'ᚹ',W:'ᚹ',X:'ᚲᛊ',Y:'ᛃ',Z:'ᛉ'};
    return String(text||'').toUpperCase().split('').map(ch => map[ch] || (/[\s]/.test(ch) ? ' ' : '')).join('');
  }
  function toast(message, kind='ok'){
    const el=$('#toast'); el.textContent=message; el.className=`toast ${kind}`; el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.add('hidden'),3200);
  }
  function addActivity(title, detail, icon='✦'){
    activities.unshift({title,detail,icon,at:new Date().toISOString()}); saveActivities(); renderActivities();
  }
  function renderActivities(){
    const list=$('#alertsList'); const badge=$('#alertsBadge'); const msgBadge=$('#messagesBadge');
    badge.textContent = Math.min(99,activities.length); msgBadge.textContent='';
    list.innerHTML='';
    if(!activities.length){list.innerHTML='<p class="muted">Aucune activité locale.</p>';return;}
    activities.slice(0,8).forEach(a=>{
      const row=document.createElement('div'); row.className='alert-row';
      row.innerHTML=`<span class="alert-icon">${esc(a.icon)}</span><div><strong>${esc(a.title)}</strong><small>${esc(a.detail)} · ${esc(dateText(a.at))}</small></div>`; list.append(row);
    });
  }
  function switchTab(tab){
    $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    $$('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${tab}`));
    closeMenus();
    if(tab==='read') renderVaults();
    if(tab==='files') renderFiles();
  }
  function closeMenus(){ $('#alertsMenu').classList.add('hidden'); $('#messagesMenu').classList.add('hidden'); $('#searchPanel').classList.add('hidden'); }
  function setStars(value, announce=false){
    stars=Math.max(1,Math.min(7,Number(value)||1));
    $$('#starRating button').forEach(b=>b.classList.toggle('active',Number(b.dataset.stars)<=stars));
    $('#starLabel').textContent=`${stars} / 7 · ${starWords[stars]}`;
    $('#starHint').textContent='Cette note aide à retrouver l’importance de la fiche dans ce navigateur.';
    if(announce) toast(`Note réglée sur ${stars} / 7.`);
  }
  function setRecipient(mode){
    recipient = recipientCopy[mode] ? mode : 'night'; const d=recipientCopy[recipient];
    $$('.recipient').forEach(b=>b.classList.toggle('active',b.dataset.recipient===recipient));
    $('#duoHint').textContent=d.hint; $('#modeChip').textContent=d.chip; $('#modeMessage').textContent=d.message;
    $('#createVault').innerHTML=`<span>✦</span> ${d.title}`;
    if(recipient==='duo') $('#category').value='message Duo';
  }
  function resetForm(){
    $('#entryId').value=nextId(); $('#memoryText').value=''; $('#category').value='note créative'; $('#privacy').value='Locale au navigateur';
    $('#useRunes').checked=true; $('#syncAfter').checked=false; setStars(1); setRecipient('night');
  }
  function createMemory(){
    const text=$('#memoryText').value.trim(); if(!text){ toast('Écris un texte avant de l’enregistrer.','error'); return; }
    const now=new Date().toISOString();
    const memory={
      id:$('#entryId').value || nextId(), category:$('#category').value, privacy:$('#privacy').value,
      recipient, stars, text, runes:$('#useRunes').checked ? futhark(text) : '', created:now, updated:now
    };
    state.unshift(memory); saveStore(); addActivity('Souvenir local créé',memory.id,'✦');
    toast('Souvenir enregistré dans ce navigateur.');
    if($('#syncAfter').checked) downloadMarkdown(memory);
    resetForm(); renderVaults(); renderFiles();
  }
  function buildRow(memory){
    const row=document.createElement('div'); row.className='vault-row';
    const recipientLabel=memory.recipient==='duo'?'🗝 Duo':memory.recipient==='sun'?'☀ Sun':'☾ Night';
    row.innerHTML=`<div class="vault-main"><span class="vault-icon">⌑</span><div><strong>${esc(memory.id)}</strong><small>${esc(dateText(memory.updated))} · ${esc(memory.text.length)} caractères</small><div class="vault-tags"><span>${esc(memory.category)}</span><span>${esc(memory.privacy)}</span><span>${recipientLabel}</span></div></div></div><div class="actions"><span class="row-stars">${starsText(memory.stars)}</span><button class="outline mini" type="button" data-action="read">☾ Relire</button><button class="outline mini" type="button" data-action="export">📄 Exporter .md</button></div>`;
    $('[data-action="read"]',row).addEventListener('click',()=>openMemory(memory.id));
    $('[data-action="export"]',row).addEventListener('click',()=>downloadMarkdown(memory));
    return row;
  }
  function renderVaults(){
    const list=$('#vaultList'); list.innerHTML=''; clearReader(false);
    if(!state.length){ list.innerHTML='<p class="muted">Aucun souvenir dans ce navigateur. Utilise Écrire pour créer ta première fiche.</p>'; return; }
    state.sort((a,b)=>String(b.updated).localeCompare(String(a.updated))).forEach(m=>list.append(buildRow(m)));
  }
  function clearReader(scroll=true){
    currentId=null; $('#memoryReader').classList.add('hidden'); if(scroll) $('#memoryReader').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function getMemory(id){ return state.find(x=>x.id===id); }
  function openMemory(id){
    const m=getMemory(id); if(!m) return;
    currentId=id; $('#readerId').textContent=m.id; $('#readerCategory').textContent=m.category; $('#readerPrivacy').textContent=`🔒 ${m.privacy}`;
    $('#readerRecipients').textContent=m.recipient==='duo'?'🗝 Sun + Night':m.recipient==='sun'?'☀ Sun':'☾ Night';
    $('#readerStars').textContent=`${starsText(m.stars)} · ${m.stars} / 7`; $('#readerRatingHint').textContent=`Note : ${starWords[m.stars]}. Modifiable localement.`;
    $('#readerText').textContent=m.text; $('#correctText').value=m.text; $('#readerRunes').textContent=m.runes || ''; $('#runeBlock').classList.toggle('hidden',!m.runes);
    $('#createDuoCopy').classList.toggle('hidden',m.recipient!=='duo'); $('#memoryReader').classList.remove('hidden');
    $('#memoryReader').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function updateCurrent(){
    const m=getMemory(currentId); if(!m) return; const text=$('#correctText').value.trim(); if(!text){toast('Le texte ne peut pas être vide.','error');return;}
    m.text=text; m.updated=new Date().toISOString(); m.runes=m.runes?futhark(text):''; saveStore(); addActivity('Souvenir modifié',m.id,'✎'); openMemory(m.id); renderVaults(); renderFiles(); toast('Modification enregistrée dans le navigateur.');
  }
  function removeCurrent(){
    const m=getMemory(currentId); if(!m) return; if(!confirm(`Supprimer ${m.id} de ce navigateur ?`)) return;
    state=state.filter(x=>x.id!==m.id); saveStore(); addActivity('Souvenir supprimé',m.id,'×'); clearReader(false); renderVaults(); renderFiles(); toast('Souvenir supprimé.');
  }
  function mdContent(m, duo=false){
    const who=duo?'Sun + Night':m.recipient==='duo'?'Sun + Night':m.recipient==='sun'?'Sun':'Night';
    const safeText=String(m.text||'').trim();
    return `# ${m.id}\n\nDate : ${dateText(m.created)}\nMis à jour : ${dateText(m.updated)}\nCatégorie : ${m.category}\nVisibilité : ${m.privacy}\nUsage : ${who}\nNote : ${m.stars} / 7\n\n## Texte\n\n${safeText}\n${m.runes?`\n## Trace Futhark\n\n${m.runes}\n`:''}\n---\n\nExport créé par Night Vault Public Browser Edition.\n`;
  }
  function download(name, text, type='text/plain;charset=utf-8'){
    const blob=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function downloadMarkdown(m, duo=false){
    download(`${m.id}${duo?'_DUO':''}.md`,mdContent(m,duo),'text/markdown;charset=utf-8'); addActivity('Markdown exporté',`${m.id}.md`,'📄'); toast(`Export ${m.id}.md téléchargé.`);
  }
  function backup(){
    const payload={format:'night-vault-public-browser-v1',exported_at:new Date().toISOString(),memories:state};
    download(`night-vault-public-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(payload,null,2),'application/json;charset=utf-8');
    addActivity('Archive JSON téléchargée',`${state.length} souvenir(s)`,'⬡'); toast('Archive JSON téléchargée.');
  }
  function importBackup(file){
    if(!file) return; const reader=new FileReader();
    reader.onload=()=>{try{const d=JSON.parse(reader.result); if(!d || d.format!=='night-vault-public-browser-v1' || !Array.isArray(d.memories)) throw new Error('Archive Night Vault Public invalide.'); state=d.memories.map(normalizeMemory); saveStore(); addActivity('Archive JSON importée',`${state.length} souvenir(s)`,'↥'); renderVaults(); renderFiles(); resetForm(); toast('Archive restaurée dans ce navigateur.');}catch(e){toast(e.message || 'Import impossible.','error');}};
    reader.readAsText(file,'utf-8');
  }
  function normalizeMemory(x){ return {id:String(x.id||nextId()),category:String(x.category||'note créative'),privacy:String(x.privacy||'Locale au navigateur'),recipient:['night','sun','duo'].includes(x.recipient)?x.recipient:'night',stars:Math.max(1,Math.min(7,Number(x.stars)||1)),text:String(x.text||''),runes:String(x.runes||''),created:x.created||new Date().toISOString(),updated:x.updated||x.created||new Date().toISOString()}; }
  function renderFiles(filter=''){
    const list=$('#projectFiles'); const q=String(filter).toLocaleLowerCase('fr-FR'); list.innerHTML='';
    const rows=state.filter(m=>!q || `${m.id} ${m.category} ${m.text}`.toLocaleLowerCase('fr-FR').includes(q));
    if(!rows.length){list.innerHTML='<p class="muted">Aucune fiche.</p>';return;}
    rows.forEach(m=>{const b=document.createElement('button');b.type='button';b.className='project-file';b.textContent=`${m.id}.md`;b.addEventListener('click',()=>openFile(m.id));list.append(b);});
  }
  function openFile(id){ const m=getMemory(id); if(!m) return; fileEditId=id; $('#openFilePath').textContent=`exports/${m.id}.md`; $('#fileText').value=mdContent(m); $('#saveFile').disabled=false; $('#downloadEditedMd').disabled=false; }
  function downloadEdited(){ if(!fileEditId) return; const m=getMemory(fileEditId); download(`${m.id}.md`,$('#fileText').value,'text/markdown;charset=utf-8'); addActivity('Markdown édité exporté',`${m.id}.md`,'📄'); toast('Markdown édité téléchargé.'); }
  function saveEditedToMemory(){
    if(!fileEditId) return; const m=getMemory(fileEditId); const t=$('#fileText').value; const marker='## Texte'; const end='## Trace Futhark';
    const start=t.indexOf(marker); if(start===-1){toast('Le Markdown doit garder la section “## Texte”.','error');return;}
    let body=t.slice(start+marker.length).trim(); const runeAt=body.indexOf(end); if(runeAt>=0) body=body.slice(0,runeAt).trim(); const divider=body.lastIndexOf('\n---'); if(divider>=0) body=body.slice(0,divider).trim();
    if(!body){toast('Le texte est vide.','error');return;} m.text=body; m.updated=new Date().toISOString(); saveStore(); addActivity('Fiche mise à jour',m.id,'✎'); renderVaults(); toast('Texte réinjecté dans la mémoire navigateur.');
  }
  function search(query){
    const panel=$('#searchPanel'), results=$('#searchResults'); const q=String(query||'').trim().toLocaleLowerCase('fr-FR'); $('#clearSearch').hidden=!q;
    if(!q){panel.classList.add('hidden');return;} panel.classList.remove('hidden'); const rows=state.filter(m=>`${m.id} ${m.category} ${m.text}`.toLocaleLowerCase('fr-FR').includes(q)); results.innerHTML='';
    if(!rows.length){results.innerHTML='<p class="muted">Aucun souvenir ne correspond.</p>';return;}
    rows.slice(0,10).forEach(m=>{const b=document.createElement('button');b.type='button';b.className='search-result';b.innerHTML=`<span class="alert-icon">⌑</span><div><strong>${esc(m.id)}</strong><small>${esc(m.category)} · ${esc(m.privacy)}</small></div><span class="search-stars">${starsText(m.stars)}</span>`;b.addEventListener('click',()=>{switchTab('read');setTimeout(()=>openMemory(m.id),20);});results.append(b);});
  }
  function applyTheme(theme,announce=false){
    const valid=['club','cafe','velvet','forum','castle']; theme=valid.includes(theme)?theme:'club'; document.body.dataset.theme=theme; $('#themeSelect').value=theme;
    const label=$('#themeSelect').selectedOptions[0].textContent; $('#heroThemeLabel').textContent=label; $('#themeCurrent').textContent=label;
    $$('#themeCards button').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===theme)); localStorage.setItem(THEME,theme); if(announce){addActivity('Thème Night activé',label,'◇');toast(`${label} activé.`);}
  }
  function applyVisual(mode,announce=false){
    mode=mode==='soft'?'soft':'static'; document.body.classList.toggle('castle-soft',mode==='soft'); document.body.classList.toggle('castle-static',mode!=='soft'); $('#castleModeLabel').textContent=mode==='soft'?'lueur douce':'statique'; $$('.visual-mode').forEach(b=>b.classList.toggle('active',b.dataset.visualMode===mode)); localStorage.setItem(VISUAL,mode); if(announce)toast(mode==='soft'?'Lueur douce activée.':'Château statique activé.'); }
  function applyEq(announce=false){
    const el=$('#microEq'); const idx=Number(localStorage.getItem(EQ)||0)%eqPresets.length; const paused=localStorage.getItem(`${EQ}-paused`)==='1';
    eqPresets.forEach(p=>el.classList.remove(p.cls)); el.classList.add(eqPresets[idx].cls,paused?'eq-paused':'eq-playing'); $('#ambientTrack').textContent=eqPresets[idx].name; $('#ambientState').textContent=paused?'Visualiseur décoratif · en pause':'Visualiseur décoratif · actif'; $('#ambientToggle').textContent=paused?'▶':'Ⅱ'; $('#ambientToggle').setAttribute('aria-pressed',String(!paused)); if(announce)toast(paused?'Visualiseur en pause.':'Visualiseur actif.');
  }
  function cycleEq(delta){ const idx=(Number(localStorage.getItem(EQ)||0)+delta+eqPresets.length)%eqPresets.length; localStorage.setItem(EQ,String(idx)); applyEq(true); }
  function toggleEq(){localStorage.setItem(`${EQ}-paused`,localStorage.getItem(`${EQ}-paused`)==='1'?'0':'1');applyEq(true);}

  $$('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  $$('.recipient').forEach(b=>b.addEventListener('click',()=>setRecipient(b.dataset.recipient)));
  $$('#starRating button').forEach(b=>b.addEventListener('click',()=>setStars(b.dataset.stars,true)));
  $('#refreshId').addEventListener('click',()=>{$('#entryId').value=nextId();toast('Nouvel identifiant prêt.');});
  $('#createVault').addEventListener('click',createMemory);
  $('#refreshVaults').addEventListener('click',()=>{renderVaults();toast('Liste actualisée.');});
  $('#exportMemoryMd').addEventListener('click',()=>{const m=getMemory(currentId);if(m)downloadMarkdown(m);});
  $('#createDuoCopy').addEventListener('click',()=>{const m=getMemory(currentId);if(m)downloadMarkdown(m,true);});
  $('#saveCorrection').addEventListener('click',updateCurrent); $('#deleteMemory').addEventListener('click',removeCurrent); $('#hideReader').addEventListener('click',()=>clearReader(false));
  $('#downloadBackup').addEventListener('click',backup); $('#downloadBackup2').addEventListener('click',backup); $('#downloadBackup3').addEventListener('click',backup);
  $('#importBackup').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
  $('#clearLocalData').addEventListener('click',()=>{if(!confirm('Effacer tous les souvenirs de ce navigateur ? Pense à télécharger une archive JSON avant.'))return; state=[];saveStore();addActivity('Mémoire navigateur effacée','Aucun souvenir restant','×');renderVaults();renderFiles();resetForm();toast('Mémoire navigateur effacée.');});
  $('#fileFilter').addEventListener('input',e=>renderFiles(e.target.value)); $('#saveFile').addEventListener('click',saveEditedToMemory); $('#downloadEditedMd').addEventListener('click',downloadEdited);
  $('#quickSearch').addEventListener('input',e=>search(e.target.value)); $('#clearSearch').addEventListener('click',()=>{$('#quickSearch').value='';search('');});
  $('#alertsToggle').addEventListener('click',()=>{const el=$('#alertsMenu'); const show=el.classList.contains('hidden');closeMenus();el.classList.toggle('hidden',!show);});
  $('#messagesToggle').addEventListener('click',()=>{const el=$('#messagesMenu'); const show=el.classList.contains('hidden');closeMenus();el.classList.toggle('hidden',!show);});
  $('#clearAlerts').addEventListener('click',()=>{activities=[];saveActivities();renderActivities();toast('Alertes effacées.');});
  $$('.quick-message-actions button').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.quickRecipient;closeMenus(); if(k==='backup'){backup();return;} if(k==='import'){$('#importBackup').click();return;} switchTab('create'); if(k==='night'||k==='sun'||k==='duo')setRecipient(k); $('#memoryText').focus();}));
  $('#themeSelect').addEventListener('change',e=>applyTheme(e.target.value,true)); $$('#themeCards button').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeChoice,true)));
  $$('.visual-mode').forEach(b=>b.addEventListener('click',()=>applyVisual(b.dataset.visualMode,true))); $('#ambientPrev').addEventListener('click',()=>cycleEq(-1)); $('#ambientNext').addEventListener('click',()=>cycleEq(1)); $('#ambientToggle').addEventListener('click',toggleEq);
  $('#goExports').addEventListener('click',()=>switchTab('files'));
  $$('.feature-action').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.featureAction;
    if(action==='create'){
      switchTab('create');
      $('#memoryText').focus();
      toast('Éditeur local ouvert.');
      return;
    }
    if(action==='files'){
      switchTab('files');
      toast('Exports locaux ouverts.');
      return;
    }
    if(action==='backup'){
      backup();
      return;
    }
    if(action==='limits'){
      switchTab('git');
      const limits=$$('#panel-git .settings-block').at(-1);
      setTimeout(()=>limits?.scrollIntoView({behavior:'smooth',block:'nearest'}),0);
      toast('Limites publiques affichées.');
    }
  }));
  document.addEventListener('click',e=>{ if(!e.target.closest('.drop-wrap')&&!e.target.closest('.search-wrap')) closeMenus(); });

  applyTheme(localStorage.getItem(THEME)||'club'); applyVisual(localStorage.getItem(VISUAL)||'static'); applyEq(); renderActivities(); setStars(1); resetForm(); renderVaults(); renderFiles();
})();
