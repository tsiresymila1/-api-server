import { TwingEnvironment, TwingLoaderFilesystem } from 'twing';
import { NextFunction, Request, Response } from 'express';
export declare const loader: TwingLoaderFilesystem;
export declare const twig: TwingEnvironment;
export declare const setupTwigJsBundle: (p: string) => void;
export declare const twigEngine: (req: Request, res: Response, next: NextFunction) => void;
