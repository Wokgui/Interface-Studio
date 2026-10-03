(() => {
  'use strict';
  if(!document.body||!document.head)return;
  if(window.__AIS_SIMULATION__)return;
  window.__AIS_SIMULATION__=true;
  window.RadioVisualEditor?.disable?.();
  document.querySelectorAll('#veLauncher,.ve-toolbar').forEach(el=>el.remove());
  // Saved HTML/APK snapshots can show a track while their boot script resets cur.
  // Rehydrate that track from the real catalogue and renew expired preview URLs.
  if(typeof jp==='function' && typeof cur!=='undefined' && document.getElementById('audio') && document.getElementById('play')){
    const audio=document.getElementById('audio'), play=document.getElementById('play');
    const original=play.onclick;
    play.onclick=async function(event){
      if(!cur && audio.getAttribute('src')){
        const title=document.getElementById('title')?.textContent.trim();
        const artist=document.getElementById('artist')?.textContent.split(' — ')[0].trim();
        if(title&&artist){
          try{
            const result=await jp('https://api.deezer.com/search?q='+encodeURIComponent(artist+' '+title)+'&limit=30');
            const track=result.data?.find(t=>t.title?.toLowerCase()===title.toLowerCase()&&t.artist?.name?.toLowerCase()===artist.toLowerCase());
            if(track?.preview){const category=typeof L==='object'?Object.entries(L).find(([,v])=>document.getElementById('cat')?.textContent.trim().endsWith(v))?.[0]:null;cur={id:track.id,title:track.title,artist:track.artist.name,album:track.album?.title||'',cover:track.album?.cover_big||'',preview:track.preview,category:category||'piano',source:'deezer',externalUrl:track.link};show();}
          }catch(error){emit('error',{message:'Actualisation du morceau : '+error.message});}
        }
      }
      return original?.call(this,event);
    };
    const nativePlay=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=async function(){
      if(this!==audio)return nativePlay.call(this);
      const expiration=Number(String(this.src).match(/exp=(\d+)/)?.[1]);
      if(cur&&/^\d+$/.test(String(cur.id))&&((expiration&&expiration<Date.now()/1000+30)||this.error)){
        const fresh=await jp('https://api.deezer.com/track/'+encodeURIComponent(cur.id));
        if(!fresh.preview)throw Error('Cet extrait n’est plus disponible dans le catalogue.');
        cur.preview=fresh.preview;this.src=fresh.preview;this.load();
      }
      return nativePlay.call(this);
    };
  }
  let inspecting=false, selected=null;
  const emit=(type,payload)=>parent.postMessage({source:'ais-simulation',type,payload},'*');
  const selector=el=>{
    if(el.id)return '#'+CSS.escape(el.id);
    const parts=[];
    while(el&&el!==document.documentElement){const p=el.parentElement;if(!p)break;parts.unshift(el.tagName.toLowerCase()+':nth-child('+([...p.children].indexOf(el)+1)+')');el=p;}
    return 'html>'+parts.join('>');
  };
  const outline=document.createElement('div');outline.id='ais-simulation-selection';outline.style.cssText='display:none;position:fixed;pointer-events:none;border:2px solid #8a42ef;z-index:2147483647;box-sizing:border-box';document.body.append(outline);
  function highlight(){if(!selected||!selected.isConnected){outline.style.display='none';return;}const r=selected.getBoundingClientRect();Object.assign(outline.style,{display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});}
  document.addEventListener('click',e=>{
    if(!inspecting)return;
    e.preventDefault();e.stopImmediatePropagation();selected=e.target;highlight();
    const r=selected.getBoundingClientRect(), cs=getComputedStyle(selected);
    const styles={};for(const p of ['display','position','fontSize','color','backgroundColor','padding','margin','width','height'])styles[p]=cs[p];
    emit('selection',{selector:selector(selected),text:selected.textContent?.trim().slice(0,500),tag:selected.tagName,x:r.x,y:r.y,width:r.width,height:r.height,styles,parents:[...function*(el){for(let p=el.parentElement;p;p=p.parentElement)yield selector(p);}(selected)].slice(0,6),url:location.href});
  },true);
  window.addEventListener('message',e=>{
    if(e.source!==parent||e.data?.source!=='ais-simulation-host')return;
    const {type,payload}=e.data;
    if(type==='inspect'){inspecting=!!payload.active;document.documentElement.style.cursor=inspecting?'crosshair':'';}
    if(type==='selection'){try{selected=document.querySelector(payload.selector);highlight();}catch{}}
    if(type==='css'){let s=document.getElementById('ais-simulation-css');if(!s){s=document.createElement('style');s.id='ais-simulation-css';document.head.append(s);}s.textContent=payload.css;}
  });
  window.addEventListener('scroll',highlight,true);window.addEventListener('resize',highlight);
  // Android WebViews expose these browser services too; keep native controls intact.
  window.addEventListener('error',e=>emit('error',{message:e.message,url:e.filename}));
  window.addEventListener('unhandledrejection',e=>emit('error',{message:String(e.reason?.message||e.reason)}));
  document.addEventListener('playing',e=>{if(e.target instanceof HTMLMediaElement)emit('media',{state:'playing',src:e.target.currentSrc});},true);
  document.addEventListener('error',e=>{if(e.target instanceof HTMLMediaElement)emit('media',{state:'error',src:e.target.currentSrc,code:e.target.error?.code});},true);
  emit('ready',{url:location.href});
  // Explicit app metadata is stable across host resizing; never infer from the
  // current iframe viewport, which would feed its own dimensions back to Studio.
  const declared=document.querySelector('meta[name="studio-screen"]')?.content;
  if(declared){const match=declared.match(/^(\d+)x(\d+)(?:\s+(phone|tablet|tv|desktop))?$/i);if(match)emit('screen-profile',{width:Number(match[1]),height:Number(match[2]),kind:match[3]?.toLowerCase()==='phone'?'smartphone':match[3]?.toLowerCase()||'custom'});}
})();
