const {_electron:electron}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const out=process.env.AIS_NATIVE_TEST_OUT?path.resolve(process.env.AIS_NATIVE_TEST_OUT):path.resolve(__dirname,'../../test-results/native-dock');fs.mkdirSync(out,{recursive:true});
(async()=>{
 if(!process.env.AIS_ANDROID_TEST_SDK||!process.env.AIS_ANDROID_TEST_APK)throw Error('AIS_ANDROID_TEST_SDK and AIS_ANDROID_TEST_APK required');
 const photos=[];for(const [name,color]of [['rouge','#cc3856'],['turquoise','#249c9e']]){const file=path.join(out,'photo-test-'+name+'.png');await sharp(Buffer.from('<svg width="960" height="540"><rect width="960" height="540" fill="'+color+'"/><circle cx="480" cy="270" r="140" fill="#ffffff"/><text x="480" y="285" text-anchor="middle" font-family="sans-serif" font-size="36" fill="'+color+'">Photo de test '+name+'</text></svg>')).png().toFile(file);photos.push(file);}
 const app=await electron.launch({executablePath:process.env.AIS_TEST_EXE||require('electron'),args:[...(process.env.AIS_TEST_EXE?[]:[path.resolve(__dirname,'..')]),'--disable-gpu','--remote-debugging-port=9237'],env:{...process.env,AIS_WORKSPACE_TEST:'1',AIS_TEST_USER_DATA:path.join(out,'profile-'+Date.now()),ANDROID_SDK_ROOT:process.env.AIS_ANDROID_TEST_SDK},timeout:60000});
 const report={errors:[],realAndroid:false};let page;
 try{
  await app.evaluate(({BrowserWindow,dialog},files)=>{BrowserWindow.getAllWindows()[0].showInactive();dialog.showOpenDialog=async options=>{if(options.title.includes('photos de test'))return {canceled:false,filePaths:files};return {canceled:true,filePaths:[]};};},photos);
  page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.message));await page.waitForFunction(()=>window.StudioNativeSimulation&&window.StudioHost);
  const imported=await page.evaluate(file=>window.AppInterfaceStudio.testSource(file),process.env.AIS_ANDROID_TEST_APK);assert(imported.ok,JSON.stringify(imported));report.import={type:imported.source.type,profile:imported.source.nativePreviewProfile};
  await page.evaluate(s=>window.StudioHost.loadSource(s),imported.source);await page.evaluate(()=>window.StudioWorkspace.setMode('split'));
  await page.waitForFunction(()=>document.getElementById('studioAndroidPreparation')?.open,{},{timeout:120000});const message=await page.locator('#studioNativeStatus').innerText();assert(!message.includes('Build-Tools'));console.log(JSON.stringify({success:true,automaticPreparation:true,imported:imported.ok,buildToolsFallback:true,status:message}));await page.screenshot({path:path.join(out,'automatic-preparation.png')});
}finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
