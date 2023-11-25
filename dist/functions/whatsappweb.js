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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.sendMessage = exports.initializeCilent = void 0;
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const socket_1 = require("./socket");
const clientSessionStore = {};
const initializeCilent = (phoneNo, socketID) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new whatsapp_web_js_1.Client({
        authStrategy: new whatsapp_web_js_1.LocalAuth({
            clientId: phoneNo,
        }),
        qrMaxRetries: 5,
    });
    client.on('qr', (qr) => {
        qrcode_terminal_1.default.generate(qr, { small: true });
        (0, socket_1.sendQRCode)(socketID, qr);
    });
    try {
        yield client.initialize();
        clientSessionStore[phoneNo] = client;
    }
    catch (error) {
        throw new Error(JSON.stringify(error));
    }
});
exports.initializeCilent = initializeCilent;
const sendMessage = (senderPhone, receipientPhone, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = clientSessionStore[senderPhone];
    if (!((_a = client === null || client === void 0 ? void 0 : client.info) === null || _a === void 0 ? void 0 : _a.wid)) {
        throw new Error('Client is not initialized');
    }
    const formatedNumber = `${receipientPhone.trim().substring(1)}@c.us`;
    const isRegistered = yield client.isRegisteredUser(formatedNumber);
    if (isRegistered) {
        try {
            yield client.sendMessage(formatedNumber, payload);
            return {
                receipientPhone,
                isRegistered,
                messageSent: true,
            };
        }
        catch (error) {
            return {
                receipientPhone,
                isRegistered,
                messageSent: false,
            };
        }
    }
    return {
        isRegistered,
    };
});
exports.sendMessage = sendMessage;
const deleteClient = (senderPhone) => {
    delete clientSessionStore[senderPhone];
};
exports.deleteClient = deleteClient;
