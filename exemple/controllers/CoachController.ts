
import { Get, OpenApi,Controller } from "../../lib"
@Controller({ prefix: '/api/coach' })
export default class CoachController {
    public name: String
    constructor(){
        this.name = 'Hello'
    }

    @OpenApi({
        responses: {
            '200': {
                'description': 'Response',
            }
        }
    })
    @Get('/login')
    public async login() {
        return {
            name: this.name,
        }
    }
}
