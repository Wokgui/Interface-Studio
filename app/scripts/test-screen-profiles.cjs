const {_electron:electron}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const out=path.resolve(__dirname,'../../test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end('<!doctype html><meta name="studio-screen" content="1920x1080 tv"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;font:24px system-ui}main{display:grid;grid-template-columns:repeat(3,1fr);height:100%;background:#dcf1ef}@media(max-width:700px){main{grid-template-columns:1fr}}button{font:inherit}</style><main><section>Photos</section><button id="next">Suivant</button><section id="state">0</section></main><script>let n=0;next.onclick=()=>state.textContent=++n;</script>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const app=await electron.launch({executablePath:process.env.AIS_TEST_EXE||require('electron'),args:process.env.AIS_TEST_EXE?['--disable-gpu']: [path.resolve(__dirname,'..'),'--disable-gpu'],env:{...process.env,AIS_WORKSPACE_TEST:'1'},timeout:60000});
 const report={cases:[],errors:[],checks:{}};
 try{
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].showInactive());
  const page=await app.firstWindow();page.on('pageerror',e=>{report.errors.push(e.message);console.error(e.stack)});await page.waitForFunction(()=>window.StudioHost&&window.StudioWorkspace);
  const source={type:'url',url:'http://127.0.0.1:'+server.address().port+'/',label:'Screen runtime fixture'};
  await page.evaluate(s=>window.StudioHost.loadSource(s),source);await page.waitForFunction(()=>window.StudioWorkspace.getScreenProfile().width===1920);
  report.checks.explicitMetadata=true;
  await page.evaluate(()=>window.StudioWorkspace.setMode('split'));
  const sim=page.frame({name:'aisSimulation'});await sim.locator('#next').click();assert.equal(await sim.locator('#state').textContent(),'1');report.checks.realInteraction=true;
  for(const windowSize of [[1520,1000],[1100,720]]){
   await app.evaluate(({BrowserWindow},s)=>BrowserWindow.getAllWindows()[0].setContentSize(...s),windowSize);
   for(const panes of [['editor','simulation'],['editor','simulation','chat']]){
    await page.evaluate(ids=>{for(const e of document.querySelectorAll('[data-pane]'))e.checked=ids.includes(e.dataset.pane);document.querySelector('[data-pane]').dispatchEvent(new Event('change'));},panes);
    for(const profile of ['compact','phone390','phone','phone430','fold','tablet','tv','desktop','responsive']){
     await page.selectOption('#studioScreenProfile',profile);await page.waitForTimeout(90);
     const m=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};return {profile:window.StudioWorkspace.getScreenProfile(),panes:[...document.querySelectorAll('.studio-pane:not([hidden])')].map(rect),screen:rect(document.querySelector('.studio-simulation-screen')),area:rect(document.querySelector('.studio-simulation-area')),editor:rect(document.querySelector('.device')),workspace:rect(document.querySelector('.workspace')),viewport:{width:document.getElementById('studioSimulationFrame').contentWindow.innerWidth,height:document.getElementById('studioSimulationFrame').contentWindow.innerHeight}};});
     assert(m.panes.every(p=>Math.abs(p.y-m.panes[0].y)<1));const s=m.screen,a=m.area,e=m.editor,w=m.workspace;assert(s.x>=a.x-1&&s.y>=a.y-1&&s.right<=a.right+1&&s.bottom<=a.bottom+1,'Simulation fits '+profile);assert(e.x>=w.x-1&&e.y>=w.y-1&&e.right<=w.right+1&&e.bottom<=w.bottom+1,'Editor fits '+profile);
     if(profile!=='responsive'){assert.equal(m.viewport.width,m.profile.width);assert.equal(m.viewport.height,m.profile.height);assert(Math.abs(s.width/s.height-m.profile.width/m.profile.height)<.01);}
     report.cases.push({windowSize,panes,profile,viewport:m.viewport});
     if(windowSize[0]===1520&&panes.length===2&&['tv','phone390'].includes(profile))await page.screenshot({path:path.join(out,'screen-'+profile+'.png')});
    }
   }
  }
  assert.equal(await sim.locator('#state').textContent(),'1');report.checks.runtimePreserved=true;
  await page.evaluate(()=>{const preset=document.getElementById('devicePreset');preset.value='1366x768';preset.dispatchEvent(new Event('change',{bubbles:true}));});await sim.waitForFunction(()=>innerWidth===1366&&innerHeight===768);report.checks.existingDeviceControls=true;
  await page.evaluate(()=>window.StudioWorkspace.useScreenProfile({width:411,height:914,topInset:28,bottomInset:48}));await sim.waitForFunction(()=>innerWidth===411&&innerHeight===914);report.checks.measuredPhoneGeometry=true;
  await page.selectOption('#studioScreenProfile','phone390');await page.locator('#studioRotateScreen').click();await sim.waitForFunction(()=>innerWidth===844&&innerHeight===390);report.checks.rotate=true;
  await page.selectOption('#studioScreenProfile','custom');await page.fill('#studioScreenW','393');await page.fill('#studioScreenH','873');await page.click('#studioApplyScreen');await sim.waitForFunction(()=>innerWidth===393&&innerHeight===873);report.checks.custom=true;
  for(const [width,height] of [[3840,2160],[3440,1440],[8192,8192]]){await page.fill('#studioScreenW',String(width));await page.fill('#studioScreenH',String(height));await page.click('#studioApplyScreen');await sim.waitForFunction(s=>innerWidth===s[0]&&innerHeight===s[1],[width,height]);assert(await page.evaluate(()=>{const s=document.querySelector('.studio-simulation-screen').getBoundingClientRect(),a=document.querySelector('.studio-simulation-area').getBoundingClientRect(),e=document.querySelector('.device').getBoundingClientRect(),w=document.querySelector('.workspace').getBoundingClientRect();return s.right<=a.right+1&&s.bottom<=a.bottom+1&&e.right<=w.right+1&&e.bottom<=w.bottom+1;}));}report.checks.largeAndUltrawideScreens=true;
  await page.fill('#studioScreenW','393');await page.fill('#studioScreenH','873');await page.click('#studioApplyScreen');
  await page.evaluate(s=>window.StudioHost.loadSource(s),source);await page.waitForFunction(()=>window.StudioWorkspace.getScreenProfile().width===393);report.checks.rememberPerApplication=true;
  await page.evaluate(s=>window.StudioHost.loadSource({...s,url:s.url+'?other=1'}),source);await page.waitForFunction(()=>window.StudioWorkspace.getScreenProfile().width===1920);report.checks.noProfileLeak=true;
  await page.selectOption('#studioScreenProfile','responsive');await sim.waitForFunction(()=>innerWidth<=700);assert.equal(await sim.locator('main').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);report.checks.responsiveReflow=true;
  if(process.env.AIS_TEST_PHOTO_TV){const imported=await page.evaluate(file=>window.AppInterfaceStudio.testSource(file),process.env.AIS_TEST_PHOTO_TV);assert(imported.ok);assert(imported.source.nativePreviewProfile);await page.evaluate(s=>window.StudioHost.loadSource(s),imported.source);await page.waitForTimeout(300);const p=await page.evaluate(()=>window.StudioWorkspace.getScreenProfile());assert(p.width>p.height);assert(Math.abs(p.width/p.height-16/9)<.03);assert((await sim.locator('body').textContent()).includes('Android natif'));report.checks.nativePhotoTV={profile:p,executionRequiresAndroid:true};await page.screenshot({path:path.join(out,'photo-tv-screen-profile.png')});}
  assert.equal(report.errors.length,0);report.success=true;fs.writeFileSync(path.join(out,'screen-profiles.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases.length,checks:report.checks,success:true}));
 }catch(e){report.failure=e.message;const page=await app.firstWindow();report.state=await page.evaluate(()=>({profile:window.StudioWorkspace.getScreenProfile(),viewport:[document.getElementById('studioSimulationFrame').contentWindow.innerWidth,document.getElementById('studioSimulationFrame').contentWindow.innerHeight],preset:document.getElementById('devicePreset').value}));fs.writeFileSync(path.join(out,'screen-profiles.json'),JSON.stringify(report,null,2));await page.screenshot({path:path.join(out,'screen-profiles-failure.png')});throw e;}
 finally{await app.evaluate(({app})=>app.exit(0)).catch(()=>{});server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
