const menuBtn=document.getElementById('menuBtn'),mobileLinks=document.getElementById('mobileLinks');
menuBtn.addEventListener('click',()=>{const open=mobileLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'×':'☰'});
mobileLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰'}));
document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('interest').value=a.dataset.topic==='Gestão de Riscos e Compliance'?'Gestão de Riscos e Compliance':a.dataset.topic}));

document.querySelectorAll('.catalogue-filter').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 const cards=Array.from(document.querySelectorAll('.course-card'));
 document.querySelectorAll('.catalogue-filter').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 let visible=0;
 cards.forEach(card=>{const show=filter==='all'||card.dataset.category===filter;card.hidden=!show;if(show)visible++;});
 const status=document.getElementById('catalogueStatus');
 if(status)status.textContent=visible===1?'A mostrar 1 formação.':`A mostrar ${visible} formações.`;
}));
document.querySelectorAll('[data-course]').forEach(link=>link.addEventListener('click',()=>{
 const area=link.dataset.area;
 const course=link.dataset.course;
 const interest=document.getElementById('interest');
 interest.value=Array.from(interest.options).some(option=>option.value===area)?area:'Programa à medida';
 const message=document.getElementById('message');
 const current=message.value.trim();
 const line='Formação de interesse: '+course;
 if(!current.includes(line)) message.value=(current?current+'\n\n':'')+line;
}));

document.getElementById('year').textContent=new Date().getFullYear();
const CONTACT_EMAIL = 'info@alinvest-group.com';
document.getElementById('contactForm').addEventListener('submit',e=>{
 e.preventDefault();
 const form=e.currentTarget;
 const status=document.getElementById('formStatus');
 if(!form.reportValidity())return;
 const d=new FormData(form);
 const name=String(d.get('name')||'').trim();
 const email=String(d.get('email')||'').trim();
 if(!name||!email){status.textContent='Preencha o nome e o email para preparar o pedido.';return;}
 const requestType=d.get('requestType')||'Pedido geral';
 const interest=d.get('interest')||'Não especificada';
 const subject=requestType+' — ALINVEST | '+interest;
 const body='Tipo de pedido: '+requestType+'\\nNome: '+name+'\\nOrganização: '+(String(d.get('org')||'').trim()||'Não indicada')+'\\nEmail: '+email+'\\nÁrea de interesse: '+interest+'\\n\\nMensagem:\\n'+(String(d.get('message')||'').trim()||'Sem mensagem adicional');
 status.textContent='O seu programa de email deverá abrir com o pedido preparado. Verifique o destinatário '+CONTACT_EMAIL+' e carregue em Enviar para concluir o contacto.';
 const mailto='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 window.location.href=mailto;
});
document.querySelectorAll('[data-contact-path]').forEach(function(link){link.addEventListener('click',function(){var select=document.getElementById('requestType');if(select){select.value=link.getAttribute('data-contact-path')==='business'?'Pedido empresarial':'Formação individual';}});});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileLinks.classList.contains('open')){mobileLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰';menuBtn.focus();}});
