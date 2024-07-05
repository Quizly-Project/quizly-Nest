import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server } from "http";
import { QuizService } from "../quiz/quiz.service";
export declare class PositionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private quizService;
    constructor(quizService: QuizService);
    server: Server;
    rooms: {};
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    createRoom(client: any): void;
    joinRoom(data: {
        roomCode: string;
        nickName: string;
    }, client: any): void;
    outRoom(client: any): void;
    kickOut(data: string, client: any): void;
    movePosition(data: string, client: any): void;
    quizStart(client: any): void;
    start(client: any): void;
    broadCastQuiz(): void;
}
