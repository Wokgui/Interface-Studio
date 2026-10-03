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
  let source = null, mode = 'editor', selecting = false, lastSelection = null;
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem('ais-workspace-v681') || '{}'); } catch {}
  let chosen = Array.isArray(preferences.chosen) ? preferences.chosen.filter(x => frames[x]) : ['editor', 'simulation'];
  if (!chosen.length) chosen = ['editor'];
  const ratios = preferences.ratios || {};
  let visible = [], weights = [];
  const persist = () => localStorage.setItem('ais-workspace-v681', JSON.stringify({chosen, ratios}));
  const send = (type, payload = {}) => iframe.contentWindow?.postMessage({source:'ais-simulation-host', type, payload}, '*');
  function fit() {
    const device = document.querySelector('.device');
    const width = parseFloat(device?.style.width) || 412, height = parseFloat(device?.style.height) || 915;
    if (!simulation.hidden) {
      const scale = Math.max(.05, Math.min(1, (area.clientWidth-28)/width, (area.clientHeight-28)/height));
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
    visible = mode==='editor' ? ['editor'] : mode==='simulation' ? ['simulation'] : ['editor','simulation','chat'].filter(x => chosen.includes(x));
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
  document.getElementById('studioEditorTools').onclick=()=>{document.body.classList.toggle('editor-tools-open');window.StudioChatGpt?.hideView?.(document.body.classList.contains('editor-tools-open'));};
  document.getElementById('studioSelectElement').onclick=e=>{selecting=!selecting;e.target.classList.toggle('active',selecting);e.target.textContent=selecting?'Interagir':'Sélectionner';send('inspect',{active:selecting});};
  document.getElementById('studioReloadSimulation').onclick=()=>{iframe.contentWindow?.location.reload();};
  function setSource(next) {
    source=next;
    if(next?.type==='apk-runtime-only'||next?.type==='android-project'){
      iframe.srcdoc='<body style="font:16px system-ui;padding:24px">Cette application contient du code Android natif. Son exécution nécessite le moteur Android facultatif. L’aperçu des ressources reste disponible dans l’Éditeur.</body>';
    } else if(next?.url) {iframe.removeAttribute('srcdoc');const u=new URL(next.url,location.href);u.searchParams.delete('visual-editor');u.searchParams.set('__ais_simulation','1');iframe.src=u.href;}
  }
  iframe.addEventListener('load',()=>{send('inspect',{active:selecting});if(lastSelection)send('selection',lastSelection);fit();});
  window.addEventListener('message',e=>{
    const d=e.data;
    if(e.source===iframe.contentWindow && d?.source==='ais-simulation'){
      if(d.type==='selection'){lastSelection=d.payload;window.StudioHost?.select(d.payload.selector);window.StudioChatGpt?.setSelection?.(d.payload);}
    } else if(e.source===document.getElementById('appFrame')?.contentWindow && d?.source==='app-visual-editor') {
      if(d.type==='state' && d.payload?.selector){lastSelection=d.payload;send('selection',d.payload);send('css',{css:d.payload.css||''});window.StudioChatGpt?.setSelection?.(d.payload);}
      if(d.type==='css'){send('css',{css:d.payload?.css||''});}
    }
  });
  window.StudioWorkspace={setSource,fit,setMode(next){mode=next;render();},getSource:()=>source,getSelection:()=>lastSelection};
  new ResizeObserver(fit).observe(main);
  new ResizeObserver(fit).observe(workspace);
  new ResizeObserver(fit).observe(area);
  window.addEventListener('resize',fit);
  window.addEventListener('studio-device-change',fit);
  window.addEventListener('load',render);
  render();
})();
