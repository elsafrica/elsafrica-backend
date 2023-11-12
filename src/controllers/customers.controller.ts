import { Request, Response } from 'express';
import { Package } from '../models/Packages';
import { User } from '../models/User';
import { sendEmail } from '../utils/mail';
import { toUpcaseFirstLetter } from '../utils/universal';

export async function create(req: Request, res: Response): Promise<unknown> {
	const { firstName, lastName, email, phone1, package: bill, ip, location, } = req.body;

	if (!firstName || firstName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!lastName || lastName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!email || email?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!phone1 || phone1?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!bill || bill?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!ip || ip?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!location || location?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

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
		newUser.bill = {
			package: userBill?.name || '',
			amount: userBill?.amount || '',
		};

		newUser.last_payment = new Date();
		newUser.isDisconnected = false;
		newUser.total_earnings = Number(userBill?.amount);

		await newUser.save();

		return res.status(201).send({ msg: 'User has been successfully created.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function update(req: Request, res: Response): Promise<unknown> {
	const { id, firstName, lastName, email, phone1, phone2, package: bill, ip, location, } = req.body;

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}
	
	if (!firstName || firstName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!lastName || lastName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!email || email?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!phone1 || phone1?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!bill || bill?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!ip || ip?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!location || location?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await User.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The user you are trying to updadate doesn\'t exist' });
		}

		exists.name = toUpcaseFirstLetter(firstName) + ' ' + toUpcaseFirstLetter(lastName);
		exists.phone1 = phone1;
		exists.phone2 = phone2;
		exists.email = email;
		exists.location = location;
		exists.ip = ip;

		const userBill = await Package.findOne({ name: bill });
		exists.bill = {
			package: userBill?.name || '',
			amount: userBill?.amount || '',
		};

		await exists.save();
		return res.status(201).send({ msg: 'Customer has been successfully updated.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function acceptPayment(req: Request, res: Response): Promise<unknown> {
	const { id } = req.body;

	try {
		const exists = await User.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to updadate doesn\'t exist' });
		}

		exists.last_payment = new Date();
		const new_amt = Number(exists.total_earnings) + (Number(exists.bill?.amount) || 0);
		exists.total_earnings = new_amt;

		await exists.save();

		return res.status(201).send({ msg: 'Customer payment has been accepted.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function activate(req: Request, res: Response): Promise<unknown> {
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

		await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);


		return res.status(201).send({ msg: `E-mail has successfully been sent to recipient: ${exists.email} of IP: ${exists.ip}` });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getCustomers(req: Request, res: Response): Promise<unknown> {
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

