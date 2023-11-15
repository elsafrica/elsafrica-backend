import { Request, Response } from 'express';
import { initializeCilent, sendMessage } from '../functions/whatsappweb';
import { Admin } from '../models/Admin';
import { User } from '../models/User';

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

		await initializeCilent(admin.phoneNo || '', admin.socketID || '');
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured or a WhatsApp client has not been initialized. Please request a new QR code then retry sending the message.' });
	}
}

export async function sendMessageToClient(req: Request, res: Response): Promise<unknown> {
	const { id } = req.user as { id: string };
	const { id: userID } = req.body;

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const admin = await Admin.findById(id);
		const user = await User.findById(userID);
		
		if (!admin) {
			return res.status(404).send({ msg: 'User doesn\'t exist on this server' });
		}

		if (!user) {
			return res.status(404).send({ msg: 'User not found or send a valid user id' });
		}

		const message = `Dear ${user.name}, \nClear your internet bill today to continue enjoying the service.\n*Business Number*: 522533\n*Account Number*: 7568745\n*Amount*: ${user.bill?.amount}\nThank you for staying connected.
		`;

		await sendMessage(admin.phoneNo || '', user.phone1, message);

		res.status(200).send({ msg: 'Message has been sent successfully.' });
	} catch (error) {
		console.log({error});
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}