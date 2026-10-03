const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const version=require('../package.json').version;
const exe=path.resolve(__dirname,'../dist/App-Interface-Studio-'+version+'-portable-x64.exe');
const profile=path.resolve(__dirname,'../../test-results/Profil portable autonome');fs.mkdirSync(profile,{recursive:true});
(async()=>{
 const env={...process.env,AIS_WORKSPACE_TEST:'1',PATH:path.join(process.env.SystemRoot,'System32')};for(const k of ['JAVA_HOME','JDK_HOME','ANDROID_HOME','ANDROID_SDK_ROOT'])delete env[k];
 const child=spawn(exe,['--remote-debugging-port=9231','--user-data-dir='+profile],{env,windowsHide:true,stdio:'ignore'});
 let browser;
 try{
  for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:9231/json/version')).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
  browser=await chromium.connectOverCDP('http://127.0.0.1:9231');
  const page=browser.contexts()[0].pages().find(p=>p.url().includes('visual-editor.html'));assert(page);
  await page.waitForFunction(()=>window.StudioHost&&window.StudioWorkspace);
  const report={info:await page.evaluate(()=>window.AppInterfaceStudio.appInfo()),tools:await page.evaluate(()=>window.AppInterfaceStudio.apkCommand('status'))};
  assert(report.info.packaged&&report.info.version===version);assert(report.tools.ok&&report.tools.java&&report.tools.sdk);
  const source=await page.evaluate(()=>window.AppInterfaceStudio.testSource());assert(source.ok);
  await page.evaluate(s=>window.StudioHost.loadSource(s),source.source);
  await page.evaluate(()=>{for(const e of document.querySelectorAll('[data-pane]'))e.checked=true;document.querySelector('[data-pane]').dispatchEvent(new Event('change'));});
  report.panes=await page.locator('.studio-pane:not([hidden])').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));assert.equal(report.panes.length,3);assert(report.panes.every(r=>r.y===report.panes[0].y&&r.width>0));
  const sim=page.frame({name:'aisSimulation'});await sim.waitForFunction(()=>window.__AIS_SIMULATION__);
  await page.evaluate(()=>window.StudioWorkspace.setMode('simulation'));
  await sim.locator('#play').click();await sim.waitForFunction(()=>!document.getElementById('audio').paused&&document.getElementById('audio').currentTime>.2,{},{timeout:120000});
  report.audio=await sim.locator('#audio').evaluate(a=>({title:document.getElementById('title').textContent,paused:a.paused,currentTime:a.currentTime,duration:a.duration,readyState:a.readyState}));assert.equal(report.audio.title,'Vainglory');
  await sim.locator('#play').click();report.success=true;report.noSystemJavaOrAndroidSdk=true;
  fs.writeFileSync(path.resolve(__dirname,'../../test-results/portable.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  await page.evaluate(()=>window.close());
 }finally{await browser?.close().catch(()=>{});child.kill();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
