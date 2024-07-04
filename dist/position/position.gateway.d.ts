import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'http';
export declare class PositionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    wsClients: any[];
    rooms: {};
    userlocations: {};
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    createRoom(client: any): void;
    joinRoom(data: {
        roomCode: string;
    }, client: any): void;
    connectSomeone(data: {
        nickname: string;
        room: string;
    }, client: any): void;
    disconnectClient(client: any): void;
    private broadcast;
    sendMessage(data: string, client: any): void;
}
