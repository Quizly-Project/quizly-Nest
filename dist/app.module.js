"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const quiz_game_gateway_1 = require("./quiz-game/quiz-game.gateway");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const room_service_1 = require("./room/room.service");
const userPosition_service_1 = require("./userPosition/userPosition.service");
const quiz_service_1 = require("./quiz/quiz.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            quiz_game_gateway_1.QuizGameGateway,
            room_service_1.RoomService,
            userPosition_service_1.UserPositionService,
            quiz_service_1.QuizService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map