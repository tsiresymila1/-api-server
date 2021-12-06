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
export {};
