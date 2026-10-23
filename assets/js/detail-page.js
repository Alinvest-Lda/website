(function(){
'use strict';
const model=window.SERVICE_CONTENT;
const root=document.querySelector('[data-detail-root]');
if(!model||!root)return;
const params=new URLSearchParams(location.search);
const type=params.get('tipo')||'area',slug=params.get('slug')||'';
const collections={area:model.areas,programa:model.programas,apoio:model.apoio};
const item=(collections[type]||{})[slug];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const contact=model.provider.whatsapp;
if(!item){root.innerHTML='<section class="detail-hero"><div class="wrap"><span class="detail-kicker">CONTEÚDO NÃO ENCONTRADO</span><h1>Esta página não está disponível.</h1><p>O conteúdo pode ter sido actualizado ou o endereço estar incorrecto.</p><a class="detail-button" href="index.html">Voltar à página inicial ↗</a></div></section>';return;}
document.title=item.title+' — '+model.provider.name;
const services=(item.services||[]).map(v=>'<li>'+esc(v)+'</li>').join('');
const outcomes=(item.outcomes||[]).map(v=>'<li>'+esc(v)+'</li>').join('');
root.innerHTML='<section class="detail-hero"><div class="wrap"><a class="detail-back" href="index.html">← Voltar à página inicial</a><span class="detail-kicker">'+esc(item.category||'Serviços')+'</span><h1>'+esc(item.title)+'</h1><p class="detail-intro">'+esc(item.intro)+'</p><a class="detail-button" href="'+esc(contact)+'?text='+encodeURIComponent('Olá, '+model.provider.name+'. Gostaria de conversar sobre '+item.title+'.')+'" target="_blank" rel="noopener noreferrer">'+esc(item.cta||'Pedir informações')+' ↗</a></div></section><section class="detail-content"><div class="wrap detail-layout"><article class="detail-main"><span class="detail-kicker">VISÃO GERAL</span><h2>Uma resposta ajustada à necessidade</h2><p>'+esc(item.description)+'</p><h2>O que pode incluir</h2><ul class="detail-list">'+services+'</ul></article><aside class="detail-aside"><span class="detail-kicker">VALOR PRÁTICO</span><h2>Resultados a procurar</h2><ul class="detail-list">'+outcomes+'</ul><div class="detail-aside-cta"><strong>Vamos analisar a sua necessidade?</strong><p>Partilhe o contexto e a equipa poderá indicar os próximos passos, o âmbito e as condições aplicáveis.</p><a href="'+esc(contact)+'?text='+encodeURIComponent('Olá, '+model.provider.name+'. Quero saber mais sobre '+item.title+'.')+'" target="_blank" rel="noopener noreferrer">Falar com a equipa ↗</a></div></aside></div></section>';
})();