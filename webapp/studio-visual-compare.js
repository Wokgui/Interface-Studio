(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.StudioVisualCompare=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function compare(reference,candidate,options={}){
  if(!reference||!candidate||reference.length!==candidate.length||reference.length%4)throw Error('Images RGBA incompatibles.');
  const threshold=Number.isFinite(options.channelThreshold)?Math.max(0,Math.min(255,options.channelThreshold)):28;
  const allowedMismatch=Number.isFinite(options.allowedMismatch)?Math.max(0,Math.min(1,options.allowedMismatch)):0.02;
  let mismatchPixels=0,sum=0,maxDifference=0,comparedPixels=0;
  const diff=options.diff===false?null:new Uint8ClampedArray(reference.length);
  for(let i=0;i<reference.length;i+=4){
   if(reference[i+3]===0&&candidate[i+3]===0)continue;
   const dr=Math.abs(reference[i]-candidate[i]),dg=Math.abs(reference[i+1]-candidate[i+1]),db=Math.abs(reference[i+2]-candidate[i+2]);
   const d=Math.max(dr,dg,db);sum+=(dr+dg+db)/3;maxDifference=Math.max(maxDifference,d);comparedPixels++;
   const mismatch=d>threshold;if(mismatch)mismatchPixels++;
   if(diff){const lum=Math.round((candidate[i]+candidate[i+1]+candidate[i+2])/3);diff[i]=mismatch?255:lum;diff[i+1]=mismatch?0:lum;diff[i+2]=mismatch?0:lum;diff[i+3]=mismatch?235:70;}
  }
  const mismatchRatio=comparedPixels?mismatchPixels/comparedPixels:0,meanAbsolute=comparedPixels?sum/comparedPixels:0;
  return {mismatchPixels,comparedPixels,mismatchRatio,meanAbsolute,maxDifference,threshold,allowedMismatch,pass:mismatchRatio<=allowedMismatch,diff};
 }
 return {compare};
});