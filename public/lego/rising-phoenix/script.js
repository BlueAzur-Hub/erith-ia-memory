
const menu=document.querySelector('.menu');const nav=document.querySelector('#nav');
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));}
const box=document.querySelector('[data-lightbox]'),boxImg=box?.querySelector('img'),close=box?.querySelector('.close');
function shut(){if(!box)return;box.hidden=true;boxImg.removeAttribute('src');document.body.style.overflow='';}
document.querySelectorAll('.img-open').forEach(b=>b.addEventListener('click',()=>{if(!box)return;boxImg.src=b.dataset.src;boxImg.alt=b.querySelector('img')?.alt||'Expanded project image';box.hidden=false;document.body.style.overflow='hidden';}));
close?.addEventListener('click',shut);box?.addEventListener('click',e=>{if(e.target===box)shut();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box?.hidden)shut();});
