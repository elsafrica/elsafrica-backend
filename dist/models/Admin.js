"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const AdminSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNo: String,
    password: String,
    socketID: String,
    userType: {
        type: String,
        enum: ['user', 'super'],
        default: 'user'
    }
}, {
    timestamps: true,
});
exports.Admin = (0, mongoose_1.model)('Admin', AdminSchema);
