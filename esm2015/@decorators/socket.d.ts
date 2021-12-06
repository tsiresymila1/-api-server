export declare const OnMessage: (event?: string | undefined) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const OnConnection: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare const MessageBody: (key?: string | undefined) => (target: any, propertyKey: string, parameterIndex: number) => any;
export declare const ConnectedSocket: (key?: string | undefined) => (target: any, propertyKey: string, parameterIndex: number) => any;
export declare const Clients: (key?: string | undefined) => (target: any, propertyKey: string, parameterIndex: number) => any;
export declare const ConnectedId: (key?: string | undefined) => (target: any, propertyKey: string, parameterIndex: number) => any;
export declare const ConnectedIds: (key?: string | undefined) => (target: any, propertyKey: string, parameterIndex: number) => any;
