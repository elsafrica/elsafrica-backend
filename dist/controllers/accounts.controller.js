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
exports.getAccrued = exports.getSuspended = exports.getOverdue = exports.getDue = void 0;
const User_1 = require("../models/User");
const moment_1 = __importDefault(require("moment"));
const express_validator_1 = require("express-validator");
function getDue(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const users = yield User_1.User
                .find({
                last_payment: {
                    $lte: (0, moment_1.default)(new Date()).subtract(30, 'days').toISOString(),
                    $gte: (0, moment_1.default)(new Date()).subtract(35, 'days').toISOString()
                },
                isDisconnected: false,
            })
                .skip(Number(pageNum) * Number(rowsPerPage));
            return res.status(201).send({ users });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getDue = getDue;
function getOverdue(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const users = yield User_1.User
                .find({
                last_payment: {
                    $lte: (0, moment_1.default)(new Date()).subtract(35, 'days').toISOString(),
                },
                isDisconnected: false,
            })
                .skip(Number(pageNum) * Number(rowsPerPage));
            return res.status(201).send({ users });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getOverdue = getOverdue;
function getSuspended(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const users = yield User_1.User
                .find({ isDisconnected: true })
                .skip(Number(pageNum) * Number(rowsPerPage));
            return res.status(201).send({ users });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getSuspended = getSuspended;
function getAccrued(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const users = yield User_1.User
                .find({ accrued_amount: {
                    $gt: 0
                } })
                .skip(Number(pageNum) * Number(rowsPerPage));
            return res.status(201).send({ users });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getAccrued = getAccrued;
