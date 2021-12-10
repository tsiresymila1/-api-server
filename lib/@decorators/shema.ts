import CryptoJS from 'crypto-js';
import swagger from 'swagger-schema-official';

interface JSONSchema {
    jsonschema: {
        type: string,
        properties: [],
        required: string[]
    }
}
type PropOptions = swagger.BaseFormatContrainedParameter & swagger.BaseSchema

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

const defaultValue = { required: true, type: 'string', in: 'formData' } as PropOptions;

export const prop = (options: PropOptions = defaultValue) => {
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
            ...options,
            name: propertyName,
            description: propertyName,
            default: propertyName,
            schema: {
                type: "string"
            }
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

export const check = (conditional: (value: any, length: number) => boolean, message: string, options: { defaultlength: number, key: string } = { defaultlength: 0, key: '' }) => {
    return (length: number = options.defaultlength, option?: { message?: string }) => {
        return (target: any, propertyKey: PropertyKey) => {
            const propertyname = String(propertyKey)
            const key = '_' + Date.now() + '_' + options.key + '_valid_' + propertyname;
            Object.defineProperty(target, propertyname, {
                get: () => {
                    return target[key];
                },
                set: (newVal) => {
                    let reflect = Reflect.getMetadata('class:error', target)
                    if (!reflect) {
                        reflect = {}
                    }
                    if (!conditional(newVal, length)) {
                        reflect[propertyname] = option?.message ?? message
                    }
                    else {
                        if (Object.keys(reflect).includes(propertyname)) {
                            delete reflect[propertyname];
                        }
                    }
                    Reflect.defineMetadata('class:error', reflect, target)
                    target[key] = newVal;
                },
                enumerable: true,
                configurable: true
            });
        }
    }
}

export const isemail = check((newVal) => {
    var pattern = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
    return pattern.test(newVal)
}, 'Email not valid', { defaultlength: 10, key: 'isemail' })

export const notzero = check((newval) => {
    return newval != null && newval != undefined && parseInt(newval ?? '0', 10) != 0
}, 'Not zero value', { defaultlength: 10, key: 'notzero' })

export const notnull = check((newval) => {
    return newval != null && newval != undefined
}, 'Not null', { defaultlength: 10, key: 'notnull' })

export const maxlength = check((newval, length) => {
    return newval && (newval).length <= length
}, 'Max length not respected', { defaultlength: 10, key: 'maxlength' })

export const minlength = check((newval, length) => {
    return newval && (newval).length >= length
}, 'Min length not respected', { defaultlength: 10, key: 'minlength' })

export const ispositive = check((newval) => {
    return newval && parseInt(newval ?? 0, 0) >= 0
}, 'Min length not respected', { defaultlength: 10, key: 'ispositive' })

export const isnegative = check((newval) => {
    return newval && parseInt(newval ?? 0, 0) < 0
}, 'Min length not respected', { defaultlength: 10, key: 'isnegative' })

type algoType = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'
type callback = (key: any) => string
export const hash = (algo: algoType | callback = 'MD5') => {
    return (target: any, propertyKey: PropertyKey) => {
        const key = '_hash_' + String(propertyKey)
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return target[key];
            },
            set: (newVal) => {
                if (typeof algo === 'string') {
                    switch (algo) {
                        case 'MD5':
                            target[key] = CryptoJS.SHA256(newVal).toString();
                            break;
                        case 'SHA1':
                            target[key] = CryptoJS.SHA1(newVal).toString();
                            break;
                        case 'SHA256':
                            target[key] = CryptoJS.SHA256(newVal).toString();
                            break;
                        case 'SHA512':
                            target[key] = CryptoJS.SHA512(newVal).toString();
                            break;
                        default:
                            target[key] = CryptoJS.SHA256(newVal).toString();
                            break;
                    }
                }
                else if (typeof algo === "function") {
                    target[key] = algo(newVal) ?? newVal
                }
                else {
                    target[key] = newVal
                }
            },
            enumerable: true,
            configurable: true
        });
    }
}

