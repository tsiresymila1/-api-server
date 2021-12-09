
import { ValidType } from "./../@types";

export class Validator {
    public static validate(data: any): ValidType {
        if (data['easy-ts-api:errors']) {
            return {
                isValid: false,
                messages: data['easy-ts-api:errors']
            } as unknown as ValidType
        }
        else {
            return {
                isValid: true,
                messages: undefined
            } as unknown as ValidType
        }
    }
}