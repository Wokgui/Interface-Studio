const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {repositoryFor,latestApk}=require('../studio-github.cjs');
(async()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'studio-refresh-')),saved=global.fetch;try{
 assert.equal(repositoryFor({apkProject:{package:'app.radiointelligente'}}),'Wokgui/Radio-intelligente');
 assert.throws(()=>repositoryFor({}),/GitHub/);
 const bytes=Buffer.from('APK fixture'),asset={id:42,name:'app.apk',size:bytes.length,digest:'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex'),browser_download_url:'https://github.com/Wokgui/Radio-intelligente/releases/download/test/app.apk'};
 let downloads=0;global.fetch=async url=>String(url).includes('api.github.com')?{ok:true,json:async()=>({tag_name:'test',assets:[asset]})}:{ok:true,body:(async function*(){downloads++;yield bytes;})()};
 const first=await latestApk('Wokgui/Radio-intelligente',root);assert.equal(first.assetId,42);assert.deepEqual(fs.readFileSync(first.file),bytes);
 await latestApk('Wokgui/Radio-intelligente',root);assert.equal(downloads,1,'unchanged release uses verified cache');
 fs.writeFileSync(first.file,'corrupt');await assert.rejects(latestApk('Wokgui/Radio-intelligente',root),/Empreinte/);
 fs.unlinkSync(first.file);asset.digest='sha256:'+'0'.repeat(64);await assert.rejects(latestApk('Wokgui/Radio-intelligente',root),/Empreinte/);assert.equal(fs.readdirSync(root).length,0,'failed download leaves no APK');
 asset.browser_download_url='https://example.com/app.apk';await assert.rejects(latestApk('Wokgui/Radio-intelligente',root),/Adresse/);
 global.fetch=async()=>({ok:false,status:404});await assert.rejects(latestApk('Wokgui/Radio-intelligente',root),/compilation/);
 console.log('Project refresh tests passed: repository, download, cache, integrity, cleanup, unavailable release.');
 }finally{global.fetch=saved;fs.rmSync(root,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
