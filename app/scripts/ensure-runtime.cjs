const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const appRoot=path.resolve(__dirname,'..'),root=path.join(appRoot,'runtime');
const expected='e63f213ec8fb2acb736bbad8aba99f80f9b2d0e69c987c66e566353dac40a6d2';
(async()=>{
 if(fs.existsSync(path.join(root,'java/bin/java.exe'))&&fs.existsSync(path.join(root,'sdk/build-tools/35.0.0/lib/apksigner.jar')))return;
 if(process.platform!=='win32')throw Error('Le runtime APK fourni cible Windows x64.');
 console.log('Téléchargement du runtime APK autonome…');
 const response=await fetch('https://github.com/Wokgui/Interface-Studio/releases/download/v6.81.0/Runtime-APK-Windows-x64.zip',{signal:AbortSignal.timeout(180000)});if(!response.ok)throw Error('Runtime indisponible : HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Empreinte du runtime incorrecte.');
 const archive=path.join(appRoot,'.runtime-cache.zip');fs.writeFileSync(archive,bytes);
 const quote=s=>"'"+s.replaceAll("'","''")+"'";
 execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+quote(archive)+' -DestinationPath '+quote(appRoot)+' -Force'],{windowsHide:true,stdio:'inherit'});
 if(!fs.existsSync(path.join(root,'java/bin/java.exe')))throw Error('Runtime incomplet.');
 console.log('Runtime APK prêt.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
