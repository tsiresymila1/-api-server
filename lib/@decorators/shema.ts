import CryptoJS from 'crypto-js';

interface JSONSchema {
    jsonschema: {
        type: string,
        properties: [],
        required: string[]
    }
}
type PropOptions = { required?: boolean, type?: any }

export const Schema = () => {
    return (target: Function) => {
        const isExist: boolean = target.prototype.hasOwnProperty('jsonschema');

        if (!isExist) {
            Object.defineProperty(target.prototype, 'jsonschema', {
                value: {
                    type: "Object",
                    properties: {},
                    required: []
                }
            })
        }
        Reflect.defineMetadata('class:schema', target.prototype['jsonschema'], target)
        return target as any;
    }

}

const optionsValue = { required: true, type: 'string' } as PropOptions;
export const prop = (options: PropOptions = optionsValue) => {
    return (target: any, propertyKey: PropertyKey) => {
        var t = Reflect.getMetadata("design:type", target, propertyKey.toString());
        const propertyName = `${String(propertyKey)}`
        const isExist: boolean = target.hasOwnProperty('jsonschema');
        if (!isExist) {
            Object.defineProperty(target, 'jsonschema', {
                value: {
                    type: "object",
                    properties: {},
                    required: []
                }
            })
        }
        if (options.required) {
            target['jsonschema'].required.push(propertyName)
        }
        target['jsonschema'].properties[propertyName] = {
            type: String(t.name).toLowerCase()
        }
        Reflect.defineMetadata('class:schema', target['jsonschema'], target)
    }
}

export const ref = (ref: Object) => {
    return (target: any, propertyKey: PropertyKey) => {
        const propertyName = `${String(propertyKey)}`
        const isExist: boolean = target.hasOwnProperty('jsonschema');
        if (!isExist) {
            Object.defineProperty(target, 'jsonschema', {
                value: {
                    type: "object",
                    properties: {},
                    required: []
                }
            })
        }
        target['jsonschema'].properties[propertyName] = use(ref.constructor)
        Reflect.defineMetadata('class:schema', target['jsonschema'], target)
    }
}


export function use(target: Function) {
    const c = target.prototype as JSONSchema
    return c.jsonschema;
}


// validators 

export const check = (condition: (value: any, length: number) => boolean, message: string, options: { defaultlength: number, key: string } = { defaultlength: 0, key: '' }) => {
    return (length: number = options.defaultlength, option?: { message?: string }) => {
        return (target: any, propertyKey: PropertyKey) => {
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return target[options.key + '_' + String(propertyKey)];
                },
                set: (newVal) => {
                    if (condition(newVal, length)) {
                        if (!target.hasOwnProperty('easy-ts-api:errors')) {
                            Object.defineProperty(target, 'easy-ts-api:errors', {
                                value: {}
                            })
                        }
                        target['easy-ts-api:errors'][propertyKey] = option?.message ?? message
                    }
                    target[options.key + '_' + String(propertyKey)] = newVal;
                },
                enumerable: true,
                configurable: true
            });
        }
    }
}

export const isemail = check((newVal) => {
    var pattern = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
    return !pattern.test(newVal)
}, 'Email not valid')

export const notzero = check((newval) => {
    return newval != null && newval != undefined && parseInt(newval ?? '0', 10) != 0
}, 'Not null value')

export const maxlength = check((newval, length) => {
    return newval && (newval).length > length
}, 'Max length not respected', { defaultlength: 10, key: 'maxlength' })

export const minlength = check((newval, length) => {
    return newval && (newval).length < length
}, 'Min length not respected', { defaultlength: 10, key: 'minlength' })

export const ispositive = check((newval) => {
    return newval && parseInt(newval ?? 0, 0) > 0
}, 'Min length not respected', { defaultlength: 10, key: 'ispositive' })

export const isnegative = check((newval) => {
    return newval && parseInt(newval ?? 0, 0) < 0
}, 'Min length not respected', { defaultlength: 10, key: 'isnegative' })

export const hash = () => {
    return (target: any, propertyKey: PropertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return target['_' + String(propertyKey)];
            },
            set: (newVal) => {
                target['_' + String(propertyKey)] = CryptoJS.SHA256(newVal).toString();
            },
            enumerable: true,
            configurable: true
        });
    }
}

