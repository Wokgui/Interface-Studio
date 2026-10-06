const assert=require('node:assert/strict');
const {compare}=require('../../webapp/studio-visual-compare.js');
const a=new Uint8ClampedArray([10,20,30,255,100,100,100,255]);
const b=new Uint8ClampedArray([12,21,31,255,180,100,100,255]);
let r=compare(a,b,{channelThreshold:10,allowedMismatch:.6});
assert.equal(r.comparedPixels,2);assert.equal(r.mismatchPixels,1);assert.equal(r.pass,true);assert(r.diff instanceof Uint8ClampedArray);
r=compare(a,b,{channelThreshold:10,allowedMismatch:.1});assert.equal(r.pass,false);
assert.throws(()=>compare(new Uint8ClampedArray(4),new Uint8ClampedArray(8)));
console.log('Visual compare: tolerance, mismatch ratio and diff mask are deterministic.');