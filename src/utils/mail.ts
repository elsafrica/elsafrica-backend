import { createTransport } from 'nodemailer';
import { settings } from '../config/config';

/**
 *  Sends an email to user
 *
 * @param {string} to email address where to send mail
 * @param {string} subject of the email
 * @param {string} html content of the email
 */
export async function sendEmail(to: string | undefined, subject: string, html: string) : Promise<unknown> {
	try {
		const transporter = createTransport({
			host: settings.SMTP_HOST,
			sender: settings.SMTP_SENDER,
			auth: {
				user: settings.SMTP_USERNAME,
				pass: settings.SMTP_PASSWORD,
			},
		});

		const options = { from: settings.SMTP_SENDER, to, subject, html };
		const mail = await transporter.sendMail(options);

		return mail;
	} catch (err) {
		console.log(err);
		return err;
	}
}
