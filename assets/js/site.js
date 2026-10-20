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
const contactForm=document.getElementById('contactForm');
contactForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const form=event.currentTarget,status=document.getElementById('formStatus'),submit=form.querySelector('button[type="submit"]');
 if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form).entries());
 for(const key of ['name','email','org','message'])data[key]=String(data[key]||'').trim();
 if(!data.name||!data.email||!data.requestType||!data.interest){status.textContent='Preencha os campos obrigatórios antes de enviar.';return;}
 status.textContent='A enviar o seu pedido…';submit.disabled=true;
 try{
  const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(result.error||'Não foi possível enviar o pedido neste momento.');
  status.textContent='Pedido enviado com sucesso. A equipa ALINVEST recebeu o seu contacto.';
  form.reset();
 }catch(error){status.textContent=error.message||'O envio falhou. Tente novamente ou contacte info@alinvest-group.com directamente.';}
 finally{submit.disabled=false;}
});
document.querySelectorAll('[data-contact-path]').forEach(function(link){link.addEventListener('click',function(){var select=document.getElementById('requestType');if(select){select.value=link.getAttribute('data-contact-path')==='business'?'Pedido empresarial':'Formação individual';}});});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileLinks.classList.contains('open')){mobileLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰';menuBtn.focus();}});

const trainingViewport=document.getElementById('trainingCarouselViewport');
const trainingTrack=document.getElementById('trainingCarouselTrack');
const trainingPrev=document.getElementById('trainingPrev');
const trainingNext=document.getElementById('trainingNext');
const trainingStatus=document.getElementById('trainingCarouselStatus');
if(trainingViewport&&trainingTrack&&trainingPrev&&trainingNext&&trainingStatus){
 const trainingCards=Array.from(trainingTrack.querySelectorAll('.area-editorial-card'));
 let trainingIndex=0;
 const updateTrainingCarousel=()=>{
  if(!trainingCards.length)return;
  const cardWidth=trainingCards[0].getBoundingClientRect().width;
  const trackStyle=getComputedStyle(trainingTrack);
  const gap=parseFloat(trackStyle.columnGap||trackStyle.gap)||0;
  const visible=Math.max(1,Math.round((trainingViewport.clientWidth+gap)/(cardWidth+gap)));
  const maxIndex=Math.max(0,trainingCards.length-visible);
  trainingIndex=Math.min(trainingIndex,maxIndex);
  trainingTrack.style.transform='translateX(-'+(trainingIndex*(cardWidth+gap))+'px)';
  trainingPrev.disabled=trainingIndex===0;
  trainingNext.disabled=trainingIndex>=maxIndex;
  const first=trainingIndex+1;
  const last=Math.min(trainingCards.length,trainingIndex+visible);
  trainingStatus.textContent=String(first).padStart(2,'0')+'–'+String(last).padStart(2,'0')+' de '+String(trainingCards.length).padStart(2,'0');
 };
 trainingPrev.addEventListener('click',()=>{trainingIndex=Math.max(0,trainingIndex-1);updateTrainingCarousel();});
 trainingNext.addEventListener('click',()=>{trainingIndex=Math.min(trainingCards.length-1,trainingIndex+1);updateTrainingCarousel();});
 window.addEventListener('resize',updateTrainingCarousel);
 if('ResizeObserver' in window)new ResizeObserver(updateTrainingCarousel).observe(trainingViewport);
 updateTrainingCarousel();
}
