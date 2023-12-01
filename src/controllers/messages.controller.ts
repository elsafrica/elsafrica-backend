import { Request, Response } from 'express';
import { broadcast, broadcastStatusMessage, initializeCilent, sendMessage } from '../functions/whatsappweb';
import { Admin } from '../models/Admin';
import { User } from '../models/User';
import { validationResult } from 'express-validator';
import { User as TypeUser } from '../types/user';
import moment from 'moment';
import { MessageMedia } from 'whatsapp-web.js';

export async function requestCilentInit(req: Request, res: Response): Promise<unknown> {
	const { id } = req.user as { id: string };

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const admin = await Admin.findById(id);
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		res.status(200).send({ msg: 'Awaiting client initialization, please wait for a QR code to scan.' });

		await initializeCilent(admin.phoneNo?.substring(1).trim() || '', admin.socketID || '');
	} catch (error) {
		console.log(error);
		return res.status(500).send({ err: 'Error: An internal server error has occured or a WhatsApp client has not been initialized. Please wait and refresh the page after sometime.' });
	}
}

export async function sendMessageToClient(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.user as { id: string };
	const { id: userID, status } = req.body;

	const message = (status: string, user: TypeUser) : string => {
		switch (status) {
		case 'due':
			return `Dear ${user.name},\n\nWe appreciate your continued trust in Elsafrica Networks for your internet needs. Your internet bill is due today.\n\n*Plan*: ${user.bill?.package}\n*Amount*: ${user.bill?.amount}\n*M-Pesa Paybill Number*: 247247\n*Account Number*: 0712748039\n*Due*: ${moment(user.last_payment).add(30, 'days').format('MMM Do YYYY')}\n\nPlease ensure timely payment to enjoy uninterrupted services.\nCall: 0712748039 for support.\n\nElsafrica!`;
		case 'overdue':
			return `Dear ${user.name},\n\nWe appreciate your continued trust in Elsafrica Networks for your internet needs. This is a kind reminder that your internet bill is overdue.\n\n*Plan*: ${user.bill?.package}\n*Amount*: ${user.bill?.amount}\n*M-Pesa Paybill Number*: 247247\n*Account Number*: 0712748039\n*Due*: ${moment(user.last_payment).add(30, 'days').format('MMM Do YYYY')}\nPlease ensure timely payment to enjoy uninterrupted services.\nCall: 0712748039 for support.\n\nElsafrica!`;
		case 'accrued':
			return `Dear ${user.name},\n\nYour outstanding balance of ${user.accrued_amount} is long overdue. Please settle to avoid service interruption. For any questions, call 0712748039.\n\nThank you.\nElsafrica!`;
		default:
			return '';
		}
	};

	try {
		const admin = await Admin.findById(id);
		const user = await User.findById(userID);
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		if (!user) {
			return res.status(404).send({ msg: 'User not found or send a valid user id' });
		}

		const data = await sendMessage(admin.phoneNo || '', user.phone1, message(status || '', user));
		const msg = data.isRegistered && !data.messageSent ?
			'Message has not been sent to the user please try again' :
			data.isRegistered && data.messageSent ?
				`Success! Your message has been sent to ${data.receipientPhone}.` :
				'The message has not been sent because the user is not registered on WhatsApp.';

		res.status(200).send({ msg });
	} catch (error) {
		if(error && typeof error === 'object' && 'message' in error)
			return res.status(500).send({ err: 'Error: An internal server error has occured', errMsg: error.message });
	}
}

export async function broadcastMessageToClient(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.user as { id: string };
	const { status } = req.body;

	const message = (status: string, user: TypeUser) : string => {
		switch (status) {
		case 'due':
			return `Dear ${user.name},\n\nWe appreciate your continued trust in Elsafrica Networks for your internet needs. Your internet bill is due today.\n\n*Plan*: ${user.bill?.package}\n*Amount*: ${user.bill?.amount}\n*M-Pesa Paybill Number*: 247247\n*Account Number*: 0712748039\n*Due*: ${moment(user.last_payment).add(30, 'days').format('MMM Do YYYY')}\n\nPlease ensure timely payment to enjoy uninterrupted services.\nCall: 0712748039 for support.\n\nElsafrica!`;
		case 'overdue':
			return `Dear ${user.name},\n\nWe appreciate your continued trust in Elsafrica Networks for your internet needs. This is a kind reminder that your internet bill is overdue.\n\n*Plan*: ${user.bill?.package}\n*Amount*: ${user.bill?.amount}\n*M-Pesa Paybill Number*: 247247\n*Account Number*: 0712748039\n*Due*: ${moment(user.last_payment).add(30, 'days').format('MMM Do YYYY')}\nPlease ensure timely payment to enjoy uninterrupted services.\nCall: 0712748039 for support.\n\nElsafrica!`;
		case 'accrued':
			return `Dear ${user.name},\n\nYour outstanding balance of ${user.accrued_amount} is long overdue. Please settle to avoid service interruption. For any questions, call 0712748039.\n\nThank you.\nElsafrica!`;
		default:
			return '';
		}
	};

	const query = (status: string) => {
		switch (status) {
		case 'due':
			return {
				last_payment: {
					$lte: moment(new Date()).subtract(30, 'days').toISOString(),
					$gte: moment(new Date()).subtract(35, 'days').toISOString()
				},
				isDisconnected: false,
			};
		case 'overdue':
			return {
				last_payment: {
					$lte: moment(new Date()).subtract(35, 'days').toISOString(),
				},
				isDisconnected: false,
			};
		case 'accrued':
			return {
				accrued_amount: {
					$gt: 0
				}
			};
		default:
			return {};
		}
	};

	try {
		const admin = await Admin.findById(id);
		const users = await User.find(query(status));
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		const messageMetadata: { message: string, phone: string }[] = users.map((user: TypeUser) => ({ phone: user.phone1 || '', message: message(status, user )}));
		const data = await broadcastStatusMessage(admin.phoneNo || '', messageMetadata);

		res.status(200).send({ msg: 'Operation successfull.', data });
	} catch (error) {
		if(error && typeof error === 'object' && 'message' in error)
			return res.status(500).send({ err: 'Error: An internal server error has occured', errMsg: error.message });
	}
}

export async function sendTestMessage(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.user as { id: string };

	try {
		const admin = await Admin.findById(id);
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		const message = 'This is a simple test message';

		await sendMessage(admin.phoneNo || '', admin.phoneNo || '+254712748039', message);

		res.status(200).send({ msg: 'Test message has been sent successfully.' });
	} catch (error) {
		if(error && typeof error === 'object' && 'message' in error)
			return res.status(500).send({ err: 'Error: An internal server error has occured', errMsg: error?.message });
	}
}

export async function broadCastMessage(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.user as { id: string };
	const { message } = req.body;
	const file = req.file;

	try {
		const admin = await Admin.findById(id);
		const users = await User.find({});
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		const messageMedia = file && new MessageMedia(file?.mimetype, file?.buffer.toString('base64'), file?.originalname);
		const finalMessage = file ? messageMedia : message;
		const options = file && { caption: message };

		const userPhones = users.map((user) => user.phone1);
		const data = await broadcast(admin.phoneNo || '', userPhones, finalMessage, options);

		res.status(200).send({ msg: 'Operation successfull', data });
	} catch (error) {
		if(error && typeof error === 'object' && 'message' in error)
			return res.status(500).send({ err: 'Error: An internal server error has occured', errMsg: error.message });
	}
}