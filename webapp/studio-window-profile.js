/* APK policy shared by the editor and the running simulation. Values are CSS pixels. */
(() => {
  'use strict';
  window.StudioWindowProfile = {
    resolve(policy, size, navigation) {
      const d = policy?.defaults;
      if (!d || policy.schema !== 1) return null;
      if (!['smartphone', 'tablet'].includes(size.kind)) return {top:0,right:0,bottom:0,left:0};
      const finite = (value, fallback) => Number.isFinite(Number(value)) ? Math.min(200,Math.max(0,Number(value))) : fallback;
      const nav = navigation === 'gesture' ? finite(d.gestureInset,24) : finite(d.threeButtonInset,48);
      const right = navigation !== 'gesture' && d.landscapeNavigation === 'right-on-phone' && size.width > size.height && Math.min(size.width,size.height) < 600;
      return {top:finite(d.topInset,24),right:right?nav:0,bottom:right?0:nav,left:0};
    }
  };
})();
