import JWT, { Algorithm } from 'jsonwebtoken';
import { ENV } from "./../utils/env";

export class Hash {
    public static generate(id: any, expiresInexp: any = '24h') {
        return JWT.sign({ 
            data : {
                id: id
            }, 
            expiresInexp: expiresInexp
        }, 
            ENV.Get('KEY') ?? 'super_key',
        )
    }

    public static auth(token:string) : boolean {
        try {
            JWT.verify(token, ENV.Get('KEY') ?? 'super_key');
            return true
          } catch(err) {
            return false;
          }
    }
}

