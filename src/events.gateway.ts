import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server} from "socket.io"

@WebSocketGateway({
    namespace:"sites",
    cors: {origin: "*"}})

export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    handleConnection(client: any, ...args: any[]) {
        console.log(`✅ Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: any) {
        console.log(`❌ Cliente desconectado: ${client.id}`);
    }

    sendUpdate(date: any){
        this.server.emit("system-update", date)
    }
}