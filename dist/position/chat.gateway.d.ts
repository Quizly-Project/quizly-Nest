import { Server } from 'http';
export declare class ChatGateway {
    server: Server;
    wsClients: any[];
    userlocations: {};
    connectSomeone(data: string, client: any): void;
    disconnectClient(client: any): void;
    private broadcast;
    sendMessage(data: string, client: any): void;
}
