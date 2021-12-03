require('dotenv').config();
export default class ENV {
     public static  Get(params:any) :any{
         return process.env[params];
     }
}