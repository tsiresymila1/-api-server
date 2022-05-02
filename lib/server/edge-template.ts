import { NextFunction,Request,Response } from 'express';
import { Edge } from 'edge.js'
import fs from 'fs';
import path from 'path';

export const edge = new Edge({ cache: false })
export const setupEdgeJsBundle = (p: string, s: string) => {
  const fileManifest = path.join(p, 'manifest.json');
  let jsScript = '';
  let cssStyle : string[] = [];
  if(fs.existsSync(fileManifest)){
    const manifestContent = fs.readFileSync(fileManifest).toString()
    const manifestJson = JSON.parse(manifestContent);
    const keys = Object.keys(manifestJson)
    if(keys.length > 0){
      const key = keys[0]
      jsScript = manifestJson[key]['file']
      cssStyle = manifestJson[key]['css']
    }
    
  }

  edge.global('jsBundle', function(){
    return `<script defer src="${s}/${jsScript}"></script>`
  });

  edge.global('cssBundle', function(){
    return cssStyle.reduce((c,n)=>{
      return (new String()).concat(c,`<link rel="stylesheet" type="text/css" href="${s}/${n}"></link>`)
    },'')
  });
}

export const edgeEngine = (req: Request, res: Response, next :NextFunction) => {

  const render = res.render;

  res.render = function (view: string, options?: object | undefined, callback?: ((err: Error, html: string) => void) | undefined) {
    const self = this;
    self.locals = options as Record<string,any>;
    render.call(self,view.replace(/\./gi, '/'),callback);
  };
  
  req.app.set('renderer',edge);

  req.app.engine('edge', async (filePath, options, callback) => {
    edge.mount(req.app.settings.views)
    try{
      const content = await edge.render(filePath, options);
      return callback(null, content)
    }
    catch(e: any){
      return callback(e)
    }
  });

  req.app.set('view engine', 'edge');
  next();
};

