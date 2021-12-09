import swagger from 'swagger-schema-official';
declare type PropOptions = swagger.BaseFormatContrainedParameter & swagger.BaseSchema;
export declare const Schema: () => (target: Function) => any;
export declare const prop: (options?: PropOptions) => (target: any, propertyKey: PropertyKey) => void;
export declare const ref: (ref: Object) => (target: any, propertyKey: PropertyKey) => void;
export declare function use(target: Function): {
    type: string;
    properties: [];
    required: string[];
};
export declare const check: (conditional: (value: any, length: number) => boolean, message: string, options?: {
    defaultlength: number;
    key: string;
}) => (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const isemail: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const notzero: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const notnull: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const maxlength: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const minlength: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const ispositive: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
export declare const isnegative: (length?: number, option?: {
    message?: string | undefined;
} | undefined) => (target: any, propertyKey: PropertyKey) => void;
declare type algoType = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';
declare type callback = (key: any) => string;
export declare const hash: (algo?: algoType | callback) => (target: any, propertyKey: PropertyKey) => void;
export {};
