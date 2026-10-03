const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','dist','runtime','vendor','.git','build'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(js|cjs)$/.test(f))execFileSync(process.execPath,['--check',f],{stdio:'pipe'});else if(e.name.endsWith('.html')){const html=fs.readFileSync(f,'utf8');for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=|application\/ld\+json|application\/json/.test(m[1]))continue;execFileSync(process.execPath,['--check'],{input:m[2],stdio:['pipe','pipe','pipe']});}}}}
walk(path.join(root,'app'));walk(path.join(root,'webapp'));
console.log('All application modules and inline scripts parse successfully.');
