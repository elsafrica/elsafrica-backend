"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_1 = __importDefault(require("./functions/socket"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const server = http_1.default.createServer(app_1.default);
const PORT = process.env.PORT || 8080;
socket_1.default.listen(server);
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
