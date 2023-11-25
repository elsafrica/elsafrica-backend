"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
//TODO: Add notes field
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone1: {
        type: String,
        required: true,
    },
    phone2: String,
    location: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    bill: {
        type: {
            package: {
                type: String,
                required: true
            },
            amount: {
                type: String,
                required: true
            }
        },
    },
    total_earnings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Due', 'Overdue', 'Suspended'],
        default: 'Active'
    },
    isDisconnected: Boolean,
    last_payment: Date,
    userType: {
        type: String,
        enum: ['customer', 'superuser', 'admin'],
        default: 'customer'
    },
    accrued_amount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
