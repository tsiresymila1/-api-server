import { NextFunction,Request,Response } from 'express';
import { Edge } from 'edge.js'

export const edge = new Edge({ cache: false })
export const setupEdgeJsBundle = (p: string) => {
  edge.global('jsBundle', function(file: string){
    return `<script defer src="${p}/${file}"></script>`
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

