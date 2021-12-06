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