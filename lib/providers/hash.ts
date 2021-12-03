import JWT from 'jsonwebtoken';
import  ENV  from "./../utils/env";

export class Hash {
    public static  generate(user : any, ) {
        return JWT.sign({ 
            data : {
                id : user.id
            }, 
            expiresInexp: '24h'
        }, 
        ENV.Get('KEY'),
        { 
            algorithm: 'RS256'
        }
        )
    }

    public static auth(token:string) : boolean {
        try {
            var decoded = JWT.verify(token, ENV.Get('KEY'));
            return true
          } catch(err) {
            return false;
          }
    }
}