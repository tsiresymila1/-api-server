declare type PropOptions = {
    required?: boolean;
    type?: any;
};
export declare const Schema: () => (target: Function) => any;
export declare const prop: (options?: PropOptions) => (target: any, propertyKey: PropertyKey) => void;
export declare const ref: (ref: Object) => (target: any, propertyKey: PropertyKey) => void;
export declare function use(target: Function): {
    type: string;
    properties: [];
    required: string[];
};
export declare const check: (condition: (value: any, length: number) => boolean, message: string, options?: {
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
export declare const hash: () => (target: any, propertyKey: PropertyKey) => void;
export {};
