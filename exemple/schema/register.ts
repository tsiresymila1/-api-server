
import { Schema, prop } from './../../lib/';
import { hash, isemail, maxlength, minlength } from './../../lib';

@Schema()
export class RegisterInput {
    @maxlength(20)
    @prop()
    name: string

    @isemail()
    @prop()
    email: string

    @hash()
    @minlength(8)
    @prop()
    password: string
}