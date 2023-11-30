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

	const { firstName, lastName, package: bill, customAmount, } = req.body;

	const newUser = new User(req.body);
	newUser.name = toUpcaseFirstLetter(firstName) + ' ' + toUpcaseFirstLetter(lastName);

	try {
		const userBill = await Package.findOne({ name: bill });
		const admin = await Admin.findOne({ email: 'elsafricaltd@gmail.com' });

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

		if(admin) {
			const message = 
			`Dear ${newUser.name},\n\nWelcome to Elsafrica Networks! Get ready for a turbocharged internet experience. Blazing speed, unwavering reliability, and 24/7 support – your connectivity journey starts now!\n\n#ElsafricaConnects!`;
	
			await sendMessage(admin.phoneNo || '', newUser.phone1, message);
		}

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

	const { id, isSuspended } = req.body;
	const { id: adminID } = req.user as { id: string };

	try {
		const user = await User.findById(id);
		const admin = await Admin.findById(adminID);

		if (!user) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		const new_amt = Number(user.total_earnings) + (Number(user.bill?.amount.replace(',', '')) || 0);
		user.total_earnings = new_amt;

		if(isSuspended) {
			user.last_payment = new Date();
		} else {
			user.last_payment = moment(user.last_payment).add(30, 'days').toDate();
		}

		await user.save();

		const message = 
		`Dear ${user.name},\n\nPayment received! Thank you for settling your internet bill.\nFor any inquiries, call: 0712748039.\n\nElsafrica!`;

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

		const message = `Dear ${user.name},\n\nYour outstanding balance of ${user.accrued_amount} is long overdue. Please settle to avoid service interruption. For any questions, call 0712748039.\n\nThank you.\nElsafrica!`;

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
	const { id: adminId } = req.user as { id: string };

	try {
		const exists = await User.findById(id);
		const admin = await Admin.findById(adminId);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		const new_amt = Number(exists.accrued_amount) - Number(amount);
		exists.accrued_amount = Number(amount) > 0 ? new_amt : 0;

		await exists.save();

		const message = 
		`Dear ${exists.name},\n\nPayment received! Thank you for settling your internet bill. Your continued support is appreciated.\nFor any inquiries, call: 0712748039.\nElsafrica!`;

		await sendMessage(admin?.phoneNo || '', exists.phone1, message);

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
	const { id: adminId } = req.user as { id: string };

	try {
		const exists = await User.findById(id);
		const admin = await Admin.findById(adminId);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		exists.isDisconnected = deactivate;

		await exists.save();

		if (deactivate) {
			const message = 
			`Dear ${exists.name},\n\nYour internet bill is long overdue and the service has been suspended. Please make payment to continue enjoying the service. For any questions, call 0712748039.\nThank You,\nElsafrica!`;

			await sendMessage(admin?.phoneNo || '', exists.phone1, message);
		}

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

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';

	try {
		const users = await User
			.find({
				name: {
					$regex: regex,
					$options: 'i'
				}
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage))
			.sort({
				last_payment: 'desc'
			});

		const monthtlyUsers = await User
			.find({ 
				last_payment: {
					$gte: moment(`01/${new Date().getMonth() + 1}/${new Date().getFullYear()}`, 'DD/MM/YYYY').toISOString(),
					$lte: moment(new Date()).toISOString(),
				},
			});

		const allUsers = await User
			.find({});

		const totalEarnings = allUsers.reduce((prev, next) => prev + (Number(next.total_earnings) || 0), 0);
		const monthlyEarnings = monthtlyUsers.reduce((prev, next) => prev + (Number(next.bill?.amount) || 0), 0);

		const userCount = await User
			.countDocuments();

		return res.status(200).send({ users, dataLength: userCount, totalEarnings, monthlyEarnings });
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
						phone1: '+254' + result?.Contact,
						phone2: result?.Contact2,
						location: result?.Location,
						ip: result?.IP?.substring(1),
						bill: {
							package: 'Custom',
							amount: Number(result['Bill Amount'].split(' ')[1]?.replace(',', ''))
						},
						total_earnings: Number(result['Total Earning']?.split(' ')[1]?.replace(',', '')) || 0,
						accrued_amount: Number(result['Cumulative Balances']?.split(' ')[1]?.replace(',', '')) || 0,
						isDisconnected: false,
						last_payment: moment(result['Last Payment'], 'DD/MM/YYYY').isValid() ? moment(result['Last Payment'], 'DD/MM/YYYY') : moment(),
					});
		
					await user.save();
				});
			});
		
		return res.status(200).send({ msg: 'Database has been populated successfully.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

