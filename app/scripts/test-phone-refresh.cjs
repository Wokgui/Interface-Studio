const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
async function scenario(failInstall){
 const calls=[],messages=[],source={apkProject:{package:'app.radiointelligente'},github:{repository:'Wokgui/Radio-intelligente'}};
 const select={value:'USB123',options:[],replaceChildren(){this.options=[];},append(o){this.options.push(o);}};
 const button={disabled:false},message={set textContent(value){messages.push(value);}},canvas={hidden:true,width:1080,height:1920,dataset:{},style:{},getContext:()=>({drawImage(){}})};
 const stage={clientWidth:500,clientHeight:800};
 const elements={'[data-phone-device]':select,'[data-phone-refresh]':button,'[data-phone-connect]':{},'[data-phone-stop]':{},'[data-phone-zoom]':{value:'fit'},canvas,'.studio-phone-stage':stage,'.studio-phone-status':message};
 const root={querySelector:s=>elements[s],querySelectorAll:()=>[],insertAdjacentHTML(){}};
 const window={StudioWorkspace:{getSource:()=>source},StudioHost:{loadSource:async()=>calls.push('loadSource')},AppInterfaceStudio:{onAndroidVideo(){},refreshProject:async()=>({ok:true,source,unchanged:false}),androidCommand:async action=>{calls.push(action);if(action==='status')return {ok:true,devices:['USB123']};if(action==='update-source'&&failInstall)return {ok:false,error:'INSTALL_FAILED_UPDATE_INCOMPATIBLE'};if(action==='frame')return {ok:true,url:'data:image/png;base64,AA==',width:1080,height:1920};return {ok:true};}}};
 const context={window,document:{createElement:()=>({}),head:{append(){}}},ResizeObserver:class{observe(){}},createImageBitmap:async()=>({close(){}}),fetch:async()=>({blob:async()=>({})}),setTimeout:()=>1,clearTimeout(){},Uint8Array};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../webapp/studio-phone.js'),'utf8'),context);
 window.StudioPhone.mount(root);await window.StudioPhone.refresh();
 assert.equal(button.disabled,false);assert.equal(canvas.hidden,false);assert.equal(window.StudioPhone.getState().active,true);
 assert(calls.indexOf('loadSource')<calls.indexOf('update-source'));
 if(failInstall){assert(messages.at(-1).includes('INSTALL_FAILED_UPDATE_INCOMPATIBLE'));assert(calls.indexOf('frame')>calls.indexOf('update-source'));}
 else assert.equal(messages.at(-1),'Éditeur et téléphone actualisés avec la même version.');
}
(async()=>{await scenario(false);await scenario(true);console.log('Phone refresh: latest editor loaded, install attempted, stream restored on success and signature failure.');})().catch(e=>{console.error(e);process.exitCode=1;});
