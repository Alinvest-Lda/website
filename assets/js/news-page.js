(function(){
'use strict';
const model=window.SERVICE_CONTENT;
const root=document.querySelector('[data-news-root]');
if(!model||!root)return;
const slug=new URLSearchParams(location.search).get('slug')||'';
const article=(model.noticias||[]).find(n=>n.slug===slug);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!article){root.innerHTML='<section class="detail-hero"><div class="wrap"><span class="detail-kicker">NOTÍCIA NÃO ENCONTRADA</span><h1>Esta publicação não está disponível.</h1><a class="detail-button" href="index.html#actualizacoes">Ver notícias ↗</a></div></section>';return;}
document.title=article.title+' — '+model.provider.name;
const date=article.date?new Date(article.date+'T12:00:00').toLocaleDateString('pt-MZ',{day:'2-digit',month:'long',year:'numeric'}):'';
const body=(article.body||[]).map(p=>'<p>'+esc(p)+'</p>').join('');
const related=(model.noticias||[]).filter(n=>n.slug!==article.slug).slice(0,3).map(n=>'<a class="related-news" href="noticia.html?slug='+encodeURIComponent(n.slug)+'"><span>'+esc(n.category)+'</span><strong>'+esc(n.title)+'</strong><b>Ler publicação ↗</b></a>').join('');
root.innerHTML='<section class="detail-hero news-hero"><div class="wrap"><a class="detail-back" href="index.html#actualizacoes">← Voltar às notícias</a><span class="detail-kicker">'+esc(article.category)+' · '+esc(date)+'</span><h1>'+esc(article.title)+'</h1><p class="detail-intro">'+esc(article.excerpt)+'</p></div></section><article class="article-content"><div class="wrap article-layout"><div class="article-body">'+(article.image?'<img class="article-image" src="'+esc(article.image)+'" alt="">':'')+body+'<p class="article-contact">Quer conversar sobre este tema? <a href="'+esc(model.provider.whatsapp)+'?text='+encodeURIComponent('Olá, gostaria de conversar sobre a publicação: '+article.title)+ '" target="_blank" rel="noopener noreferrer">Fale com a equipa ↗</a></p></div><aside class="article-aside"><span class="detail-kicker">MAIS CONTEÚDOS</span>'+related+'</aside></div></article>';
})();