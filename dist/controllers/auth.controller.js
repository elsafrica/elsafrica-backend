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
exports.login = exports.signUp = void 0;
const config_1 = require("../config/config");
const Admin_1 = require("../models/Admin");
const passwordGenerator_1 = require("../utils/passwordGenerator");
const tokenGenerator_1 = require("../utils/tokenGenerator");
function signUp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, name, password } = req.body;
        if (!email || (email === null || email === void 0 ? void 0 : email.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        if (!name || (name === null || name === void 0 ? void 0 : name.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        if (!password || (password === null || password === void 0 ? void 0 : password.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        // if (!mobileNo || mobileNo?.trim() == '') {
        // 	return res.status(400).send({ err: 'Error: Bad request'});
        // }
        // if (!businessName || businessName?.trim() == '') {
        // 	return res.status(400).send({ err: 'Error: Bad request'});
        // }
        try {
            const exists = yield Admin_1.Admin.findOne({ email });
            if (exists) {
                return res.status(409).send({ err: `A user has already been registered with this name: ${exists.name}` });
            }
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
            console.log(error);
        }
        const newUser = new Admin_1.Admin({
            email,
            name,
        });
        try {
            const hashedPassword = yield (0, passwordGenerator_1.generatePassword)(password);
            newUser.password = hashedPassword;
            yield newUser.save();
            const token = (0, tokenGenerator_1.generateToken)(newUser, config_1.settings.secret, '365d');
            return res.status(201).send({ msg: 'Your account has been created', token, userId: newUser.id });
        }
        catch (error) {
            console.log(error);
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.signUp = signUp;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || (email === null || email === void 0 ? void 0 : email.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        if (!password || (password === null || password === void 0 ? void 0 : password.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        try {
            const user = yield Admin_1.Admin.findOne({ email });
            if (!user) {
                return res.status(401).send({ err: 'Error: Unauthorized. Wrong username or password' });
            }
            const isCorrectPassword = yield (0, passwordGenerator_1.comparePassword)(password, user.password || '');
            if (!isCorrectPassword) {
                return res.status(401).send({ err: 'Error: Unauthorized. Wrong username or password' });
            }
            const token = (0, tokenGenerator_1.generateToken)(user, config_1.settings.secret, '365d');
            const userDetails = {
                email: user.email,
                id: user.id,
            };
            return res.status(200).send({ msg: 'Login successful', token, user: userDetails });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.login = login;
