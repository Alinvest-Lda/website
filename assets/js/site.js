const menuBtn=document.getElementById('menuBtn'),mobileLinks=document.getElementById('mobileLinks');
menuBtn.addEventListener('click',()=>{const open=mobileLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'×':'☰'});
mobileLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰'}));
document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('interest').value=a.dataset.topic==='Gestão de Riscos e Compliance'?'Gestão de Riscos e Compliance':a.dataset.topic}));

document.querySelectorAll('.catalogue-filter').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 document.querySelectorAll('.catalogue-filter').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 document.querySelectorAll('.course-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter});
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
 const d=new FormData(e.currentTarget);
 const requestType=d.get('requestType')||'Pedido geral';
 const subject=requestType+' — ALINVEST | '+d.get('interest');
 const body='Tipo de pedido: '+requestType+'\nNome: '+d.get('name')+'\nOrganização: '+(d.get('org')||'Não indicada')+'\nEmail: '+d.get('email')+'\nÁrea de interesse: '+d.get('interest')+'\n\nMensagem:\n'+(d.get('message')||'Sem mensagem adicional');
 const status=document.getElementById('formStatus');
 status.textContent='A abrir o seu programa de email. Confirme o destinatário e envie a mensagem para concluir o pedido.';
 window.location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
});
document.querySelectorAll('[data-contact-path]').forEach(function(link){link.addEventListener('click',function(){var select=document.getElementById('requestType');if(select){select.value=link.getAttribute('data-contact-path')==='business'?'Pedido empresarial':'Formação individual';}});});
