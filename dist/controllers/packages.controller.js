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
exports.deletePackage = exports.getPackages = exports.updatePackage = exports.createPackage = void 0;
const Packages_1 = require("../models/Packages");
const express_validator_1 = require("express-validator");
function createPackage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { name } = req.body;
        try {
            const exists = yield Packages_1.Package.findOne({ name });
            if (exists) {
                return res.status(409).send({ err: `A package named ${name} has already been created.` });
            }
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
        const newPackage = new Packages_1.Package(req.body);
        try {
            yield newPackage.save();
            return res.status(201).send({ msg: 'Package has been successfully created.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.createPackage = createPackage;
function updatePackage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id, name, amount } = req.body;
        try {
            const exists = yield Packages_1.Package.findById(id);
            if (!exists) {
                return res.status(409).send({ err: `A package named ${name} doesn't exist.` });
            }
            exists.name = name;
            exists.amount = amount;
            yield exists.save();
            return res.status(201).send({ msg: 'Package has been successfully updated.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.updatePackage = updatePackage;
function getPackages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packages = yield Packages_1.Package.find({});
            return res.status(200).send({ packages });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getPackages = getPackages;
function deletePackage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id } = req.params;
        try {
            const exists = yield Packages_1.Package.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The package you are attempting to deleete doesn\'t exist.' });
            }
            yield Packages_1.Package.findByIdAndDelete(id);
            return res.status(201).send({ msg: 'Package has been successfully deleted.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.deletePackage = deletePackage;
