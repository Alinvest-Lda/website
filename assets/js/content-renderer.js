(function(){
'use strict';
const model=window.SERVICE_CONTENT;
if(!model)return;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate=v=>{if(!v)return '';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?v:d.toLocaleDateString('pt-MZ',{day:'2-digit',month:'long',year:'numeric'});};
document.querySelectorAll('[data-content-collection="noticias"]').forEach(grid=>{
 if(!Array.isArray(model.noticias)||!model.noticias.length)return;
 grid.innerHTML=model.noticias.slice(0,4).map((n,i)=>'<article class="update-card '+(i===0?'update-card-featured':'')+'"><div class="update-card-visual update-visual-management">'+(n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'')+'<span>'+esc(n.category)+'</span><b>'+String(i+1).padStart(2,'0')+'</b></div><div class="update-card-body"><span class="update-category">'+esc(n.category)+' · '+esc(formatDate(n.date))+'</span><h3><a href="noticia.html?slug='+encodeURIComponent(n.slug)+'">'+esc(n.title)+'</a></h3><p>'+esc(n.excerpt)+'</p><a class="update-coming" href="noticia.html?slug='+encodeURIComponent(n.slug)+'">Ler publicação ↗</a></div></article>').join('');
});
})();