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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateDBWithCSV = exports.getCustomers = exports.sendMail = exports.activate = exports.deductAccruedDebt = exports.accruePayment = exports.acceptPayment = exports.update = exports.create = void 0;
const Packages_1 = require("../models/Packages");
const User_1 = require("../models/User");
const mail_1 = require("../utils/mail");
const universal_1 = require("../utils/universal");
const express_validator_1 = require("express-validator");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const Admin_1 = require("../models/Admin");
const whatsappweb_1 = require("../functions/whatsappweb");
function create(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { firstName, lastName, email, package: bill, customAmount } = req.body;
        try {
            const exists = yield User_1.User.findOne({ email });
            if (exists) {
                return res.status(409).send({ err: `A user named ${firstName} ${lastName} has already been created using the email ${email}.` });
            }
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
        const newUser = new User_1.User(req.body);
        newUser.name = (0, universal_1.toUpcaseFirstLetter)(firstName) + ' ' + (0, universal_1.toUpcaseFirstLetter)(lastName);
        try {
            const userBill = yield Packages_1.Package.findOne({ name: bill });
            if ((bill === null || bill === void 0 ? void 0 : bill.toLowerCase()) === 'custom') {
                newUser.bill = {
                    package: 'Custom',
                    amount: customAmount,
                };
                newUser.total_earnings = Number(customAmount);
            }
            else {
                newUser.bill = {
                    package: (userBill === null || userBill === void 0 ? void 0 : userBill.name) || '',
                    amount: (userBill === null || userBill === void 0 ? void 0 : userBill.amount) || '',
                };
                newUser.total_earnings = Number(userBill === null || userBill === void 0 ? void 0 : userBill.amount);
            }
            newUser.last_payment = new Date();
            newUser.isDisconnected = false;
            yield newUser.save();
            return res.status(201).send({ msg: 'User has been successfully created.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.create = create;
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id, firstName, lastName, email, phone1, phone2, package: bill, ip, location, customAmount } = req.body;
        try {
            const exists = yield User_1.User.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The user you are trying to update doesn\'t exist' });
            }
            exists.name = (0, universal_1.toUpcaseFirstLetter)(firstName) + ' ' + (0, universal_1.toUpcaseFirstLetter)(lastName);
            exists.phone1 = phone1;
            exists.phone2 = phone2;
            exists.email = email;
            exists.location = location;
            exists.ip = ip;
            const userBill = yield Packages_1.Package.findOne({ name: bill });
            if ((bill === null || bill === void 0 ? void 0 : bill.toLowerCase()) === 'custom') {
                exists.bill = {
                    package: 'Custom',
                    amount: customAmount,
                };
            }
            else {
                exists.bill = {
                    package: (userBill === null || userBill === void 0 ? void 0 : userBill.name) || '',
                    amount: (userBill === null || userBill === void 0 ? void 0 : userBill.amount) || '',
                };
            }
            yield exists.save();
            return res.status(201).send({ msg: 'Customer has been successfully updated.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.update = update;
function acceptPayment(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id } = req.body;
        const { id: adminID } = req.user;
        try {
            const user = yield User_1.User.findById(id);
            const admin = yield Admin_1.Admin.findById(adminID);
            if (!user) {
                return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
            }
            user.last_payment = new Date();
            const new_amt = Number(user.total_earnings) + (Number((_a = user.bill) === null || _a === void 0 ? void 0 : _a.amount.replace(',', '')) || 0);
            user.total_earnings = new_amt;
            yield user.save();
            const message = `Dear ${user.name}, \nThank you for making you internet bill payment.\nThank you for staying connected.
		`;
            yield (0, whatsappweb_1.sendMessage)((admin === null || admin === void 0 ? void 0 : admin.phoneNo) || '', user.phone1, message);
            return res.status(201).send({ msg: 'Customer payment has been accepted.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.acceptPayment = acceptPayment;
function accruePayment(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id } = req.body;
        const { id: adminId } = req.user;
        try {
            const user = yield User_1.User.findById(id);
            const admin = yield Admin_1.Admin.findById(adminId);
            if (!user) {
                return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
            }
            user.last_payment = new Date();
            const new_amt = Number(user.accrued_amount) + (Number((_a = user.bill) === null || _a === void 0 ? void 0 : _a.amount.replace(',', '')) || 0);
            user.accrued_amount = new_amt;
            yield user.save();
            const message = `Dear ${user.name}, \nThank you for making you internet bill payment. \n Your outstanding bill is now ${user.accrued_amount}. \n*Business Number*: 522533\n*Account Number*: 7568745\n*Amount*: ${(_b = user.bill) === null || _b === void 0 ? void 0 : _b.amount}\nThank you for staying connected.
		`;
            yield (0, whatsappweb_1.sendMessage)((admin === null || admin === void 0 ? void 0 : admin.phoneNo) || '', user.phone1, message);
            return res.status(201).send({ msg: 'Customer payment has been accrued.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.accruePayment = accruePayment;
function deductAccruedDebt(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id, amount } = req.body;
        try {
            const exists = yield User_1.User.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
            }
            const new_amt = Number(exists.accrued_amount) - Number(amount);
            exists.accrued_amount = Number(amount) > 0 ? new_amt : 0;
            yield exists.save();
            return res.status(201).send({ msg: 'Customer payment has been updated.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.deductAccruedDebt = deductAccruedDebt;
function activate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { id, deactivate } = req.body;
        try {
            const exists = yield User_1.User.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
            }
            exists.isDisconnected = deactivate;
            yield exists.save();
            return res.status(201).send({ msg: `Customer using IP: ${exists.ip} has been ${exists.isDisconnected ? 'deactivated' : 'activated'} successfully` });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.activate = activate;
function sendMail(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const exists = yield User_1.User.findById(id);
            if (!exists) {
                return res.status(409).send({ err: 'The customer you are trying to send an email to doesn\'t exist' });
            }
            const mailOptions = {
                to: exists.email,
                subject: 'Password reset',
                html: `
				<h1 style="color:#91d000;">ELSAFRICA NETWORKS</h1>
					<div>
						<p>Dear <b>${exists.name}</b></p>
						<p>Clear your internet bill today to continue&nbsp;
						enjoying the service:</p> </br>
						<div style="display:flex; flex-direction:column; align-items:center; gap:10px; padding: 15px 5px;"> 
							<span><b>Business Number:</b>&nbsp;522533</span>
							<span><b>Account Number:</b>&nbsp;7568745</span>
							<span><b>Amount:</b>&nbsp${(_a = exists.bill) === null || _a === void 0 ? void 0 : _a.amount}</span>
						</div>
					</div>
					<p>Thank you for staying connected.</p>

			`
            };
            yield (0, mail_1.sendEmail)(mailOptions.to || '', mailOptions.subject, mailOptions.html);
            return res.status(201).send({ msg: `E-mail has successfully been sent to recipient: ${exists.email} of IP: ${exists.ip}` });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.sendMail = sendMail;
function getCustomers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
        }
        const { pageNum = 0, rowsPerPage = 10 } = req.query;
        try {
            const users = yield User_1.User
                .find({ userType: 'customer' })
                .skip(Number(pageNum) * Number(rowsPerPage));
            return res.status(200).send({ users });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.getCustomers = getCustomers;
function populateDBWithCSV(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = req.file;
        const results = [];
        try {
            fs_1.default.createReadStream((file === null || file === void 0 ? void 0 : file.path) || '')
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                results.forEach((result) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const user = new User_1.User({
                        name: result['Customer Name'],
                        email: result === null || result === void 0 ? void 0 : result.Email,
                        phone1: result === null || result === void 0 ? void 0 : result.Contact,
                        phone2: result === null || result === void 0 ? void 0 : result.Contact2,
                        location: result === null || result === void 0 ? void 0 : result.Location,
                        ip: (_a = result === null || result === void 0 ? void 0 : result.IP) === null || _a === void 0 ? void 0 : _a.substring(1),
                        bill: {
                            package: 'Custom',
                            amount: result['Bill Amount'].split(' ')[1]
                        },
                        total_earnings: Number(result['Cumulative Balances'].split(' ')[1]) || 0,
                        isDisconnected: false,
                        last_payment: (0, moment_1.default)(result['Last Payment'], 'MM/DD/YY'),
                    });
                    yield user.save();
                }));
            });
            return res.status(200).send({ msg: 'Database has been populated successfully.' });
        }
        catch (error) {
            return res.status(500).send({ err: 'Error: An internal server error has occured' });
        }
    });
}
exports.populateDBWithCSV = populateDBWithCSV;
