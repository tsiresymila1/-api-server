
import { ConnectedSocket, MessageBody, OnConnect, SocketController, OnMessage, OnDisconnect, EmitOnFail, EmitOnSuccess, SocketId } from "../../lib";
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
    @OnMessage('message')
    public async message(@ConnectedSocket() socket, @MessageBody() data: any) {
        return data;
    }
}