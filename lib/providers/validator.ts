
import { ValidType } from "./../@types";

export class Validator {
    public static check(data: any): ValidType {
        if (data && data['easy-ts-api:errors']) {
            return {
                isValid: false,
                messages: data['easy-ts-api:errors']
            } as ValidType
        }
        else {
            return {
                isValid: true,
                messages: undefined
            } as ValidType
        }
    }
}