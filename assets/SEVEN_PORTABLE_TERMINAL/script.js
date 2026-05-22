const pages = document.querySelectorAll('.page');
const navs = document.querySelectorAll('.nav');
const drawer = document.getElementById('drawer');
const drawerText = document.getElementById('drawerText');
const prompts = {
  seven: `Chat, active Aerith-7 Seven Heaven / Full Modules Boost. Mode texte uniquement par défaut. Chargement minimal, choix précis.`,
  video: `Active Seven Heaven — Video Cards Boost. Cartes utiles seulement : Chef d’Orchestre, LEGO Continuity, Anti-Dérive Wan, Format Shorts, Sound Design.`,
  blackout: `MODE BLACKOUT. Aucun outil image. Aucun redimensionnement. Texte uniquement : diagnostic, prompts, décisions, noms de fichiers, archivage.`
};
function showPage(name){
  pages.forEach(p=>p.classList.toggle('active', p.id === `page-${name}`));
  navs.forEach(n=>n.classList.toggle('active', n.dataset.page === name));
  localStorage.setItem('seven-page', name);
}
navs.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copyText(prompts[btn.dataset.copy]||'')));
async function copyText(text){
  drawerText.value = text;
  try{ await navigator.clipboard.writeText(text); } catch(e){}
  drawer.classList.add('open'); drawerText.select();
}
document.getElementById('closeDrawer').addEventListener('click',()=>drawer.classList.remove('open'));
document.getElementById('openChat').addEventListener('click',()=>window.open('https://chatgpt.com/','seven_heaven_chatgpt'));
document.getElementById('toggleFocus').addEventListener('click',()=>document.body.classList.toggle('focus'));
document.getElementById('copyLink').addEventListener('click',()=>copyText('https://blueazur-hub.github.io/erith-ia-memory/assets/SEVEN_PORTABLE_TERMINAL/index.html'));
function updateSystem(){
  const vs = document.getElementById('viewSize'); if(vs) vs.textContent = `${innerWidth} × ${innerHeight}`;
  const tz = document.getElementById('tz'); if(tz) tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
}
addEventListener('resize',updateSystem); updateSystem();
showPage(localStorage.getItem('seven-page') || 'home');
document.addEventListener('keydown',e=>{
  if(e.key>='1'&&e.key<='6'){ showPage(['home','llm','notion','github','production','system'][Number(e.key)-1]); }
  if(e.key==='Escape'){ drawer.classList.remove('open'); document.body.classList.remove('focus'); }
});
