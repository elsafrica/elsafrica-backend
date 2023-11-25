"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvUploads = void 0;
const multer_1 = __importStar(require("multer"));
const file_1 = require("../utils/file");
const fs_1 = __importDefault(require("fs"));
const storage = (0, multer_1.diskStorage)({
    destination: function (req, file, cb) {
        fs_1.default.stat(`${__dirname.slice(0, __dirname.length - 11)}/tmp/my-uploads`, (err, stat) => {
            if (err) {
                fs_1.default.mkdirSync(`${__dirname.slice(0, __dirname.length - 11)}/tmp/my-uploads`, { recursive: true });
            }
            else if (stat.isDirectory()) {
                cb(null, `${__dirname.slice(0, __dirname.length - 11)}/tmp/my-uploads`);
            }
        });
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});
exports.csvUploads = (0, multer_1.default)({
    storage,
    fileFilter(req, file, callback) {
        (0, file_1.checkFileType)(file, callback);
    },
});
