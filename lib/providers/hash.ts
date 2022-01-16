import JWT, { Algorithm } from 'jsonwebtoken';
import { ENV } from "./../utils/env";

export class Hash {
    static  defaultkey : string = "super_key"
    public static generate(id: any, expiresInexp: any = '24h') {
        return JWT.sign({ 
            data : {
                id: id
            }, 
            expiresInexp: expiresInexp
        }, 
            ENV.Get('KEY') ?? Hash.defaultkey,
        )
    }

    public static auth(token:string) : any | boolean {
        try {
            return JWT.verify(token, ENV.Get('KEY') ?? Hash.defaultkey);
          } catch(err) {
            return false;
          }
    }
}

