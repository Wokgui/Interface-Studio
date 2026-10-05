/* Each pane owns its viewport. The simulation loads the original application URL. */
(() => {
  'use strict';
  const main = document.querySelector('body > main');
  const workspace = document.querySelector('.workspace');
  if (!main || !workspace) return;
  document.body.classList.add('studio-layout');
  const toolbar = document.createElement('div');
  toolbar.className = 'studio-toolbar';
  toolbar.innerHTML = '<button class="btn" data-studio-mode="editor">Édition</button><button class="btn" data-studio-mode="simulation">Simulation</button><button class="btn" data-studio-mode="split">Côte à côte</button><span>Panneaux</span><label><input type="checkbox" data-pane="editor" checked> Éditeur</label><label><input type="checkbox" data-pane="simulation" checked> Simulation</label><label><input type="checkbox" data-pane="chat"> ChatGPT</label><button class="btn" id="studioEqualWidths">Largeurs égales</button>';
  main.before(toolbar);
  toolbar.insertAdjacentHTML('beforeend','<label>Écran <select id="studioScreenProfile" aria-label="Format de l’application"><option value="auto">Automatique</option><option value="compact">Téléphone compact · 360 × 640</option><option value="phone390">Téléphone · 390 × 844</option><option value="phone">Téléphone · 412 × 915</option><option value="phone430">Téléphone large · 430 × 932</option><option value="fold">Téléphone pliable ouvert · 768 × 1024</option><option value="tablet">Tablette · 768 × 1024</option><option value="tv">TV · 16:9</option><option value="desktop">Ordinateur</option><option value="responsive">Adaptatif</option><option value="custom">Dimensions personnalisées</option></select></label><label id="studioCustomScreen" hidden><input id="studioScreenW" type="number" min="240" max="8192" value="1280" aria-label="Largeur de l’écran"> × <input id="studioScreenH" type="number" min="240" max="8192" value="720" aria-label="Hauteur de l’écran"><button class="btn" id="studioApplyScreen">Appliquer</button></label><button class="btn" id="studioRotateScreen" title="Inverser largeur et hauteur">Pivoter</button><span id="studioScreenInfo" aria-live="polite"></span>');
  document.querySelector('.mode-switch')?.remove();
  const pane = (id, title, actions) => {
    const el = document.createElement('section');
    el.className = 'studio-pane'; el.id = 'studioPane-' + id;
    el.innerHTML = '<div class="studio-pane-bar"><b>' + title + '</b><span>' + actions + '</span></div>';
    return el;
  };
  const editor = pane('editor', 'Éditeur', '<button class="btn" id="studioEditorTools">Outils édition</button>');
  editor.append(workspace);
  const simulation = pane('simulation', 'Simulation', '<button class="btn" id="studioSelectElement">Sélectionner</button> <button class="btn" id="studioReloadSimulation">Recharger</button>');
  simulation.insertAdjacentHTML('beforeend', '<div class="studio-simulation-area"><div class="studio-simulation-holder"><div class="studio-simulation-screen"><iframe id="studioSimulationFrame" name="aisSimulation" title="Application en exécution" allow="autoplay; fullscreen; clipboard-read; clipboard-write"></iframe></div></div></div>');
  const chat = document.createElement('section'); chat.id = 'studioPane-chat'; chat.className = 'studio-pane studio-chat-slot';
  main.prepend(editor, simulation, chat);
  const frames = { editor, simulation, chat };
  const iframe = document.getElementById('studioSimulationFrame');
  const area = simulation.querySelector('.studio-simulation-area');
  const screen = simulation.querySelector('.studio-simulation-screen');
  const holder = simulation.querySelector('.studio-simulation-holder');
 const statusBar=document.createElement('div');statusBar.className='studio-system-status';statusBar.innerHTML='<span>12:00</span><span>4G ▰</span>';const navigationBar=document.createElement('div');navigationBar.className='studio-system-navigation';navigationBar.setAttribute('aria-label','Barre système Android simulée');screen.append(statusBar,navigationBar);
 const runtimeChoice=document.createElement('div');runtimeChoice.className='studio-runtime-choice';runtimeChoice.hidden=true;runtimeChoice.innerHTML='<button class="btn" id="studioLocalRuntime">Simulation locale</button><button class="btn" id="studioNativeRuntime">Vérifier sur Android</button><span>Application exécutée localement · sans émulateur</span>';area.before(runtimeChoice);let nativeMode=false;
 function nativeOnly(s){return ['android-project','apk-runtime-only'].includes(s?.type)}
 function useNative(value){nativeMode=nativeOnly(source)||!!value;holder.hidden=nativeMode;runtimeChoice.querySelector('span').textContent=nativeMode?'Vérification Android · retour local disponible pendant le démarrage':'Application exécutée localement · sans émulateur';document.getElementById('studioReloadSimulation').disabled=nativeMode;window.StudioNativeSimulation?.setSource(source,area,nativeMode);fit();}
 document.getElementById('studioLocalRuntime').onclick=()=>useNative(false);document.getElementById('studioNativeRuntime').onclick=()=>useNative(true);
 function simulationProfile(){const p=currentProfile(),mobile=['smartphone','tablet'].includes(p.kind);const value=id=>Number(document.getElementById(id)?.value)||0;return {simulateAndroid:mobile,mode:mobile?'android':'preview',topInset:mobile?value('androidTopInset'):0,bottomInset:mobile?value('androidBottomInset'):0,leftInset:mobile?value('androidLeftInset'):0,rightInset:mobile?value('androidRightInset'):0,systemBarsLayout:document.getElementById('androidBarsLayout')?.value||'overlay',navigationMode:document.getElementById('androidNavigationMode')?.value||'three-button'};}
 function fitBars(){const p=simulationProfile();statusBar.hidden=navigationBar.hidden=!p.simulateAndroid;screen.dataset.bars=p.systemBarsLayout;screen.dataset.navigation=p.navigationMode;screen.style.setProperty('--sim-top',p.topInset+'px');screen.style.setProperty('--sim-bottom',p.bottomInset+'px');screen.style.setProperty('--sim-left',p.leftInset+'px');screen.style.setProperty('--sim-right',p.rightInset+'px');statusBar.firstElementChild.textContent=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});navigationBar.textContent=p.navigationMode==='gesture'?'':'Ⅲ　　▢　　‹';const inset=p.simulateAndroid&&p.systemBarsLayout==='inset';Object.assign(iframe.style,{top:inset?p.topInset+'px':'0px',left:inset?p.leftInset+'px':'0px',width:inset?'calc(100% - '+(p.leftInset+p.rightInset)+'px)':'100%',height:inset?'calc(100% - '+(p.topInset+p.bottomInset)+'px)':'100%'});send('window-profile',p);}
 document.addEventListener('change',e=>{if(['androidBarsLayout','androidNavigationMode','androidTopInset','androidBottomInset','androidLeftInset','androidRightInset'].includes(e.target.id))fit();});
  const nativeNotice=document.createElement('div');nativeNotice.className='studio-native-notice';nativeNotice.hidden=true;
  nativeNotice.innerHTML='<b>Exécution Android nécessaire</b><p>Le format de cette application est détecté. Ses interactions, ses photos et son diaporama nécessitent Android. L’aperçu des ressources dans l’Éditeur ne fait pas tourner son code natif.</p><button class="btn">Ouvrir les outils Android</button>';
  area.append(nativeNotice);nativeNotice.querySelector('button').onclick=()=>window.AppInterfaceStudio?.openAndroidLab();
  let source = null, mode = 'editor', selecting = false, lastSelection = null;
  const screenSelect=document.getElementById('studioScreenProfile'), screenInfo=document.getElementById('studioScreenInfo');
  const profiles={compact:{width:360,height:640,kind:'smartphone'},phone390:{width:390,height:844,kind:'smartphone'},phone:{width:412,height:915,kind:'smartphone'},phone430:{width:430,height:932,kind:'smartphone'},fold:{width:768,height:1024,kind:'smartphone'},tablet:{width:768,height:1024,kind:'tablet'},tv:{width:1920,height:1080,kind:'tv'},desktop:{width:1366,height:768,kind:'desktop'}};
  let detectedProfile=profiles.phone, sourceKey='', projectProfiles={};
  let customProfile={width:1280,height:720,kind:'custom'}, rotated=false;
  try{projectProfiles=JSON.parse(localStorage.getItem('ais-screen-profiles')||'{}');}catch{}
  const validProfile=p=>p&&Number.isFinite(Number(p.width))&&Number.isFinite(Number(p.height))&&p.width>=240&&p.width<=8192&&p.height>=240&&p.height<=8192;
  function currentProfile(){const p=screenSelect.value==='custom'?customProfile:profiles[screenSelect.value]||detectedProfile;return rotated?{...p,width:p.height,height:p.width}:p;}
  function saveScreen(){if(sourceKey){projectProfiles[sourceKey]={mode:screenSelect.value,custom:customProfile,rotated};localStorage.setItem('ais-screen-profiles',JSON.stringify(projectProfiles));}}
  screenSelect.onchange=()=>{rotated=false;document.getElementById('studioCustomScreen').hidden=screenSelect.value!=='custom';saveScreen();fit();};
  document.getElementById('studioApplyScreen').onclick=()=>{const width=Number(document.getElementById('studioScreenW').value),height=Number(document.getElementById('studioScreenH').value);if(!validProfile({width,height})){screenInfo.textContent='Dimensions attendues : 240 à 8192 pixels CSS.';return;}customProfile={width,height,kind:'custom'};saveScreen();fit();};
  document.getElementById('studioRotateScreen').onclick=()=>{if(screenSelect.value==='responsive')return;rotated=!rotated;saveScreen();fit();};
  // Keep the existing editor's device controls functional as well.
  function followEditorSize(){const device=document.querySelector('.device');const p={width:parseFloat(device.style.width),height:parseFloat(device.style.height),kind:device.classList.contains('android-exact')?'smartphone':'custom'};if(!validProfile(p))return;customProfile=p;rotated=false;screenSelect.value='custom';document.getElementById('studioScreenW').value=p.width;document.getElementById('studioScreenH').value=p.height;document.getElementById('studioCustomScreen').hidden=false;saveScreen();fit();}
  document.addEventListener('click',e=>{if(e.target.closest('[data-device-kind],#rotateDeviceBtn,#rotateDeviceBtn2'))followEditorSize();});
  document.addEventListener('change',e=>{if(['devicePreset','screenCustomW','screenCustomH','customDeviceWidth','customDeviceHeight'].includes(e.target.id))followEditorSize();});
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem('ais-workspace-v681') || '{}'); } catch {}
  let chosen = Array.isArray(preferences.chosen) ? preferences.chosen.filter(x => frames[x]) : ['editor', 'simulation'];
  if (!chosen.length) chosen = ['editor'];
  let order = Array.isArray(preferences.order) ? [...new Set(preferences.order.filter(x=>frames[x]))] : [];
  for(const id of Object.keys(frames))if(!order.includes(id))order.push(id);
  const ratios = preferences.ratios || {};
  let visible = [], weights = [];
  const persist = () => localStorage.setItem('ais-workspace-v681', JSON.stringify({chosen, ratios, order}));
  const send = (type, payload = {}) => iframe.contentWindow?.postMessage({source:'ais-simulation-host', type, payload}, '*');
  function fit() {
    fitBars();const profile=currentProfile(), responsive=screenSelect.value==='responsive';
    const width=responsive?Math.max(240,area.clientWidth-28):Number(profile.width), height=responsive?Math.max(240,area.clientHeight-28):Number(profile.height);
    if(responsive){window.StudioHost?.setViewport(Math.max(240,workspace.clientWidth-82),Math.max(240,workspace.clientHeight-82),'desktop');}
    else window.StudioHost?.setViewport(width,height,profile.kind||'custom');
    screenInfo.textContent=responsive?'Contenu réorganisé selon la largeur':width+' × '+height+(source?.type==='android-project'?' · aperçu Android':'');
    document.getElementById('studioRotateScreen').disabled=responsive;
    screen.classList.toggle('studio-landscape',width>height);
    if (!simulation.hidden) {
      const scale = Math.max(.001, Math.min(1, (area.clientWidth-28)/width, (area.clientHeight-28)/height));
      screen.style.width = width+'px'; screen.style.height = height+'px'; screen.style.transform = `scale(${scale})`;
      holder.style.width = width*scale+'px'; holder.style.height = height*scale+'px';
    }
    window.StudioHost?.fitEditor();
    window.StudioChatGpt?.refreshBounds?.();
  }
  function columns() {
    main.style.gridTemplateColumns = weights.map(w => `minmax(0,${w}fr)`).join(' 8px ');
    requestAnimationFrame(fit);
  }
  function render() {
    visible = mode==='editor' ? ['editor'] : mode==='simulation' ? ['simulation'] : order.filter(x => chosen.includes(x));
    const key = visible.join(',');
    const saved = ratios[key];
    weights = Array.isArray(saved) && saved.length===visible.length && saved.every(w => Number.isFinite(w) && w>0) ? saved.slice() : visible.map(() => 1);
    main.querySelectorAll('.studio-splitter').forEach(x => x.remove());
    Object.entries(frames).forEach(([id, el]) => {el.hidden = !visible.includes(id);});
    visible.forEach((id, i) => {
      frames[id].style.gridColumn=String(i*2+1);frames[id].style.gridRow='1';
      if (i===visible.length-1) return;
      const divider = document.createElement('div');
      divider.className = 'studio-splitter'; divider.tabIndex = 0;
      divider.style.gridColumn=String(i*2+2);divider.style.gridRow='1';
      divider.setAttribute('role','separator'); divider.setAttribute('aria-orientation','vertical'); divider.setAttribute('aria-label','Largeur des panneaux');
      const update = fraction => {
        const total = weights[i]+weights[i+1];
        fraction = Math.max(.12, Math.min(.88, fraction));
        weights[i] = total*fraction; weights[i+1] = total*(1-fraction);
        ratios[key] = weights.slice(); divider.setAttribute('aria-valuenow',String(Math.round(fraction*100))); columns();
      };
      divider.addEventListener('pointerdown', e => {
        const a=frames[id].getBoundingClientRect(), b=frames[visible[i+1]].getBoundingClientRect();
        divider.setPointerCapture(e.pointerId);
        const cover=document.createElement('div');cover.style.cssText='position:fixed;inset:0;z-index:999999;cursor:col-resize';document.body.append(cover);
        const move=e=>update((e.clientX-a.left)/(b.right-a.left));
        const end=()=>{cover.remove();divider.removeEventListener('pointermove',move);divider.removeEventListener('pointerup',end);divider.removeEventListener('pointercancel',end);persist();window.StudioChatGpt?.refreshBounds?.();};
        divider.addEventListener('pointermove',move);divider.addEventListener('pointerup',end);divider.addEventListener('pointercancel',end);
      });
      divider.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();update(e.key==='Home'?.5:weights[i]/(weights[i]+weights[i+1])+(e.key==='ArrowLeft'?-.04:.04));persist();});
      main.append(divider);
    });
    toolbar.querySelectorAll('[data-pane]').forEach(x => x.checked=chosen.includes(x.dataset.pane));
    toolbar.querySelectorAll('[data-studio-mode]').forEach(x=>x.classList.toggle('active',x.dataset.studioMode===mode));
    window.StudioChatGpt?.dock?.(chat, visible.includes('chat'));
    if (!visible.includes('editor')) document.body.classList.remove('editor-tools-open');
    columns();
  }
  toolbar.querySelectorAll('[data-studio-mode]').forEach(x=>x.onclick=()=>{mode=x.dataset.studioMode;render();});
  toolbar.querySelectorAll('[data-pane]').forEach(x=>x.onchange=()=>{chosen=[...toolbar.querySelectorAll('[data-pane]:checked')].map(x=>x.dataset.pane);if(!chosen.length)chosen=[x.dataset.pane];mode='split';persist();render();});
  document.getElementById('studioEqualWidths').onclick=()=>{ratios[visible.join(',')]=visible.map(()=>1);persist();render();};
  const side=document.querySelector('.side');
  const editorBody=document.createElement('div');editorBody.className='studio-editor-body';editor.append(editorBody);editorBody.append(workspace,side);
  const toolsHead=document.createElement('div');toolsHead.className='studio-tools-head';toolsHead.innerHTML='<b>Outils d’édition</b><button class="btn" aria-label="Fermer les outils d’édition">Fermer ×</button>';side.prepend(toolsHead);
  function toggleTools(value){if(value)window.StudioInterface?.collapseEditing();document.body.classList.toggle('editor-tools-open',value);document.getElementById('studioEditorTools').setAttribute('aria-expanded',String(value));requestAnimationFrame(fit);}
  toolsHead.querySelector('button').onclick=()=>toggleTools(false);
  document.getElementById('studioEditorTools').onclick=()=>toggleTools(!document.body.classList.contains('editor-tools-open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('editor-tools-open')){toggleTools(false);}});
  function movePane(id,delta){const candidates=mode==='split'&&visible.includes(id)?order.filter(x=>visible.includes(x)):order;const index=candidates.indexOf(id),next=index+delta;if(index<0||next<0||next>=candidates.length)return;const a=order.indexOf(id),b=order.indexOf(candidates[next]);[order[a],order[b]]=[order[b],order[a]];persist();render();}
  for(const [id,el] of Object.entries(frames)){const bar=el.querySelector('.studio-pane-bar');if(!bar)continue;const controls=document.createElement('span');controls.className='studio-pane-order';for(const [delta,text] of [[-1,'←'],[1,'→']]){const b=document.createElement('button');b.className='btn';b.textContent=text;b.title='Déplacer '+(delta<0?'à gauche':'à droite');b.onclick=()=>movePane(id,delta);controls.append(b);}bar.append(controls);}
  toolbar.insertAdjacentHTML('beforeend','<label>Ordre <select id="studioPaneOrder" aria-label="Panneau à déplacer"><option value="editor">Éditeur</option><option value="simulation">Simulation</option><option value="chat">ChatGPT</option></select></label><button class="btn" id="studioPaneLeft">← Gauche</button><button class="btn" id="studioPaneRight">Droite →</button>');
  document.getElementById('studioPaneLeft').onclick=()=>movePane(document.getElementById('studioPaneOrder').value,-1);
  document.getElementById('studioPaneRight').onclick=()=>movePane(document.getElementById('studioPaneOrder').value,1);
  for(const [id,el] of Object.entries(frames)){el.draggable=false;const bar=el.querySelector('.studio-pane-bar');if(!bar)continue;bar.draggable=true;bar.addEventListener('dragstart',e=>e.dataTransfer.setData('application/x-studio-pane',id));el.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('application/x-studio-pane'))e.preventDefault();});el.addEventListener('drop',e=>{const from=e.dataTransfer.getData('application/x-studio-pane');if(!frames[from]||from===id)return;e.preventDefault();order.splice(order.indexOf(from),1);order.splice(order.indexOf(id),0,from);persist();render();});}

  document.getElementById('studioSelectElement').onclick=e=>{selecting=!selecting;e.target.classList.toggle('active',selecting);e.target.textContent=selecting?'Interagir':'Sélectionner';send('inspect',{active:selecting});window.StudioNativeSimulation?.setInspect(selecting);};
  document.getElementById('studioReloadSimulation').onclick=()=>{iframe.contentWindow?.location.reload();};
  function setSource(next) {
    source=next;
    const native=nativeOnly(next);nativeMode=native;runtimeChoice.hidden=!next?.apkProject||native;nativeNotice.hidden=true;holder.hidden=native;document.getElementById('studioSelectElement').disabled=false;document.getElementById('studioReloadSimulation').disabled=native;
    window.StudioNativeSimulation?.setSource(next,area,native);
    sourceKey=next?.path?(next.path+'|'+(next.entry||'')):next?.url||'';
    const saved=projectProfiles[sourceKey];screenSelect.value=typeof saved==='string'?saved:saved?.mode||'auto';if(!screenSelect.value)screenSelect.value='auto';
    screenSelect.querySelector('option[value="responsive"]').disabled=native;if(native&&screenSelect.value==='responsive')screenSelect.value='auto';
    customProfile=validProfile(saved?.custom)?saved.custom:{width:1280,height:720,kind:'custom'};rotated=!!saved?.rotated;
    document.getElementById('studioScreenW').value=customProfile.width;document.getElementById('studioScreenH').value=customProfile.height;document.getElementById('studioCustomScreen').hidden=screenSelect.value!=='custom';
    const supplied=next?.phone?.profile||next?.nativePreviewProfile||next?.screenProfile||next?.studioProject?.formats?.find(p=>p.id===next.studioProject.defaultFormat);
    detectedProfile=validProfile(supplied)?{width:Number(supplied.width),height:Number(supplied.height),kind:supplied.deviceKind||supplied.kind||(next?.phone?.profile?'smartphone':'custom')}:((next?.type==='bundled-demo'||/radio intelligente|radio-intelligente/i.test(next?.label||''))?profiles.phone:profiles.desktop);
    fit();
    if(native){
      iframe.srcdoc='<body style="font:16px system-ui;padding:24px">Cette application contient du code Android natif. Son exécution nécessite le moteur Android facultatif. L’aperçu des ressources reste disponible dans l’Éditeur.</body>';
    } else if(next?.url) {iframe.removeAttribute('srcdoc');const u=new URL(next.url,location.href);u.searchParams.delete('visual-editor');u.searchParams.set('__ais_simulation','1');iframe.src=u.href;}
  }
  iframe.addEventListener('load',()=>{send('inspect',{active:selecting});if(lastSelection)send('selection',lastSelection);fit();});
  window.addEventListener('message',e=>{
    const d=e.data;
    if(e.source===iframe.contentWindow && d?.source==='ais-simulation'){
      if(d.type==='screen-profile'&&validProfile(d.payload)&&!source?.nativePreviewProfile&&!source?.phone?.profile&&!source?.studioProject){detectedProfile=d.payload;fit();}
      if(d.type==='selection'){lastSelection=d.payload;window.StudioHost?.select(d.payload.selector);window.StudioChatGpt?.setSelection?.(d.payload);}
    } else if(e.source===document.getElementById('appFrame')?.contentWindow && d?.source==='app-visual-editor') {
      if(d.type==='selection-cleared'){lastSelection=null;send('selection',{selector:null});window.StudioChatGpt?.setSelection?.(null);}
      if(d.type==='state' && d.payload?.selector){lastSelection=d.payload;send('selection',d.payload);send('css',{css:d.payload.css||''});window.StudioChatGpt?.setSelection?.(d.payload);}
      if(d.type==='css'){send('css',{css:d.payload?.css||''});}
    }
  });
  window.StudioWorkspace={setSource,fit,movePane,getPaneOrder:()=>order.slice(),setNativeSelection:p=>{lastSelection=p;},useScreenProfile(p){if(!validProfile(p))return;customProfile={width:Number(p.width),height:Number(p.height),kind:p.kind||'smartphone'};rotated=false;screenSelect.value='custom';document.getElementById('studioScreenW').value=p.width;document.getElementById('studioScreenH').value=p.height;document.getElementById('studioCustomScreen').hidden=false;saveScreen();fit();window.StudioNativeSimulation?.resize(currentProfile());},setMode(next){mode=next;render();},getSimulationProfile:simulationProfile,isNativeMode:()=>nativeMode,getSource:()=>source,getSelection:()=>lastSelection,getScreenProfile:()=>({...currentProfile(),mode:screenSelect.value})};
  screenSelect.addEventListener('change',()=>window.StudioNativeSimulation?.resize(currentProfile()));
  document.getElementById('studioRotateScreen').addEventListener('click',()=>window.StudioNativeSimulation?.resize(currentProfile()));
  document.getElementById('studioApplyScreen').addEventListener('click',()=>window.StudioNativeSimulation?.resize(currentProfile()));
  new ResizeObserver(fit).observe(main);
  new ResizeObserver(fit).observe(workspace);
  new ResizeObserver(fit).observe(area);
  window.addEventListener('resize',fit);
  window.addEventListener('studio-device-change',fit);
  window.addEventListener('load',render);
  render();
})();
