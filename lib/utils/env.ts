require('dotenv').config();
export class ENV {
     public static  Get(params:any) :any{
         return process.env[params];
     }
}