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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const controllers = __importStar(require("../controllers/assets.controller"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/create', [
    (0, express_validator_1.body)('name')
        .notEmpty(),
    (0, express_validator_1.body)('macAddress')
        .if((0, express_validator_1.body)('assetType').toLowerCase().equals('other'))
        .notEmpty()
        .custom((value) => /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)),
    (0, express_validator_1.body)('belongsTo')
        .notEmpty(),
    (0, express_validator_1.body)('location')
        .notEmpty(),
    (0, express_validator_1.body)('assetType')
        .notEmpty(),
    (0, express_validator_1.body)('assetPrice')
        .notEmpty(),
    (0, express_validator_1.body)('isForCompany')
        .notEmpty()
        .customSanitizer((value) => value.toLowerCase() === 'yes'),
], passport_1.default.authenticate('jwt', { session: false }), controllers.createAsset);
router.get('/get', (0, express_validator_1.query)(['rowsPerPage', 'pageNum'])
    .isNumeric({ no_symbols: true }), passport_1.default.authenticate('jwt', { session: false }), controllers.getAssets);
router.delete('/delete/:id', (0, express_validator_1.param)('id')
    .notEmpty()
    .isMongoId(), passport_1.default.authenticate('jwt', { session: false }), controllers.deleteAsset);
exports.default = router;