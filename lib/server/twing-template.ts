import {TwingEnvironment, TwingFunction, TwingLoaderFilesystem} from 'twing';
import path from 'path'
import fs from 'fs';
import { NextFunction,Request,Response } from 'express';

export const loader = new TwingLoaderFilesystem();
export const twig = new TwingEnvironment(loader);

export const setupTwigJsBundle = (p: string, s: string) => {
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
  let jsBundle = new TwingFunction('jsBundle', async ()=>{
    return `<script defer src="${s}/${jsScript}"></script>`
  },[], {
    is_safe: ['html']
  });
  let cssBundle = new TwingFunction('cssBundle', async ()=>{ 
    return cssStyle.reduce((c,n)=>{
      return (new String()).concat(c,`<link rel="stylesheet" type="text/css" href="${s}/${n}"></link>`)
    },'')

  },[], {
    is_safe: ['html']
  });
  twig.addFunction(jsBundle);
  twig.addFunction(cssBundle);
}

export const twigEngine = (req: Request, res: Response, next :NextFunction) => {

    const render = res.render;
  
    res.render = function (view: string, options?: object | undefined, callback?: ((err: Error, html: string) => void) | undefined) {
      const self = this;
      self.locals = options as Record<string,any>;
      const extension = '.html.twig'
      render.call(self,view.replace(/\./gi, '/').concat(extension),callback);
    };

    req.app.set('renderer',twig);
  
    req.app.engine('twig', async (filePath, options, callback) => {
      loader.addPath(req.app.settings.views)
      const filepath = filePath.replace(req.app.settings.views, '');
      try{
        const content = await twig.render(filepath, options);
        return callback(null, content)
      }
      catch(e: any){
        return callback(e)
      }
    });
    req.app.set('view engine', 'twig');
    next();
};
