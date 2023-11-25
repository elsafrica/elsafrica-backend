"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAsset = exports.getAssets = exports.createAsset = void 0;
const Assets_1 = require("../models/Assets");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
function createAsset(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
        }
        const { macAddress, belongsTo } = req.body;
        try {
            const exists = yield Assets_1.Asset.findOne({ mac_address: macAddress });
            const userExists = yield User_1.User.findOne({
                ip: belongsTo
            });
            if (exists && macAddress) {
                return res.status(409).send({ err: `An asset using MAC address ${macAddress} has already been registered.` });
            }
            if (!userExists) {
                return res.status(404).send({ err: 'The user tied to the asset you are attempting to add doesn\'t exist.' });
            }
            const newAsset = new Assets_1.Asset(req.body);
            newAsset.mac_address = macAddress;
            newAsset.belongs_to = userExists.id;
            yield newAsset.save();
            return res.status(201).send({ msg: 'Asset has been successfully registered.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.createAsset = createAsset;
function getAssets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const assets = yield Assets_1.Asset
                .find({})
                .populate('belongs_to')
                .skip(Number(pageNum) * Number(rowsPerPage));
            const investments = yield Assets_1.Asset
                .find({
                isForCompany: true,
            })
                .select('assetPrice');
            const sumInvestments = investments.reduce((prev, curr) => Number(prev) + Number(curr.assetPrice), 0);
            return res.status(200).send({ assets, totalInvestment: sumInvestments });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getAssets = getAssets;
function deleteAsset(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Error: Bad request', errors: result.array() });
        }
        const { id } = req.params;
        if (!id || (id === null || id === void 0 ? void 0 : id.trim()) == '') {
            return res.status(400).send({ err: 'Error: Bad request' });
        }
        try {
            const exists = yield Assets_1.Asset.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The package you are attempting to deleete doesn\'t exist.' });
            }
            yield Assets_1.Asset.findByIdAndDelete(id);
            return res.status(201).send({ msg: 'Package has been successfully deleted.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.deleteAsset = deleteAsset;
