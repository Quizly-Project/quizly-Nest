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
        this.wsClients = [];
        this.userlocations = {};
    }
    connectSomeone(data, client) {
        const isAlreadyConnected = this.wsClients.some((curr) => {
            if (curr === client) {
                console.log("이미 접속한 사용자입니다.", this.wsClients.length);
                return true;
            }
            return false;
        });
        if (isAlreadyConnected)
            return;
        const [nickname, room] = data;
        console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`, client.id);
        this.server.emit('comeOn', nickname);
        this.wsClients.push(client);
        const initialValue = { x: 0, y: 0, z: 0 };
        this.userlocations[nickname] = initialValue;
        client.emit("roomIn", this.userlocations);
    }
    disconnectClient(client) {
        client.disconnect();
        console.log(client.id);
        this.wsClients = this.wsClients.filter(c => c.id !== client.id);
    }
    broadcast(event, client, message) {
        for (let c of this.wsClients) {
            if (client.id == c.id)
                continue;
            c.emit(event, message);
        }
    }
    sendMessage(data, client) {
        const [room, nickname, message] = data;
        console.log("message", message, client.id);
        this.userlocations[nickname] = message;
        this.broadcast(room, client, [nickname, message]);
    }
};
exports.PositionGateway = PositionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", http_1.Server)
], PositionGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "connectSomeone", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('out'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "disconnectClient", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PositionGateway.prototype, "sendMessage", null);
exports.PositionGateway = PositionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(81, {
        namespace: 'quizly',
        cors: { origin: '*' },
    })
], PositionGateway);
//# sourceMappingURL=position.gateway.js.map