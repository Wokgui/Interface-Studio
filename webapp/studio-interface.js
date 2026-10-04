(() => {
 'use strict';
 const top=document.querySelector('.top-actions');
 function group(parent,title,elements,collapsible=false){
  const box=document.createElement(collapsible?'details':'section');box.className='studio-action-group';
  const name=document.createElement(collapsible?'summary':'b');name.textContent=title;
  const content=document.createElement('div');box.append(name,content);for(const el of elements)if(el)content.append(el);parent.append(box);return box;
 }
 const ids=values=>values.map(id=>document.getElementById(id)).filter(Boolean);
 group(top,'Projet',ids(['studioCreateApplication','openProjectBtn','saveProjectBtn']));
 group(top,'Développer',ids(['studioDevelopFormats','openAsAppBtn','reloadBtn']));
 group(top,'Android',ids(['apkFilesBtn','exportApkBtn','apkToolsBtn','openAndroidLabBtn','realApkBtn']),true);
 group(top,'ChatGPT',ids(['studioChatBtn','exportChatGPTBtn']),true);
 group(top,'Préférences',ids(['commandsBtn','settingsBtn']),true);
 const toolbar=document.querySelector('.studio-toolbar');
 const paneControls=[...toolbar.children].filter(el=>el.matches('[data-pane]')||el.querySelector('[data-pane]')||['studioEqualWidths','studioPaneLeft','studioPaneRight'].includes(el.id)||el.querySelector('#studioPaneOrder'));
 [...toolbar.children].filter(el=>el.tagName==='SPAN'&&el.textContent==='Panneaux').forEach(el=>el.remove());
 const panelMenu=group(toolbar,'Panneaux',paneControls,true);panelMenu.classList.add('studio-panel-menu');toolbar.insertBefore(panelMenu,toolbar.querySelector('#studioScreenProfile').closest('label'));
 toolbar.querySelector('#studioScreenProfile').closest('label').classList.add('studio-format-control');
 toolbar.querySelector('#studioScreenProfile').closest('label').childNodes[0].textContent='Format ';
 document.querySelectorAll('.studio-action-group').forEach(box=>{if(box.tagName==='DETAILS')box.addEventListener('toggle',()=>{if(box.open)document.querySelectorAll('.studio-action-group[open]').forEach(other=>{if(other!==box)other.open=false;});});});
 document.addEventListener('pointerdown',event=>{document.querySelectorAll('.studio-action-group[open]').forEach(box=>{if(!box.contains(event.target))box.open=false;});});
 const side=document.querySelector('.side');
 const categories=['Écran et repères','Éléments et calques','Mise en page','Apparence et contenu','Tests et diagnostics','Projet et fichiers'];
 const boxes=categories.map(name=>{const box=document.createElement('details');box.className='studio-tool-category';const head=document.createElement('summary');head.textContent=name;box.append(head);side.append(box);return box;});
 for(const card of [...side.querySelectorAll(':scope > .card')]){
  const heading=card.querySelector('h2')?.cloneNode(true);heading?.querySelectorAll('small').forEach(s=>s.remove());const title=heading?.textContent.toLowerCase()||'';
  const i=/test|audit|répar|scénario|clavier|navigation|flow|réseau|cohérence|accessib|performance|surveillance|routes|diagnostic/.test(title)?4:/écran|zoom|grille|repère/.test(title)?0:/sélection|calque|groupe|élément|structure/.test(title)?1:/espacement|align|dimension|position|responsive|adaptatif|flex|grid|box model|distrib|ancrage/.test(title)?2:/texte|police|couleur|image|style|contenu|média|design|apparence|animation|tokens/.test(title)?3:5;
  boxes[i].append(card);
 }
 for(const box of boxes)if(box.children.length===1)box.remove();
 window.StudioInterface={collapseEditing(){side.querySelectorAll('details').forEach(el=>el.open=false);side.querySelectorAll('.card').forEach(card=>{card.classList.add('collapsed');card.querySelector(':scope > h2')?.setAttribute('aria-expanded','false');});side.scrollTop=0;}};
 window.StudioInterface.collapseEditing();
 const overlays=[...document.querySelectorAll('.source-modal,.multi-modal,.diff-modal,.flow-modal,.matrix-modal,.repair-modal')];let overlayOpen=false;
 const checkOverlays=()=>{const next=overlays.some(el=>!el.hidden&&getComputedStyle(el).display!=='none');if(next!==overlayOpen){overlayOpen=next;window.StudioChatGpt?.hideView(next);}};
 const observer=new MutationObserver(checkOverlays);for(const el of overlays)observer.observe(el,{attributes:true,attributeFilter:['hidden','class','style']});checkOverlays();

})();
