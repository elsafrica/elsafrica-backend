"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const mongoose_1 = require("mongoose");
const AssetSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    mac_address: {
        type: String,
        unique: true,
        partialFilterExpression: {
            mac_address: {
                $type: 'string'
            }
        },
    },
    belongs_to: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    assetType: {
        type: String,
        required: true
    },
    assetPrice: {
        type: String,
        required: true
    },
    isForCompany: {
        type: Boolean,
        required: true,
    },
    location: String,
    purpose: String,
}, {
    timestamps: true,
});
exports.Asset = (0, mongoose_1.model)('Asset', AssetSchema);
