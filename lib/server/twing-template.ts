import {TwingEnvironment, TwingFunction, TwingLoaderFilesystem} from 'twing';

import { NextFunction,Request,Response } from 'express';

export const loader = new TwingLoaderFilesystem();
export const twig = new TwingEnvironment(loader);

export const setupTwigJsBundle = (p: string) => {
  let jsBundle = new TwingFunction('jsBundle', async (_file)=>{
    return `<script defer src="${p}/${_file}"></script>`
  },[], {
    is_safe: ['html']
  });
  twig.addFunction(jsBundle);
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
