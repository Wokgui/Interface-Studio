function register({ipcMain,WebContentsView,shell,getWindow}){
 const {BrowserWindow}=require('electron');let view=null,owner=null,floating=null,lastBounds=null;
 function detach(){if(view&&owner&&!owner.isDestroyed())owner.contentView.removeChildView(view);owner=null;}
 function attach(w){if(owner===w)return;detach();w.contentView.addChildView(view);owner=w;}
 function floatingBounds(){if(floating&&!floating.isDestroyed()&&view&&owner===floating){const [width,height]=floating.getContentSize();view.setBounds({x:0,y:0,width,height});}}
 function float(){if(!view)return;if(!floating||floating.isDestroyed()){floating=new BrowserWindow({width:850,height:900,title:'ChatGPT · Interface Studio',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});floating.on('resize',floatingBounds);floating.on('minimize',()=>getWindow()?.webContents.send('chatgpt:web-status',{minimized:true}));floating.on('close',e=>{e.preventDefault();floating.hide();getWindow()?.webContents.send('chatgpt:web-status',{minimized:true});});}attach(floating);floatingBounds();floating.show();if(floating.isMinimized())floating.restore();}
 ipcMain.handle('chatgpt:view',async(e,p={})=>{
  const w=getWindow();if(e.sender!==w?.webContents||e.senderFrame!==e.sender.mainFrame)return {ok:false,error:'Origine refusée.'};
  if(p.action==='external'){await shell.openExternal('https://chatgpt.com/');return {ok:true}}
  if(p.action==='close'){detach();floating?.hide();return {ok:true}}
  if(p.action==='float'){float();return {ok:true}}
  if(p.action==='minimize'){if(owner===floating)floating.minimize();else detach();return {ok:true}}
  if(!['open','bounds'].includes(p.action))return {ok:false,error:'Commande inconnue.'};
  if(!view){view=new WebContentsView({webPreferences:{partition:'persist:studio-chatgpt',contextIsolation:true,nodeIntegration:false,sandbox:true}});view.webContents.on('did-finish-load',()=>view?.webContents.insertCSS('#prompt-textarea{min-height:clamp(120px,20vh,260px)!important;max-height:45vh!important;overflow-y:auto!important}').catch(()=>{}));view.webContents.session.setPermissionRequestHandler((_w,_p,callback)=>callback(false));view.webContents.setWindowOpenHandler(({url})=>url.startsWith('https://')?{action:'allow',overrideBrowserWindowOptions:{webPreferences:{partition:'persist:studio-chatgpt',contextIsolation:true,nodeIntegration:false,sandbox:true}}}:{action:'deny'});view.webContents.loadURL('https://chatgpt.com/').catch(error=>w.webContents.send('chatgpt:web-status',{error:'ChatGPT ne se charge pas dans le panneau. '+error.message}));w.once('closed',()=>{detach();floating?.removeAllListeners('close');floating?.destroy();floating=null;view?.webContents.close();view=null;});}
  const [width,height]=w.getContentSize(),b=p.bounds||lastBounds||{},x=Math.max(0,Math.min(width-1,Math.round(b.x||0))),y=Math.max(0,Math.min(height-1,Math.round(b.y||0)));lastBounds=b;
  if(p.action==='bounds'&&owner===floating)return {ok:true};
  floating?.hide();attach(w);view.setBounds({x,y,width:Math.max(1,Math.min(width-x,Math.round(b.width||500))),height:Math.max(1,Math.min(height-y,Math.round(b.height||400)))});
  view.webContents.setZoomFactor(Math.max(.8,Math.min(1,Number(b.width||500)/480)));
  return {ok:true};
 });return {detach};
}
module.exports={register};
