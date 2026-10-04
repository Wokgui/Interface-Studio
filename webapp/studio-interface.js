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
 const side=document.querySelector('.side');
 const categories=['Écran et disposition','Sélection et calques','Style et contenu','Tests et fonctionnement','Projet et export'];
 const boxes=categories.map(name=>{const box=document.createElement('details');box.className='studio-tool-category';const head=document.createElement('summary');head.textContent=name;box.append(head);side.append(box);return box;});
 for(const card of [...side.querySelectorAll(':scope > .card')]){
  const heading=card.querySelector('h2')?.cloneNode(true);heading?.querySelectorAll('small').forEach(s=>s.remove());const title=heading?.textContent.toLowerCase()||'';
  const i=/test|audit|répar|scénario|clavier|navigation|flow|réseau|cohérence|accessib|performance|surveillance|routes/.test(title)?3:/écran|zoom|grille|repère|espacement|align|dimension|position|responsive/.test(title)?0:/sélection|calque|groupe|élément|structure/.test(title)?1:/texte|police|couleur|image|style|contenu|média|design/.test(title)?2:/test|audit|répar|scénario|clavier|navigation|flow|réseau|cohérence|accessib|performance/.test(title)?3:4;
  boxes[i].append(card);
 }
 for(const box of boxes)if(box.children.length===1)box.remove();
 boxes[0].open=true;
 const overlays=[...document.querySelectorAll('.source-modal,.multi-modal,.diff-modal,.flow-modal,.matrix-modal,.repair-modal')];let overlayOpen=false;
 const checkOverlays=()=>{const next=overlays.some(el=>!el.hidden&&getComputedStyle(el).display!=='none');if(next!==overlayOpen){overlayOpen=next;window.StudioChatGpt?.hideView(next);}};
 const observer=new MutationObserver(checkOverlays);for(const el of overlays)observer.observe(el,{attributes:true,attributeFilter:['hidden','class','style']});checkOverlays();

})();
