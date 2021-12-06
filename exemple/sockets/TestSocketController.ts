
import { ConnectedSocket, MessageBody, OnConnect, SocketController, OnEvent, OnDisconnect, EmitOnFail, EmitOnSuccess, SocketId, SocketAuth, SocketHeaders, SocketQueryParam } from "../../lib";

@SocketController()
export default class TestSocketController {

    @OnConnect()
    public async connection(@ConnectedSocket() socket, @SocketId() id: string) {
        console.log('user connected : ', id)
        console.log(socket.id)
    }


    @OnDisconnect()
    public async disconnection(@ConnectedSocket() socket) {
        console.log('user disconnected')
        console.log(socket.id)
    }

    @EmitOnFail('error')
    @EmitOnSuccess('message')
    @OnEvent('message')
    public async message(@ConnectedSocket() socket, @MessageBody() data: any, @SocketAuth() auth, @SocketHeaders() Headers, @SocketQueryParam() query) {
        console.log(auth, Headers, query);
        return data;
    }
}

