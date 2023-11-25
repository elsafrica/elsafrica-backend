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
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const config_1 = require("../config/config");
/**
 *  Sends an email to user
 *
 * @param {string} to email address where to send mail
 * @param {string} subject of the email
 * @param {string} html content of the email
 */
function sendEmail(to, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = (0, nodemailer_1.createTransport)({
                host: config_1.settings.SMTP_HOST,
                sender: config_1.settings.SMTP_SENDER,
                auth: {
                    user: config_1.settings.SMTP_USERNAME,
                    pass: config_1.settings.SMTP_PASSWORD,
                },
            });
            const options = { from: config_1.settings.SMTP_SENDER, to, subject, html };
            const mail = yield transporter.sendMail(options);
            return mail;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    });
}
exports.sendEmail = sendEmail;
