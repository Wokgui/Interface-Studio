(() => {
 'use strict';
 const api=window.AppInterfaceStudio,compareApi=window.StudioVisualCompare;
 if(!api||!compareApi)return;
 let enabled=false,timer=null,last=null,button,statusEl,dialog,phoneCanvas,simCanvas,diffCanvas,metaEl;

 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const pct=n=>(n*100).toLocaleString('fr-FR',{minimumFractionDigits:n<.01?2:1,maximumFractionDigits:2})+' %';

 function toolbar(){
  const bar=document.querySelector('.studio-toolbar');if(!bar||button)return;
  const wrap=document.createElement('span');wrap.className='studio-visual-validation';
  button=document.createElement('button');button.className='btn';button.id='studioVisualValidate';button.textContent='Valider le rendu';
  statusEl=document.createElement('span');statusEl.id='studioVisualStatus';statusEl.setAttribute('role','status');statusEl.textContent='Validation visuelle inactive';
  wrap.append(button,statusEl);bar.append(wrap);button.onclick=()=>validate({open:true});
  buildDialog();
 }
 function buildDialog(){
  dialog=document.createElement('dialog');dialog.id='studioVisualValidationDialog';dialog.className='studio-visual-dialog';
  dialog.innerHTML='<form method="dialog"><header><h2>Validation visuelle téléphone ↔ Android</h2><button value="cancel" aria-label="Fermer">×</button></header><p class="studio-visual-note">Le téléphone est la référence. La simulation est le même APK exécuté dans Android. Pour un résultat exploitable, affichez le même écran et le même état dans les deux.</p><div class="studio-visual-meta"></div><div class="studio-visual-grid"><figure><figcaption>Téléphone réel</figcaption><canvas data-kind="phone"></canvas></figure><figure><figcaption>Simulation Android</figcaption><canvas data-kind="sim"></canvas></figure><figure><figcaption>Différences</figcaption><canvas data-kind="diff"></canvas></figure></div><footer><button value="cancel">Fermer</button><button type="button" id="studioVisualRunAgain">Comparer à nouveau</button></footer></form>';
  document.body.append(dialog);phoneCanvas=dialog.querySelector('[data-kind="phone"]');simCanvas=dialog.querySelector('[data-kind="sim"]');diffCanvas=dialog.querySelector('[data-kind="diff"]');metaEl=dialog.querySelector('.studio-visual-meta');
  dialog.querySelector('#studioVisualRunAgain').onclick=()=>validate({open:false});
  dialog.addEventListener('close',()=>window.StudioChatGpt?.hideView?.(false));
 }
 function setStatus(text,state='idle'){toolbar();statusEl.textContent=text;statusEl.dataset.state=state;button.dataset.state=state;}
 function crop(snapshot){
  const c=snapshot?.canvas,p=snapshot?.profile||{};if(!c?.width||!c?.height)return null;
  const pw=Number(p.physicalWidth)||c.width,ph=Number(p.physicalHeight)||c.height,sx=c.width/pw,sy=c.height/ph,b=p.viewportPhysicalBounds;
  if(b&&[b.left,b.top,b.right,b.bottom].every(Number.isFinite)){
   return {x:clamp(Math.round(b.left*sx),0,c.width-1),y:clamp(Math.round(b.top*sy),0,c.height-1),w:clamp(Math.round((b.right-b.left)*sx),1,c.width),h:clamp(Math.round((b.bottom-b.top)*sy),1,c.height)};
  }
  const logicalW=Number(p.width)||c.width,logicalH=Number(p.height)||c.height,lx=c.width/logicalW,ly=c.height/logicalH;
  const x=Math.max(0,Math.round((Number(p.leftInset)||0)*lx)),y=Math.max(0,Math.round((Number(p.topInset)||0)*ly));
  return {x,y,w:Math.max(1,c.width-x-Math.max(0,Math.round((Number(p.rightInset)||0)*lx))),h:Math.max(1,c.height-y-Math.max(0,Math.round((Number(p.bottomInset)||0)*ly)))};
 }
 function logicalViewport(snapshot,rect){
  const p=snapshot?.profile||{},scale=Number(p.density)>0?Number(p.density)/160:null;
  return {width:Number(p.viewportWidth)||Number(p.width)||Math.round(rect.w/(scale||1)),height:Number(p.viewportHeight)||Number(p.height)||Math.round(rect.h/(scale||1))};
 }
 function normalized(snapshot,rect,width,height){
  const out=document.createElement('canvas');out.width=width;out.height=height;out.getContext('2d',{alpha:false}).drawImage(snapshot.canvas,rect.x,rect.y,rect.w,rect.h,0,0,width,height);return out;
 }
 function copyCanvas(from,to){to.width=from.width;to.height=from.height;to.getContext('2d',{alpha:false}).drawImage(from,0,0);}
 async function appInfo(snapshot,pkg){
  if(!snapshot?.serial||!pkg)return null;const r=await api.androidCommand('app-info',{serial:snapshot.serial,package:pkg});return r?.ok?r:null;
 }
 function sameBuild(a,b){
  if(!a||!b)return null;
  if(a.package!==b.package||a.versionCode!==b.versionCode)return false;
  if(a.apkSha256&&b.apkSha256)return a.apkSha256===b.apkSha256;
  return true;
 }
 function envText(label,x){if(!x)return label+' : indisponible';return label+' : Android '+(x.androidRelease||x.api||'?')+' · WebView '+(x.webViewVersion||'?')+' · v'+(x.versionName||x.versionCode||'?');}

 async function validate({open=false}={}){
  toolbar();if(!enabled){setStatus('Active le rendu Android exact pour valider','idle');return null;}
  const phone=window.StudioPhone?.getSnapshot?.(),sim=window.StudioNativeSimulation?.getSnapshot?.();
  if(!phone?.active||!phone.canvas?.width){setStatus('Téléphone réel non connecté','warn');return null;}
  if(!sim?.running||!sim.canvas?.width){setStatus('Simulation Android en cours de démarrage…','warn');return null;}
  setStatus('Comparaison en cours…','busy');
  const pr=crop(phone),sr=crop(sim);if(!pr||!sr){setStatus('Impossible de lire les deux images','fail');return null;}
  const pv=logicalViewport(phone,pr),sv=logicalViewport(sim,sr),geometryMatch=Math.abs(pv.width-sv.width)<=1&&Math.abs(pv.height-sv.height)<=1;
  const width=clamp(Math.round((pv.width+sv.width)/2),240,600),height=clamp(Math.round((pv.height+sv.height)/2),320,1100);
  const pn=normalized(phone,pr,width,height),sn=normalized(sim,sr,width,height),pa=pn.getContext('2d').getImageData(0,0,width,height),sa=sn.getContext('2d').getImageData(0,0,width,height);
  const comparison=compareApi.compare(pa.data,sa.data,{channelThreshold:28,allowedMismatch:.02,diff:true});
  const source=window.StudioWorkspace?.getSource?.(),pkg=source?.apkProject?.package||source?.phone?.package||'';
  const [phoneInfo,simInfo]=await Promise.all([appInfo(phone,pkg).catch(()=>null),appInfo(sim,pkg).catch(()=>null)]),buildMatch=sameBuild(phoneInfo,simInfo);
  const pass=geometryMatch&&comparison.pass&&buildMatch!==false;
  last={pass,geometryMatch,buildMatch,comparison,phoneInfo,simInfo,phoneViewport:pv,simViewport:sv,width,height,time:Date.now()};
  setStatus((pass?'Conforme · ':'Écart détecté · ')+pct(comparison.mismatchRatio),pass?'pass':'fail');
  copyCanvas(pn,phoneCanvas);copyCanvas(sn,simCanvas);diffCanvas.width=width;diffCanvas.height=height;const dc=diffCanvas.getContext('2d');const di=dc.createImageData(width,height);di.data.set(comparison.diff);dc.putImageData(di,0,0);
  metaEl.innerHTML='<p><b>'+(pass?'Validation réussie':'Validation échouée')+'</b> · '+pct(comparison.mismatchRatio)+' de pixels au-delà de la tolérance · écart moyen '+comparison.meanAbsolute.toFixed(1)+'/255.</p><p>Viewport téléphone : '+pv.width+' × '+pv.height+' · Android : '+sv.width+' × '+sv.height+' · '+(geometryMatch?'géométrie concordante':'géométrie différente')+'.</p><p>'+envText('Téléphone',phoneInfo)+'<br>'+envText('Simulation',simInfo)+'</p><p>APK : '+(buildMatch===true?'même version et même empreinte':buildMatch===false?'différent entre téléphone et simulation':'vérification indisponible')+'.</p>';
  if(open&&!dialog.open){window.StudioChatGpt?.hideView?.(true);dialog.showModal();}
  return last;
 }
 function schedule(delay=1200){clearTimeout(timer);if(!enabled)return;timer=setTimeout(()=>validate({open:false}).catch(e=>setStatus('Validation impossible : '+e.message,'fail')),delay);}
 function setEnabled(value){enabled=!!value;toolbar();button.disabled=!enabled;if(enabled){setStatus('Validation en attente des deux rendus','idle');schedule(1500);}else setStatus('Validation visuelle inactive','idle');}
 toolbar();setEnabled(!!window.StudioWorkspace?.isExactAndroid?.());
 window.StudioVisualValidation={validate,schedule,setEnabled,getLast:()=>last};
})();