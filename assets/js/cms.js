(function(){
  'use strict';
  const config=window.ALINVEST_CMS||{};
  const base=String(config.apiBase||'').trim().replace(/\\/$/,'');
  if(!base) return;
  const api=base+'/wp-json/wp/v2/';
  const safeHtml=value=>String(value||'').replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi,'');
  const textOnly=value=>{const node=document.createElement('div');node.innerHTML=value||'';return(node.textContent||'').trim();};
  async function get(path){const response=await fetch(api+path,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('WordPress API: '+response.status);return response.json();}
  async function hydratePages(){
    const slugs=(config.pageSlugs||[]).map(s=>encodeURIComponent(s));
    await Promise.all(slugs.map(async slug=>{
      const target=document.querySelector('[data-cms-page="'+CSS.escape(decodeURIComponent(slug))+'"]');if(!target)return;
      try{const pages=await get('pages?slug='+slug+'&_fields=slug,content,modified,status');const page=pages&&pages[0];if(page&&page.status==='publish'&&page.content&&page.content.rendered){target.innerHTML=safeHtml(page.content.rendered);target.dataset.cmsLoaded='true';}}
      catch(error){console.warn('A área WordPress '+slug+' manteve o conteúdo de reserva.',error);}
    }));
  }
  function card(post,index){
    const title=textOnly(post.title&&post.title.rendered)||'Publicação ALINVEST';
    const excerpt=textOnly(post.excerpt&&post.excerpt.rendered).replace(/\\s+/g,' ').slice(0,190);
    const link=String(post.link||'#actualizacoes');
    const date=post.date?new Date(post.date).toLocaleDateString('pt-MZ',{day:'2-digit',month:'short',year:'numeric'}):'ALINVEST';
    const categories=post._embedded&&post._embedded['wp:term']&&post._embedded['wp:term'][0]||[];
    const category=categories[0]&&categories[0].name||'ALINVEST · ACTUALIZAÇÕES';
    const image=post._embedded&&post._embedded['wp:featuredmedia']&&post._embedded['wp:featuredmedia'][0]&&post._embedded['wp:featuredmedia'][0].source_url;
    const visual=image?'<div class="update-card-visual update-visual-management"><img src="'+image.replace(/"/g,'&quot;')+'" alt="" loading="lazy"><span>'+category.replace(/[<>]/g,'')+'</span></div>':'<div class="update-card-visual update-visual-management" aria-hidden="true"><span>'+category.replace(/[<>]/g,'')+'</span><b>'+String(index+1).padStart(2,'0')+'</b></div>';
    return '<article class="update-card">'+visual+'<div class="update-card-body"><span class="update-category">'+category.replace(/[<>]/g,'')+' · '+date+'</span><h3><a href="'+link.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener noreferrer">'+title+'</a></h3><p>'+excerpt+'</p><a class="update-coming" href="'+link.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener noreferrer">Ler publicação ↗</a></div></article>';
  }
  async function hydratePosts(){
    const grid=document.querySelector('[data-wordpress-posts]');if(!grid)return;
    try{const posts=await get('posts?per_page='+Math.min(12,Math.max(1,Number(config.postsPerPage)||8))+'&_embed=1&status=publish&_fields=id,date,link,title,excerpt,_embedded');if(!Array.isArray(posts)||!posts.length)return;
      grid.innerHTML=posts.map(card).join('');grid.dataset.cmsLoaded='true';
    }catch(error){console.warn('O blog manteve os conteúdos de reserva porque o WordPress não respondeu.',error);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hydratePages();hydratePosts();});else{hydratePages();hydratePosts();}
})();
