'use strict';
(() => {
 const $=id=>document.getElementById(id);
 const svgNS='http://www.w3.org/2000/svg';
 const key='ritkompas.designPreferences.v2';
 const themeLabels={sand:'Expedition',forest:'Forest',slate:'Slate',silver:'Classic'};
 let prefs={theme:'sand',quickKind:null,businessAddress:'',privateAddress:''};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object'){
  if(Object.hasOwn(themeLabels,saved.theme))prefs.theme=saved.theme;
  if(['Zakelijk','Privé'].includes(saved.quickKind))prefs.quickKind=saved.quickKind;
  if(typeof saved.businessAddress==='string')prefs.businessAddress=saved.businessAddress.slice(0,500);
  if(typeof saved.privateAddress==='string')prefs.privateAddress=saved.privateAddress.slice(0,500);
 }}catch{}
 function persist(){try{localStorage.setItem(key,JSON.stringify(prefs));return true;}catch{return false;}}
 function icon(name){const svg=document.createElementNS(svgNS,'svg');svg.classList.add('rk-icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svgNS,'use');use.setAttribute('href','#rk-'+name);svg.append(use);return svg;}
 function replace(target,name){if(target)target.replaceChildren(icon(name));}
 document.querySelectorAll('.tabs [data-tab]').forEach(a=>{replace(a.querySelector('.tab-icon'),{home:'home',trips:'route',reports:'chart',jeep:'jeep'}[a.dataset.tab]);});
 const mast=document.querySelector('.mast .compass');if(mast){const image=new Image();image.src='assets/brand-placeholder.svg';image.alt='Merkplaceholder, geen definitief appicoon';image.className='brand-mark';mast.replaceChildren(image);mast.removeAttribute('aria-hidden');}
 document.querySelectorAll('.hero img').forEach(img=>{img.src='assets/jeep-placeholder.svg';img.alt='Privébeeld niet meegeleverd in publieke bronreferentie';});
 const line=document.querySelector('.vehicle-line>span');if(line)line.replaceChildren(icon('jeep'),document.createTextNode('Jouw Jeep, jouw overzicht'));
 document.querySelectorAll('.trip .pin').forEach(node=>replace(node,'pin'));
 document.querySelectorAll('.badge').forEach(badge=>{const kind=badge.classList.contains('private')||badge.textContent.includes('Privé')?'Privé':'Zakelijk';badge.replaceChildren(icon(kind==='Privé'?'home':'work'),document.createTextNode(kind));});
 document.querySelectorAll('[data-trip]').forEach(a=>a.addEventListener('click',()=>{const badge=$('detail-kind');const kind=badge.textContent.includes('Privé')?'Privé':'Zakelijk';badge.replaceChildren(icon(kind==='Privé'?'home':'work'),document.createTextNode(kind));}));
 document.querySelectorAll('.choice').forEach(a=>{const label=document.createElement('span');label.className='choice-label';label.textContent=a.dataset.choice;a.replaceChildren(icon(a.dataset.choice==='Privé'?'home':'work'),label);});
 const feedback=document.querySelector('.topbar [data-feedback]');if(feedback)feedback.replaceChildren(icon('feedback'),document.createTextNode('Geef feedback'));
 const demo=document.querySelector('#home a[href="#choice"]');if(demo){demo.replaceChildren(icon('play'),document.createTextNode('Probeer een voorbeeldrit'),icon('arrow'));}
 const report=$('report-button');if(report)report.replaceChildren(icon('chart'),document.createTextNode('Bekijk rapportvoorbeeld'),icon('arrow'));
 const indexLink=document.querySelector('.topbar>a:first-child>span:last-child');if(indexLink){indexLink.textContent='☰';indexLink.setAttribute('aria-hidden','true');}
 function updateAppearance(){document.body.dataset.theme=prefs.theme;document.body.classList.toggle('home-view',!location.hash||location.hash==='#home');
  document.querySelectorAll('[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===prefs.theme)));
  document.querySelectorAll('[data-quick-kind]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.quickKind===prefs.quickKind)));
  document.querySelectorAll('[data-choice]').forEach(a=>a.dataset.recommended=String(a.dataset.choice===prefs.quickKind));
  $('quick-choice-status').textContent=prefs.quickKind?'Voorkeur: '+prefs.quickKind+' · voor het ritvoorbeeld.':'Nog geen voorkeur gekozen.';
  $('theme-status').textContent=themeLabels[prefs.theme]+' geselecteerd.';
 }
 document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{prefs.theme=button.dataset.theme;updateAppearance();if(!persist())$('theme-status').textContent=themeLabels[prefs.theme]+' actief. Deze browser kan je keuze niet blijvend opslaan.';}));
 document.querySelectorAll('[data-quick-kind]').forEach(button=>button.addEventListener('click',()=>{prefs.quickKind=button.dataset.quickKind;updateAppearance();if(!persist())$('quick-choice-status').textContent='Voorkeur '+prefs.quickKind+' geldt nu; blijvend opslaan is in deze browser niet beschikbaar.';}));
 $('business-address').value=prefs.businessAddress;$('private-address').value=prefs.privateAddress;
 $('save-addresses').addEventListener('click',()=>{prefs.businessAddress=$('business-address').value.trim().slice(0,500);prefs.privateAddress=$('private-address').value.trim().slice(0,500);$('addresses-status').textContent=persist()?'Alleen in deze browser bewaard. Niet verstuurd en nog niet gebruikt voor ritten.':'Niet opgeslagen: deze browser weigert lokale opslag. De invoer is alleen voor deze geopende preview beschikbaar.';});
 window.addEventListener('hashchange',()=>{updateAppearance();});updateAppearance();
})();
