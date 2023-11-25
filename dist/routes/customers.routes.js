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
const controllers = __importStar(require("../controllers/customers.controller"));
const express_validator_1 = require("express-validator");
const multer_1 = require("../middlewares/multer");
const router = (0, express_1.Router)();
router.post('/new', [
    (0, express_validator_1.body)([
        'firstName',
        'lastName',
        'phone1',
        'package',
        'location'
    ])
        .notEmpty(),
    (0, express_validator_1.body)('email')
        .isEmail(),
    (0, express_validator_1.body)('ip')
        .notEmpty()
        .custom((value) => /^(\.\d\d\d$)|(\.\d\d$)/.test(value)),
    (0, express_validator_1.body)('customAmount')
        .if((0, express_validator_1.body)('package').toLowerCase().equals('custom'))
        .notEmpty()
], passport_1.default.authenticate('jwt', { session: false }), controllers.create);
router.patch('/update', [
    (0, express_validator_1.body)([
        'firstName',
        'lastName',
        'phone1',
        'package',
        'location'
    ])
        .notEmpty(),
    (0, express_validator_1.body)('email')
        .isEmail(),
    (0, express_validator_1.body)('ip')
        .notEmpty()
        .custom((value) => /^(\.\d\d\d$)|(\.\d\d$)/.test(value)),
    (0, express_validator_1.body)('customAmount')
        .if((0, express_validator_1.body)('package').toLowerCase().equals('custom'))
        .notEmpty()
], passport_1.default.authenticate('jwt', { session: false }), controllers.update);
router.patch('/activate', [
    (0, express_validator_1.body)('id')
        .notEmpty()
        .isMongoId(),
    (0, express_validator_1.body)('deactivate')
        .notEmpty()
        .isBoolean()
], passport_1.default.authenticate('jwt', { session: false }), controllers.activate);
router.patch('/accept_payment', (0, express_validator_1.body)('id')
    .notEmpty()
    .isMongoId(), passport_1.default.authenticate('jwt', { session: false }), controllers.acceptPayment);
router.patch('/accrue_payment', (0, express_validator_1.body)('id')
    .notEmpty()
    .isMongoId(), passport_1.default.authenticate('jwt', { session: false }), controllers.accruePayment);
router.patch('/deduct_accrued_debt', [
    (0, express_validator_1.body)('id')
        .notEmpty()
        .isMongoId(),
    (0, express_validator_1.body)('amount')
        .isNumeric({ no_symbols: true })
], passport_1.default.authenticate('jwt', { session: false }), controllers.deductAccruedDebt);
router.get('/send_mail/:id', passport_1.default.authenticate('jwt', { session: false }), controllers.sendMail);
router.get('/get_customers', (0, express_validator_1.query)(['rowsPerPage', 'pageNum'])
    .isNumeric({ no_symbols: true }), passport_1.default.authenticate('jwt', { session: false }), controllers.getCustomers);
router.post('/upload_csv', passport_1.default.authenticate('jwt', { session: false }), multer_1.csvUploads.single('file'), controllers.populateDBWithCSV);
exports.default = router;
