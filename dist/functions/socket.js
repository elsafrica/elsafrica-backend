"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendQRCode = exports.updateUserSocketId = void 0;
const socket_io_1 = require("socket.io");
const Admin_1 = require("../models/Admin");
const io = new socket_io_1.Server({
    cors: {
        origin: '*'
    }
});
const updateUserSocketId = (userId, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Admin_1.Admin.findById(userId);
        if (user) {
            user.socketID = socketId;
            yield (user === null || user === void 0 ? void 0 : user.save());
        }
        else {
            throw new Error('User not found');
        }
    }
    catch (error) {
        throw new Error('An error has occured');
    }
});
exports.updateUserSocketId = updateUserSocketId;
const sendQRCode = (userSocketID, qrCode) => __awaiter(void 0, void 0, void 0, function* () {
    io.to(userSocketID).emit('get_qr_code', {
        qrCode,
    });
});
exports.sendQRCode = sendQRCode;
io.on('connection', (socket) => {
    socket.on('update_user', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, exports.updateUserSocketId)(userId, socket.id);
    }));
});
exports.default = io;
