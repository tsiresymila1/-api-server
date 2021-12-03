import * as swagger from "swagger-schema-official";
export declare const Middleware: (middleware: Function) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const OpenApi: (options?: swagger.Operation | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const Get: (url: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const Post: (url: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const Put: (url: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const All: (url: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
