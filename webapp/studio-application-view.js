(() => {
 'use strict';
 if(window.__AIS_APPLICATION_VIEW_BRIDGE__)return;
 window.__AIS_APPLICATION_VIEW_BRIDGE__=true;
 // Radio's two surfaces use their original handlers; never replay votes or playback.
 let pending=null,last=null;
 const surface=()=>document.body?.classList.contains('music-mode')?'music':document.body?.classList.contains('radio-mode')?'radio':null;
 function update(){
   if(pending&&surface()!==pending){const button=document.getElementById(pending==='music'?'radioMusicOpen':'musicRadioOpen');if(typeof button?.onclick==='function'){const mode=pending;pending=null;button.onclick.call(button,new MouseEvent('click'));if(surface()!==mode)pending=mode;}}
   const mode=surface();if(mode&&mode!==last){last=mode;parent.postMessage({source:'ais-application-view',type:'surface',payload:{mode}},'*');}
 }
 addEventListener('message',event=>{if(event.source!==parent||event.data?.source!=='ais-application-view-host')return;const mode=event.data.payload?.mode;if(!['radio','music'].includes(mode))return;pending=mode;update();});
 new MutationObserver(update).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 parent.postMessage({source:'ais-application-view',type:'ready'},'*');update();
})();
