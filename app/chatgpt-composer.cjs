'use strict';
// This function runs inside the isolated ChatGPT page. It changes only the local composer layout.
function composerLayout(position) {
 const key='interface-studio-composer-lift-v1';
 if(Number.isFinite(position))localStorage.setItem(key,String(Math.max(0,Math.min(60,position))));
 if(window.__studioComposerLayout){window.__studioComposerLayout.apply();return;}
 let saved=null,drag=null;
 const lift=()=>Math.max(0,Math.min(60,Number(localStorage.getItem(key))||0));
 function findComposer(){
  if(!window.document)return null;
  const input=document.querySelector('#prompt-textarea')||[...document.querySelectorAll('textarea,[contenteditable="true"][role="textbox"]')].find(e=>e.getBoundingClientRect().height>0);
  if(!input)return null;const form=input.closest('form,[data-type="unified-composer"]');if(form)return form;
  for(let el=input.parentElement;el&&el!==document.body;el=el.parentElement){if(el.querySelectorAll('button').length>=2&&el.getBoundingClientRect().height<420)return el;}return null;
 }
 function apply(){
  const form=findComposer();if(!form)return;
  if(saved?.form!==form)saved={form,position:form.style.position,left:form.style.left,right:form.style.right,bottom:form.style.bottom,width:form.style.width,zIndex:form.style.zIndex,maxHeight:form.style.maxHeight};
  const amount=Math.min(lift(),Math.max(0,(innerHeight-Math.min(form.getBoundingClientRect().height,innerHeight*.6)-64)/innerHeight*100));if(amount){Object.assign(form.style,{position:'fixed',left:'16px',right:'16px',bottom:amount+'vh',width:'auto',zIndex:'50',maxHeight:'60vh'});}else for(const k of ['position','left','right','bottom','width','zIndex','maxHeight'])form.style[k]=saved[k];
  if(!form.querySelector('[data-studio-composer-handle]')){
   const handle=document.createElement('button');handle.type='button';handle.dataset.studioComposerHandle='true';handle.textContent='⋮⋮ Déplacer la saisie';handle.setAttribute('aria-label','Déplacer verticalement le champ de saisie');handle.style.cssText='display:block;margin:0 auto 6px;padding:3px 12px;cursor:ns-resize;touch-action:none;font:12px system-ui;border:1px solid #ded5ea;border-radius:12px;background:#f8f6fc;color:#665775';form.prepend(handle);
   handle.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag={id:e.pointerId,y:e.clientY,start:lift()};handle.setPointerCapture(e.pointerId)});
   handle.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();localStorage.setItem(key,String(Math.max(0,Math.min(60,drag.start+(drag.y-e.clientY)/innerHeight*100))));apply()});
   const end=()=>{drag=null};handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
  }
 }
 window.__studioComposerLayout={apply};new MutationObserver(()=>{if(!findComposer()?.querySelector('[data-studio-composer-handle]'))apply()}).observe(document.documentElement,{childList:true,subtree:true});apply();
}
module.exports={composerLayout};
