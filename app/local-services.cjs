/* Explicit local equivalent of the web API used by Radio intelligente. */
const {app}=require('electron'),path=require('path');
const handler=require(path.join(app.isPackaged?path.join(process.resourcesPath,'webapp'):path.resolve(__dirname,'../webapp'),'api/youtube-search.js'));
module.exports=async function localServices(req,res,url){
  if(url.pathname!=='/api/youtube-search')return false;
  req.query=Object.fromEntries(url.searchParams);
  res.status=n=>{res.statusCode=n;return res;};
  res.json=value=>{res.setHeader('content-type','application/json');res.end(JSON.stringify(value));return res;};
  res.redirect=(status,target)=>{if(typeof status==='string'){target=status;status=302;}res.statusCode=status;res.setHeader('location',target);res.end();};
  try{await handler(req,res);}catch(error){res.status(502).json({error:error.message});}
  return true;
};
