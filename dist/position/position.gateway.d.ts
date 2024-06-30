import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'http';
export declare class PositionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    wsClients: any[];
    userlocations: {};
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    connectSomeone(data: string, client: any): void;
    disconnectClient(client: any): void;
    private broadcast;
    sendMessage(data: string, client: any): void;
}
