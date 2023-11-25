"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { MONGO_URI, JWT_SECRET, PORT, SMTP_HOST, SMTP_SENDER, SMTP_USERNAME, SMTP_PASSWORD, } = process.env;
exports.settings = {
    database: MONGO_URI || 'mongodb://127.0.0.1:27017',
    secret: JWT_SECRET || '$2a$10$zIzi0OAJgG5TLMbU1yq0YON8.YSU.GMr/ktsOQZ3XCVHXnztpb4aa',
    PORT,
    SMTP_HOST,
    SMTP_SENDER,
    SMTP_USERNAME,
    SMTP_PASSWORD,
};
