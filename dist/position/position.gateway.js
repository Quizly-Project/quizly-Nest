"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const http_1 = require("http");
let PositionGateway = class PositionGateway {
    constructor() {
        this.rooms = {};
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const room = this.rooms[client['roomCode']];
        if (!room)
            return;
        if (room.teacherId === client.id) {
            room.open = false;
            room.clients.forEach(c => {
                c.disconnect();
            });
            delete this.rooms[client['roomCode']];
            delete room.clients[client];
            delete room.userlocations[client.id];
            if (room.open === false)
                return;
            for (let c of room.clients) {
                c.emit('exitRoom', client.id);
            }
        }
    }
    createRoom(client) {
        const roomCode = '1';
        if (this.rooms[roomCode]) {
            console.log('이미 생성된 방입니다.');
            return;
        }
        client["roomCode"] = roomCode;
        const room = {
            teacherId: client.id,
            roomCode: roomCode,
            clients: [client],
            userlocations: {},
            answers: [],
            open: true,
            quizGroup: { quizGroup },
        };
        this.rooms[roomCode] = room;
    }
    joinRoom(data, client) {
        const { roomCode, nickName } = data;
        client['nickName'] = nickName;
        client['roomCode'] = roomCode;
        const room = this.rooms[roomCode];
        if (!room) {
            console.log('존재하지 않는 방입니다.');
            return;
        }
        var isAlreadyConnected = room.clients.some(c => {
            if (c === client) {
                console.log('이미 접속한 사용자입니다.');
                return true;
            }
            return false;
        });
        if (isAlreadyConnected)
            return;
        client["roomCode"] = roomCode;
        room.clients.push(client);
        room.userlocations[client.id] = {
            nickName: nickName,
            position: { x: 0, y: 0, z: 0 },
        };
        console.log(`${nickName}님이 코드: ${roomCode}방에 접속했습니다.`, client.id);
        for (var c of room.clients) {
            if (c === client)
                continue;
            c.emit('newClientPosition', room.userlocations[client.id]);
        }
        client.emit('everyonePosition', room.userlocations);
    }
    outRoom(client) {
        if (client) {
            client.disconnect();
        }
    }
    kickOut(data, client) { }
    movePosition(data, client) {
        const room = this.rooms[client["roomCode"]];
        const { roomCode, nickName, position } = data;
        room.userlocations[client.id] = { nickName: nickName, position: position };
        for (let c of room.clients) {
            if (c === client)
                continue;
            c.emit('theyMove', room.userlocations[client.id]);
        }
    }
    quizStart(client) {
    }
    start(client) {
    }
    checkAnswer(room, teacher, correctAnswer) {
        for (let c of room.clients) {
            if (c === teacher)
                continue;
            let answer = this.checkArea(room, c);
            room.answers.push([]);
        }
    }
    checkArea(room, client) {
        if (room.userlocations[client.id].position.x < 0) {
            return 0;
        }
        else if (room.userlocations[client.id].position.x > 0) {
            return 1;
        }
    }
    broadCastQuiz() { }
};
exports.PositionGateway = PositionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", http_1.Server)
], PositionGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("createRoom"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "createRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exitRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "outRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kickOut'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "kickOut", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('iMove'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "movePosition", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('nextQuiz'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "quizStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("start"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "start", null);
exports.PositionGateway = PositionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(81, {
        namespace: "quizly",
        cors: { origin: "*" },
    })
], PositionGateway);
const quizGroup = {
    quizGroup: 1,
    quizTitle: '제목',
    quizDescription: '설명',
    user: {
        id: 1,
        username: 'admin4',
        password: '$2a$10$OMLUjlNcydW2ECtYmWczeuUZVMqKwqq/ZJLmQ6OD7hKUMhODMcst6',
        email: 'admin4@naver.com',
        role: 'ROLE_ADMIN',
    },
    quizs: [
        {
            quizId: 1,
            type: 1,
            question: '질문1',
            correctAnswer: '0',
            quizScore: 30,
            time: 15,
            options: [],
        },
        {
            quizId: 2,
            type: 2,
            question: '질문2',
            correctAnswer: '0',
            quizScore: 30,
            time: 15,
            options: [
                {
                    optionId: 1,
                    optionText: '선택지1',
                    optionNum: 1,
                },
                {
                    optionId: 2,
                    optionText: '선택지2',
                    optionNum: 2,
                },
                {
                    optionId: 3,
                    optionText: '선택지3',
                    optionNum: 3,
                },
                {
                    optionId: 4,
                    optionText: '선택지4',
                    optionNum: 4,
                },
            ],
        },
        {
            quizId: 3,
            type: 2,
            question: '질문2',
            correctAnswer: '0',
            quizScore: 30,
            time: 15,
            options: [
                {
                    optionId: 5,
                    optionText: '선택지1',
                    optionNum: 1,
                },
                {
                    optionId: 6,
                    optionText: '선택지2',
                    optionNum: 2,
                },
                {
                    optionId: 7,
                    optionText: '선택지3',
                    optionNum: 3,
                },
                {
                    optionId: 8,
                    optionText: '선택지4',
                    optionNum: 4,
                },
            ],
        },
    ],
};
//# sourceMappingURL=position.gateway.js.map