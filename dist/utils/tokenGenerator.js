"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
/**
 * Generates a token for user
 *
 * @param {object} user
 * @param {string} secret
 * @param {date} expiresIn
 */
function generateToken(user, secret, expiresIn) {
    const { _id, name, userType } = user;
    return (0, jsonwebtoken_1.sign)({ id: _id, username: name, userType }, secret, { expiresIn });
}
exports.generateToken = generateToken;
