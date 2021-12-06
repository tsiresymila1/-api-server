
import { ConnectedSocket, MessageBody, OnConnection, SocketController, OnMessage } from "../../lib";
@SocketController()
export default class TestSocketController {

    @OnConnection()
    public async connection(@ConnectedSocket() socket) {
        console.log('user connected')
        console.log(socket.id)
    }

    @OnMessage('message')
    public async message(@ConnectedSocket() socket, @MessageBody() data: any) {
        console.log('Message get : ', data, socket)
        socket.emit('message', 'got data : ' + data);
    }
}