const assert=require('node:assert/strict');
const {metrics,hierarchyInsets}=require('../phone-source.cjs');

const scale=420/160;
const profile=metrics(
  'Physical size: 1080x2340\nOverride size: 1080x2340',
  'Physical density: 420\nOverride density: 420',
  ''
);
assert.equal(profile.width,412);
assert.equal(profile.height,892);

const direct=hierarchyInsets(
  '<hierarchy><node class="android.widget.FrameLayout" bounds="[0,0][1080,2340]"><node class="android.webkit.WebView" bounds="[0,84][1080,2220]"/></node></hierarchy>',
  1080,2340,scale
);
assert(direct);
assert.equal(direct.topInset,32);
assert.equal(direct.bottomInset,46);
assert.equal(direct.leftInset,0);
assert.equal(direct.rightInset,0);
assert.equal(direct.viewportWidth,411);
assert.equal(direct.viewportHeight,814);
assert.equal(direct.geometrySource,'uiautomator-webview');

const edgeToEdge=hierarchyInsets(
  '<hierarchy><node class="android.webkit.WebView" bounds="[0,0][1080,2340]"/></hierarchy>',
  1080,2340,scale
);
assert(edgeToEdge);
assert.equal(edgeToEdge.topInset,0);
assert.equal(edgeToEdge.bottomInset,0);
assert.equal(edgeToEdge.viewportHeight,891);

const none=hierarchyInsets(
  '<hierarchy><node class="android.widget.FrameLayout" bounds="[0,0][1080,2340]"/></hierarchy>',
  1080,2340,scale
);
assert.equal(none,null);

console.log('Phone geometry: actual WebView bounds are converted to CSS viewport dimensions.');
