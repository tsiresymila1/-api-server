
import { ValidType } from "./../@types";

export class Validator {
    public static check(data: any): ValidType {
        if (data) {
            const properties: { [key: string]: [value: string] } = {}
            let content = Reflect.getMetadata("class:schema", data)
            for (let c of Object.keys(content['properties']) ?? []) {
                properties[`${String(c)}`] = data[c]
            }
            if (data['easy-ts-api:errors']) {
                return {
                    isValid: false,
                    data: properties,
                    messages: data['easy-ts-api:errors']
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