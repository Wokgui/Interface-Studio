const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const button={disabled:false},select={value:'',options:[],replaceChildren(){this.options=[]}},message={textContent:''};let loaded=0,requested=0;
 const source={apkProject:{package:'app.radiointelligente'}};
 const window={AppInterfaceStudio:{onAndroidVideo(){},async androidCommand(){return {ok:false,error:'SDK indisponible'}},async refreshProject(){requested++;return {ok:true,source}}},StudioWorkspace:{getSource:()=>source},StudioHost:{async loadSource(){loaded++}}};
 const script=fs.readFileSync(require('node:path').join(__dirname,'../../webapp/studio-phone.js'),'utf8').replace('window.StudioPhone={','window.setTestRoot=(r,m)=>{root=r;message=m;};window.StudioPhone={');
 vm.runInNewContext(script,{window,console,setTimeout,clearTimeout});window.setTestRoot({querySelector:s=>s==='[data-phone-refresh]'?button:select},message);
 await window.StudioPhone.refresh();assert.equal(requested,1);assert.equal(loaded,1);assert.equal(button.disabled,false);assert.match(message.textContent,/Éditeur actualisé.*SDK indisponible/);
 console.log('Refresh passes with unavailable Android SDK: editor updated, device error shown, button restored.');
})().catch(e=>{console.error(e);process.exitCode=1});
