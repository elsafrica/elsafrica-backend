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
    database: MONGO_URI,
    secret: JWT_SECRET,
    PORT,
    SMTP_HOST,
    SMTP_SENDER,
    SMTP_USERNAME,
    SMTP_PASSWORD,
};
