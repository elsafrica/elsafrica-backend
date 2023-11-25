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
exports.sendMessageToClient = exports.requestCilentInit = void 0;
const whatsappweb_1 = require("../functions/whatsappweb");
const Admin_1 = require("../models/Admin");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
function requestCilentInit(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.user;
        if (!id || (id === null || id === void 0 ? void 0 : id.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        try {
            const admin = yield Admin_1.Admin.findById(id);
            if (!admin) {
                return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
            }
            res.status(200).send({ msg: 'Awaiting client initialization, please wait for a QR code to scan.' });
            yield (0, whatsappweb_1.initializeCilent)(admin.phoneNo || '', admin.socketID || '');
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured or a WhatsApp client has not been initialized. Please request a new QR code then retry sending the message.' });
        }
    });
}
exports.requestCilentInit = requestCilentInit;
function sendMessageToClient(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id } = req.user;
        const { id: userID } = req.body;
        try {
            const admin = yield Admin_1.Admin.findById(id);
            const user = yield User_1.User.findById(userID);
            if (!admin) {
                return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
            }
            if (!user) {
                return res.status(404).send({ msg: 'User not found or send a valid user id' });
            }
            const message = `Dear ${user.name}, \nClear your internet bill today to continue enjoying the service.\n*Business Number*: 522533\n*Account Number*: 7568745\n*Amount*: ${(_a = user.bill) === null || _a === void 0 ? void 0 : _a.amount}\nThank you for staying connected.
		`;
            yield (0, whatsappweb_1.sendMessage)(admin.phoneNo || '', user.phone1, message);
            res.status(200).send({ msg: 'Message has been sent successfully.' });
        }
        catch (error) {
            console.log({ error });
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.sendMessageToClient = sendMessageToClient;
