
import { Schema, prop } from './../../lib/';

@Schema()
export class RegisterInput {
    @prop()
    name: string

    @prop()
    email: string
}