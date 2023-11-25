"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = require("./middlewares/auth");
require("./db");
(0, auth_1.passportStatic)(passport_1.default);
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    redentials: true,
};
app.set('trust proxy', 1);
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use(passport_1.default.initialize());
app.use('/api', index_1.default);
exports.default = app;
