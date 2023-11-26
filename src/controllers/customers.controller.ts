import { Request, Response } from 'express';
import { Package } from '../models/Packages';
import { User } from '../models/User';
import { sendEmail } from '../utils/mail';
import { toUpcaseFirstLetter } from '../utils/universal';
import { validationResult } from 'express-validator';
import csv from 'csv-parser';
import fs from 'fs';
import moment from 'moment';
import { Admin } from '../models/Admin';
import { sendMessage } from '../functions/whatsappweb';

type Result = {
	'Customer Name': string,
	Location: string,
	Contact: string,
	Contact2?: string,
	Email?: string,
	IP: string,
	Date: Date,
	Link: string,
	'Bill Amount': string,
	'Cumulative Balances': string,
	Detail: string,
	'Last Payment': string;
	'Total Earning': string;
}

export async function create(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { firstName, lastName, email, package: bill, customAmount } = req.body;

	try {
		const exists = await User.findOne({ email });

		if (exists) {
			return res.status(409).send({ err: `A user named ${firstName} ${lastName} has already been created using the email ${email}.` });
		}
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}

	const newUser = new User(req.body);
	newUser.name = toUpcaseFirstLetter(firstName) + ' ' + toUpcaseFirstLetter(lastName);

	try {
		const userBill = await Package.findOne({ name: bill });

		if(bill?.toLowerCase() === 'custom') {
			newUser.bill = {
				package: 'Custom',
				amount: customAmount,
			};

			newUser.total_earnings = Number(customAmount);
		} else {
			newUser.bill = {
				package: userBill?.name || '',
				amount: userBill?.amount || '',
			};

			newUser.total_earnings = Number(userBill?.amount);
		}

		newUser.last_payment = new Date();
		newUser.isDisconnected = false;

		await newUser.save();

		return res.status(201).send({ msg: 'User has been successfully created.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function update(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id, firstName, lastName, email, phone1, phone2, package: bill, ip, location, customAmount } = req.body;

	try {
		const exists = await User.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The user you are trying to update doesn\'t exist' });
		}

		exists.name = toUpcaseFirstLetter(firstName) + ' ' + toUpcaseFirstLetter(lastName);
		exists.phone1 = phone1;
		exists.phone2 = phone2;
		exists.email = email;
		exists.location = location;
		exists.ip = ip;

		const userBill = await Package.findOne({ name: bill });

		if(bill?.toLowerCase() === 'custom') {
			exists.bill = {
				package: 'Custom',
				amount: customAmount,
			};
		} else {
			exists.bill = {
				package: userBill?.name || '',
				amount: userBill?.amount || '',
			};
		}

		await exists.save();
		return res.status(201).send({ msg: 'Customer has been successfully updated.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function acceptPayment(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.body;
	const { id: adminID } = req.user as { id: string };

	try {
		const user = await User.findById(id);
		const admin = await Admin.findById(adminID);

		if (!user) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		user.last_payment = new Date();
		const new_amt = Number(user.total_earnings) + (Number(user.bill?.amount.replace(',', '')) || 0);
		user.total_earnings = new_amt;

		await user.save();

		const message = `Dear ${user.name}, \nThank you for making you internet bill payment.\nThank you for staying connected.
		`;

		await sendMessage(admin?.phoneNo || '', user.phone1, message);

		return res.status(201).send({ msg: 'Customer payment has been accepted.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function accruePayment(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.body;
	const { id: adminId } = req.user as { id: string };

	try {
		const user = await User.findById(id);
		const admin = await Admin.findById(adminId);

		if (!user) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		user.last_payment = new Date();
		const new_amt = Number(user.accrued_amount) + (Number(user.bill?.amount.replace(',', '')) || 0);
		user.accrued_amount = new_amt;

		await user.save();

		const message = `Dear ${user.name}, \nThank you for making you internet bill payment. \n Your outstanding bill is now ${user.accrued_amount}. \n*Business Number*: 522533\n*Account Number*: 7568745\n*Amount*: ${user.bill?.amount}\nThank you for staying connected.
		`;

		await sendMessage(admin?.phoneNo || '', user.phone1, message);

		return res.status(201).send({ msg: 'Customer payment has been accrued.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function deductAccruedDebt(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id, amount } = req.body;

	try {
		const exists = await User.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		const new_amt = Number(exists.accrued_amount) - Number(amount);
		exists.accrued_amount = Number(amount) > 0 ? new_amt : 0;

		await exists.save();

		return res.status(201).send({ msg: 'Customer payment has been updated.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function activate(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id, deactivate } = req.body;

	try {
		const exists = await User.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		exists.isDisconnected = deactivate;

		await exists.save();

		return res.status(201).send({ msg: `Customer using IP: ${exists.ip} has been ${exists.isDisconnected ? 'deactivated': 'activated'} successfully` });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function sendMail(req: Request, res: Response): Promise<unknown> {
	const { id } = req.params;

	try {
		const exists = await User.findById(id);

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
							<span><b>Amount:</b>&nbsp${exists.bill?.amount}</span>
						</div>
					</div>
					<p>Thank you for staying connected.</p>

			`
		};

		await sendEmail(mailOptions.to || '', mailOptions.subject, mailOptions.html);

		return res.status(201).send({ msg: `E-mail has successfully been sent to recipient: ${exists.email} of IP: ${exists.ip}` });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getCustomers(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10 } = req.query;

	try {
		const users = await User
			.find({ userType: 'customer' })
			.skip(Number(pageNum) * Number(rowsPerPage));

		return res.status(200).send({ users });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function populateDBWithCSV(req: Request, res: Response): Promise<unknown> {
	const file = req.file;
	const results: Result[] = [];

	try {
		fs.createReadStream(file?.path || '')
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
				results.forEach(async (result: Result) => {
					const user = new User({
						name: result['Customer Name'],
						email: result?.Email,
						phone1: result?.Contact,
						phone2: result?.Contact2,
						location: result?.Location,
						ip: result?.IP?.substring(1),
						bill: {
							package: 'Custom',
							amount: result['Bill Amount'].split(' ')[1]
						},
						total_earnings: Number(result['Total Earning']?.split(' ')[1]?.replace(',', '')) || 0,
						accrued_amount: Number(result['Cumulative Balances']?.split(' ')[1]?.replace(',', '')) || 0,
						isDisconnected: false,
						last_payment: moment(result['Last Payment'], 'DD/MM/YYYY').isValid() ? moment(result['Last Payment'], 'DD/MM/YY') : moment(),
					});
		
					await user.save();
				});
			});
		
		return res.status(200).send({ msg: 'Database has been populated successfully.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

