'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const yauzl=require('yauzl');
const BASE='https://dl.google.com/android/repository/';
const decode=s=>s.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0]==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
function packages(xml,base){
 const licenses=new Map([...xml.matchAll(/<license\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/license>/g)].map(m=>[m[1],decode(m[2])]));
 const result=[];
 for(const m of xml.matchAll(/<remotePackage\b[^>]*path="([^"]+)"[^>]*>([\s\S]*?)<\/remotePackage>/g)){
  const body=m[2];if(/<obsolete\b/.test(body)||(/<channelRef/.test(body)&&!/<channelRef\s+ref="channel-0"/.test(body)))continue;
  for(const a of body.matchAll(/<archive>([\s\S]*?)<\/archive>/g)){
   const archive=a[1],host=archive.match(/<host-os>([^<]+)<\/host-os>/)?.[1];if(host&&host!=='windows')continue;
   const url=archive.match(/<url>([^<]+)<\/url>/)?.[1],sum=archive.match(/<checksum\s+type="(sha1|sha256)">([a-f0-9]+)<\/checksum>/i),size=Number(archive.match(/<size>(\d+)<\/size>/)?.[1]);
   if(!url||!sum||!Number.isSafeInteger(size)||size<=0||size>5*1024**3)continue;
   const resolved=new URL(decode(url),base);if(resolved.origin!=='https://dl.google.com'||!resolved.pathname.startsWith('/android/repository/'))throw Error('Adresse Android non officielle.');
   const revision=body.match(/<revision>([\s\S]*?)<\/revision>/)?.[1]||'';
   const licenseId=body.match(/<uses-license\s+ref="([^"]+)"/)?.[1];
   result.push({id:m[1],url:resolved.href,size,hash:sum[2].toLowerCase(),hashType:sum[1].toLowerCase(),licenseId,license:licenses.get(licenseId)||'',revision:['major','minor','micro'].map(k=>Number(revision.match(new RegExp('<'+k+'>(\\d+)</'+k+'>'))?.[1]||0))});
  }
 }
 return result;
}
async function catalogue(url){const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('Catalogue Android indisponible : HTTP '+r.status);return packages(await r.text(),url);}
async function plan({tv=false,minApi=26,installedSdk=''}){
 const [tools,images]=await Promise.all([catalogue(BASE+'repository2-3.xml'),catalogue(BASE+'sys-img/'+(tv?'android-tv':'google_apis')+'/sys-img2-3.xml')]);
 const emulator=tools.filter(p=>p.id==='emulator').sort((a,b)=>b.revision[0]-a.revision[0]||b.revision[1]-a.revision[1]||b.revision[2]-a.revision[2])[0];
 const eligible=images.filter(p=>{const bits=p.id.split(';');return Number(bits[1]?.replace('android-',''))>=Math.max(tv?30:35,Number(minApi))&&/^(x86|x86_64)$/.test(bits[3])});
 eligible.sort((a,b)=>Number(a.id.split(';')[1].replace('android-',''))-Number(b.id.split(';')[1].replace('android-',''))||(a.id.endsWith('x86_64')?-1:1));
 const image=eligible[0];if(!emulator||!image)throw Error('Aucune image Android Windows compatible dans le catalogue officiel.');
 const required=[...(!fs.existsSync(path.join(installedSdk,'emulator','emulator.exe'))?[emulator]:[]),...(!fs.existsSync(path.join(installedSdk,...image.id.split(';'),'system.img'))?[image]:[])];
 return {tv,minApi,packages:required,image:image.id,downloadBytes:required.reduce((s,p)=>s+p.size,0)};
}
async function checksum(file,algorithm){const hash=crypto.createHash(algorithm);for await(const chunk of fs.createReadStream(file))hash.update(chunk);return hash.digest('hex');}
async function download(p,file,notify){
 if(fs.existsSync(file)&&fs.statSync(file).size===p.size&&await checksum(file,p.hashType)===p.hash)return;
 const response=await fetch(p.url,{signal:AbortSignal.timeout(30*60*1000)});if(!response.ok)throw Error('Téléchargement Android : HTTP '+response.status);
 const handle=await fs.promises.open(file,'w');let received=0,last=0;
 try{for await(const chunk of response.body){received+=chunk.length;if(received>p.size)throw Error('Archive Android plus grande que prévu.');await handle.write(chunk);if(Date.now()-last>400){last=Date.now();notify({stage:'download',package:p.id,received,total:p.size});}}}finally{await handle.close();}
 if(received!==p.size||await checksum(file,p.hashType)!==p.hash)throw Error('Archive Android incomplète ou empreinte incorrecte. Réessayer le téléchargement.');
}
function extract(file,destination,{maxBytes=10*1024**3,maxEntries=100000}={}){let bytes=0,entries=0;return new Promise((resolve,reject)=>yauzl.open(file,{lazyEntries:true},(err,zip)=>{
 if(err)return reject(err);zip.on('error',reject);zip.on('end',resolve);zip.on('entry',entry=>{
  bytes+=entry.uncompressedSize;entries++;if(bytes>maxBytes||entries>maxEntries){zip.close();return reject(Error('Archive trop volumineuse.'));}const name=entry.fileName.replace(/\\/g,'/');if(name.startsWith('/')||name.split('/').some(part=>part==='..'||part.includes(':'))||((entry.externalFileAttributes>>>16)&0xf000)===0xa000){zip.close();return reject(Error('Chemin non autorisé dans l’archive.'));}
  const target=path.resolve(destination,name);if(!target.startsWith(path.resolve(destination)+path.sep)){zip.close();return reject(Error('Archive Android invalide.'));}
  if(name.endsWith('/')){fs.mkdirSync(target,{recursive:true});zip.readEntry();return;}
  fs.mkdirSync(path.dirname(target),{recursive:true});zip.openReadStream(entry,(error,stream)=>{if(error){zip.close();return reject(error);}const output=fs.createWriteStream(target);stream.on('error',reject);output.on('error',reject);output.on('close',()=>zip.readEntry());stream.pipe(output);});
 });zip.readEntry();
}));}
async function install({plan:p,sdk,baseSdk,acceptedLicenses,notify=()=>{}}){
 if(acceptedLicenses!==true&&p.packages.some(pkg=>pkg.license))throw Error('Accepter les licences Android affichées avant le téléchargement.');
 fs.mkdirSync(sdk,{recursive:true});for(const name of ['platform-tools','build-tools']){const from=path.join(baseSdk,name),to=path.join(sdk,name);if(fs.existsSync(from)&&!fs.existsSync(to))fs.cpSync(from,to,{recursive:true});}
 const cache=path.join(sdk,'.studio-downloads');fs.mkdirSync(cache,{recursive:true});
 for(const pkg of p.packages){const file=path.join(cache,pkg.hash+'.zip');await download(pkg,file,notify);notify({stage:'extract',package:pkg.id});const destination=pkg.id==='emulator'?sdk:path.join(sdk,...pkg.id.split(';').slice(0,-1));fs.mkdirSync(destination,{recursive:true});const staging=fs.mkdtempSync(path.join(cache,'extract-'));try{await extract(file,staging);const folder=pkg.id==='emulator'?'emulator':pkg.id.split(';').at(-1),from=path.join(staging,folder),to=path.join(destination,folder);if(!fs.existsSync(from)||!fs.statSync(from).isDirectory())throw Error('Structure Android incorrecte.');if(fs.existsSync(to))throw Error('Ce composant Android existe déjà. Relancer la vérification.');fs.renameSync(from,to);}finally{fs.rmSync(staging,{recursive:true,force:true});}if(pkg.licenseId&&pkg.license&&/^[a-zA-Z0-9_-]+$/.test(pkg.licenseId)){const dir=path.join(sdk,'licenses');fs.mkdirSync(dir,{recursive:true});fs.appendFileSync(path.join(dir,pkg.licenseId),'\n'+crypto.createHash('sha1').update(pkg.license).digest('hex')+'\n');}}
 notify({stage:'ready'});return {sdk};
}
module.exports={packages,plan,install,extract,checksum};
