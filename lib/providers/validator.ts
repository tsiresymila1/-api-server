
import { ValidType } from "./../@types";

export class Validator {
    public static check(data: any): ValidType {
        if (data) {
            const properties: { [key: string]: [value: string] } = {}
            let content = Reflect.getMetadata("class:schema", data)
            let error = Reflect.getMetadata('class:error', data)
            for (let c of Object.keys(content['properties']) ?? []) {
                properties[`${String(c)}`] = data[c]
            }
            if (error && Object.keys(error).length > 0) {
                return {
                    isValid: false,
                    data: properties,
                    messages: error
                } as ValidType
            }
            else {
                return {
                    isValid: true,
                    data: properties,
                    messages: undefined
                } as ValidType
            }
        }
        else {
            return {
                isValid: true,
                data: {},
                messages: undefined
            } as ValidType
        }
    }
}