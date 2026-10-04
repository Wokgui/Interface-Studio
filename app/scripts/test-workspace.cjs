const { _electron:electron }=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const output=path.resolve(__dirname,'../../test-results');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const app=await electron.launch({executablePath:process.env.AIS_TEST_EXE||require('electron'),args:[...(process.env.AIS_TEST_EXE?[]:[path.resolve(__dirname,'..')]),'--disable-gpu','--remote-debugging-port=9227'],env:{...process.env,AIS_WORKSPACE_TEST:'1'},timeout:60000});
 const report={layouts:[],errors:[],media:null};
 try{
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].showInactive());
 const page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.stack));
  await page.waitForFunction(()=>window.StudioHost&&window.StudioWorkspace);
  const source=await page.evaluate(file=>window.AppInterfaceStudio.testSource(file),process.env.AIS_TEST_APK||null);assert(source.ok);report.source=source.source;report.version=await page.evaluate(()=>window.AppInterfaceStudio.appInfo());
  await page.evaluate(s=>window.StudioHost.loadSource(s),source.source);
  await page.waitForFunction(()=>document.getElementById('studioSimulationFrame').contentWindow.__AIS_SIMULATION__);
  const sim=page.frame({name:'aisSimulation'});assert(sim);
  assert.equal(await sim.locator('#veLauncher').count(),0,'Simulation must not contain the editing interceptor');
  for(const [width,height] of [[2048,900],[1520,1000],[1100,720]]){
   await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size[0],size[1]),[width,height]);
   for(const ids of [['editor','simulation'],['editor','simulation','chat'],['editor','chat'],['simulation','chat']]){
    await page.evaluate(ids=>{for(const el of document.querySelectorAll('[data-pane]')){el.checked=ids.includes(el.dataset.pane);}document.querySelector('[data-pane]').dispatchEvent(new Event('change'));},ids);
    await page.waitForTimeout(300);
    const dimensions=await page.evaluate(ids=>({main:(()=>{const r=document.querySelector('body>main').getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};})(),panes:ids.map(id=>{const r=document.getElementById('studioPane-'+id).getBoundingClientRect();return {id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}),screen:(()=>{const r=document.querySelector('.studio-simulation-screen').getBoundingClientRect(),a=document.querySelector('.studio-simulation-area').getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,area:{x:a.x,y:a.y,right:a.right,bottom:a.bottom}};})()}),ids);
    const panes=dimensions.panes;assert(panes.every(p=>Math.abs(p.y-panes[0].y)<1));assert(panes.every(p=>Math.abs(p.width-panes[0].width)<2));
    assert(panes.every(p=>p.right<=dimensions.main.right+1&&p.width>0));
    assert(Math.abs(panes.reduce((s,p)=>s+p.width,0)+8*(panes.length-1)-(dimensions.main.width-16))<3);
    if(ids.includes('simulation')){const s=dimensions.screen;assert(s.x>=s.area.x&&s.right<=s.area.right&&s.y>=s.area.y&&s.bottom<=s.area.bottom,'phone fits in its pane');}
    report.layouts.push({viewport:[width,height],ids,dimensions});
    await page.screenshot({path:path.join(output,`panes-${width}-${ids.join('-')}.png`)});
   }
  }
  await page.evaluate(()=>window.StudioWorkspace.setMode('split'));
  const divider=page.locator('.studio-splitter').first();await divider.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);
  let sizes=await page.locator('.studio-pane:not([hidden])').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().width));assert(Math.abs(sizes[0]-sizes[1])>10);report.keyboardResize=sizes;
  const box=await divider.boundingBox();await page.mouse.move(box.x+4,box.y+50);await page.mouse.down();await page.mouse.move(box.x+65,box.y+50,{steps:5});await page.mouse.up();await page.waitForTimeout(200);
  sizes=await page.locator('.studio-pane:not([hidden])').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().width));report.pointerResize=sizes;assert(Math.abs(sizes[0]-report.keyboardResize[0])>20);
  await page.locator('.studio-panel-menu > summary').click();
  await page.locator('#studioEqualWidths').click();
  await page.evaluate(()=>window.StudioWorkspace.setMode('simulation'));
  report.initialTitle=await sim.locator('#title').textContent();
  await sim.locator('#play').click();
  await sim.waitForFunction(()=>{const a=document.getElementById('audio');return a&&!a.paused&&a.currentTime>0.2;},{},{timeout:120000});
  report.media=await sim.locator('#audio').evaluate(a=>({src:a.currentSrc,currentTime:a.currentTime,duration:a.duration,paused:a.paused,readyState:a.readyState,title:document.getElementById('title').textContent}));
  assert(report.media.readyState>=2&&report.media.duration>0);
  assert.equal(report.media.title,report.initialTitle,'Play starts the displayed track rather than selecting a different one');
  await sim.locator('#play').click();assert(await sim.locator('#audio').evaluate(a=>a.paused));report.pause=true;
  await sim.locator('#play').click();await sim.waitForFunction(()=>!document.getElementById('audio').paused);report.resume=true;
  await sim.locator('#audio').evaluate(a=>a.currentTime=5);assert(await sim.locator('#audio').evaluate(a=>a.currentTime>=4.9));report.seek=true;
  await sim.locator('#play').click();
  await page.locator('#studioSelectElement').click();await sim.locator('#play').click();
  await page.waitForFunction(()=>window.StudioWorkspace.getSelection()?.selector==='#play');
  assert(await sim.locator('#audio').evaluate(a=>a.paused),'Selection must not start audio');
  report.selection=await page.evaluate(()=>window.StudioWorkspace.getSelection());
  const edit=page.frames().find(f=>f!==sim&&f.url().includes('visual-editor=1')&&!f.url().includes('visual-editor.html'));
  assert(edit,'Original application is loaded in the editor');
  await edit.waitForFunction(()=>window.RadioVisualEditor?.state().selector==='#play');
  await edit.evaluate(()=>window.RadioVisualEditor.setVisualStyle('color','#123456'));
  await sim.waitForFunction(()=>getComputedStyle(document.getElementById('play')).color==='rgb(18, 52, 86)');
  report.liveCssSync=true;
  await edit.evaluate(()=>window.RadioVisualEditor.undo());
  await page.locator('#studioSelectElement').click();await sim.locator('#play').click();await sim.waitForFunction(()=>!document.getElementById('audio').paused);report.interactionAfterSelection=true;
  await sim.locator('#play').click();
  const buttons=await sim.locator('button').evaluateAll(els=>els.map(e=>({id:e.id,text:e.textContent.trim()})));report.buttons=buttons;
  await sim.getByRole('button',{name:'Ouvrir les réglages',exact:true}).click();
  await sim.waitForFunction(()=>document.body.classList.contains('settings-open'));
  report.settingsNavigation=true;
  await sim.locator('#settingsBack').click();
  await sim.waitForFunction(()=>!document.body.classList.contains('settings-open'));
  const before=await sim.evaluate(()=>JSON.parse(localStorage.getItem('radio_hugo_master_v1')||'{}').kept?.length||0);
  await sim.locator('#yes').click();
  await sim.waitForFunction(n=>(JSON.parse(localStorage.getItem('radio_hugo_master_v1')||'{}').kept?.length||0)===n+1,before);
  report.keepTrack=true;
  await sim.waitForFunction(()=>!document.getElementById('play').disabled,{},{timeout:120000});
  await sim.locator('#back').click();
  await sim.waitForFunction(n=>(JSON.parse(localStorage.getItem('radio_hugo_master_v1')||'{}').kept?.length||0)===n,before);
  report.undo=true;
  await page.evaluate(()=>{for(const e of document.querySelectorAll('[data-pane]'))e.checked=true;document.querySelector('[data-pane]').dispatchEvent(new Event('change'));});
  await page.waitForTimeout(300);
  const site=await page.locator('#studioChatSite').boundingBox();
  report.chatView=await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];return w.contentView.children.map(v=>({bounds:v.getBounds(),url:v.webContents?.getURL()}));});
  assert(report.chatView.some(v=>v.url?.startsWith('https://chatgpt.com')&&Math.abs(v.bounds.width-site.width)<2&&Math.abs(v.bounds.x-site.x)<2),'Native ChatGPT view follows the pane');
  await page.locator('#studioChatSettings').click();
  report.chatSettingsView=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].contentView.children.length);
  assert.equal(report.chatSettingsView,0,'ChatGPT view detaches while its settings are visible');
  assert(await page.locator('.studio-chat-settings').isVisible());
  await page.locator('#studioChatSettings').click();
  await page.waitForTimeout(300);
  report.selectionSynced=await page.locator('#studioChatSelection').textContent();assert(report.selectionSynced.includes('#play'));
  report.testMatrix=await page.evaluate(s=>window.AppInterfaceStudio.runTestMatrix({source:s,css:''}),source.source);report.testMatrix.results.forEach(x=>delete x.screenshot);
  const sf=page.frame({name:'aisSimulation'});await sf.locator('#play').click();await sf.waitForFunction(()=>!document.getElementById('audio').paused);
  await page.screenshot({path:path.join(output,'simulation-playing.png')});
  await sf.locator('#play').click();
  // Capture the actual native web view separately and composite its real pixels.
  const native=await app.evaluate(async({BrowserWindow})=>{const v=BrowserWindow.getAllWindows()[0].contentView.children.find(v=>v.webContents?.getURL().startsWith('https://chatgpt.com'));return v?{bounds:v.getBounds(),png:(await v.webContents.capturePage()).toPNG().toString('base64')}:null;});
  if(native){const sharp=require('sharp');const base=await sharp(path.join(output,'simulation-playing.png')).metadata();const scale=base.width/(await page.evaluate(()=>innerWidth));await sharp(path.join(output,'simulation-playing.png')).composite([{input:await sharp(Buffer.from(native.png,'base64')).resize(Math.round(native.bounds.width*scale),Math.round(native.bounds.height*scale)).toBuffer(),left:Math.round(native.bounds.x*scale),top:Math.round(native.bounds.y*scale)}]).toFile(path.join(output,'three-panes-native-chat.png'));}
  assert.equal(report.errors.length,0,'No uncaught renderer errors');
  fs.writeFileSync(path.join(output,'workspace.json'),JSON.stringify(report,null,2));if(process.env.AIS_TEST_HOLD_MS)await page.waitForTimeout(Number(process.env.AIS_TEST_HOLD_MS));console.log(JSON.stringify({layouts:report.layouts.length,media:report.media,errors:report.errors,selectionSynced:report.selectionSynced,settingsNavigation:report.settingsNavigation,keepTrack:report.keepTrack,undo:report.undo,success:true}));
 }catch(e){report.failure=e.message;const page=await app.firstWindow();report.simulationState=await page.frame({name:'aisSimulation'})?.evaluate(()=>({status:document.getElementById('status')?.textContent,title:document.getElementById('title')?.textContent,src:document.getElementById('audio')?.src})).catch(()=>null);fs.writeFileSync(path.join(output,'workspace.json'),JSON.stringify(report,null,2));await page.screenshot({path:path.join(output,'failure.png')});throw e;}
 finally{await app.evaluate(({app})=>app.exit(0)).catch(()=>{});}
})().catch(e=>{console.error(e);process.exitCode=1;});
