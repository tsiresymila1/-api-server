import { NextFunction, Request, Response } from 'express';
import { Edge } from 'edge.js';
export declare const edge: Edge;
export declare const setupEdgeJsBundle: (p: string, s: string) => void;
export declare const edgeEngine: (req: Request, res: Response, next: NextFunction) => void;
