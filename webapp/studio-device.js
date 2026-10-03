(() => {
 'use strict';
 // Device dimensions belong to this application viewport, not the Windows monitor.
 for(const [key,get] of Object.entries({width:()=>innerWidth,height:()=>innerHeight,availWidth:()=>innerWidth,availHeight:()=>innerHeight}))try{Object.defineProperty(screen,key,{configurable:true,get});}catch{}
 const orientation=screen.orientation;
 if(orientation){try{Object.defineProperty(orientation,'type',{configurable:true,get:()=>innerHeight>=innerWidth?'portrait-primary':'landscape-primary'});Object.defineProperty(orientation,'angle',{configurable:true,get:()=>innerHeight>=innerWidth?0:90});}catch{}
 let previous=orientation.type;addEventListener('resize',()=>{const next=orientation.type;if(next!==previous){previous=next;orientation.dispatchEvent(new Event('change'));dispatchEvent(new Event('orientationchange'));}});}
 window.__AIS_DEVICE_VIEWPORT__=true;
})();
