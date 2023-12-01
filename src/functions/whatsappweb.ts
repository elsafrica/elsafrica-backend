import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { sendClientConnected, sendQRCode } from './socket';
interface ClientsMap {
	[clientId: string]: Client;
}
const clientSessionStore: ClientsMap = {};

export const initializeCilent = async (phoneNo: string, socketID: string) => {
	const client = new Client({
		authStrategy: new LocalAuth({
			clientId: phoneNo,
		}),
		qrMaxRetries: 5,
		puppeteer: {
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
		}
	});

	client.on('qr', (qr) => sendQRCode(socketID, qr));

	client.on('ready', () => sendClientConnected(socketID));

	try {
		await client.initialize();
		clientSessionStore[phoneNo] = client;
	} catch (error) {
		throw new Error(JSON.stringify(error));
	}
};

export const sendMessage = async (senderPhone: string, receipientPhone: string, payload: string) : Promise<{
	receipientPhone?: string,
	isRegistered?: boolean,
	messageSent?: boolean,
	error?: string,
}> => {
	const client = clientSessionStore[senderPhone.substring(1).trim()];

	if (!client?.info?.wid) {
		throw new Error('Client is not initialized. Please navigate to the Whatsapp page, scan the QR after a successfull scan return to this page and send the message again.');
	}

	const formatedNumber = `${receipientPhone.substring(1).replace(/ /g, '')}@c.us`;
	
	const isRegistered = await client.isRegisteredUser(formatedNumber);

	if (isRegistered) {
		try {
			await client.sendMessage(formatedNumber, payload);

			return {
				receipientPhone,
				isRegistered,
				messageSent: true,
			};
		} catch (error) {
			return {
				receipientPhone,
				isRegistered,
				messageSent: false,
			};
		}
	}
	
	return {
		isRegistered,
	};
};

export const broadcast = async (senderPhone: string, receipientPhones: string[], payload: string, options?: WAWebJS.MessageSendOptions) : Promise<Array<{
	receipientPhone?: string,
	isRegistered?: boolean,
	messageSent?: boolean,
	error?: string,
}>> => {
	const client = clientSessionStore[senderPhone.substring(1).replace(/ /g, '')];

	if (!client?.info?.wid) {
		throw new Error('Client is not initialized. Please navigate to the Whatsapp page, scan the QR after a successfull scan return to this page and send the message again.');
	}

	const registeredNumbers = receipientPhones.map(async(receipientPhone: string) : Promise<{
		receipientPhone?: string,
		isRegistered?: boolean,
		messageSent?: boolean,
		error?: string,
	}> => {
		const formatedNumber = `${receipientPhone.substring(1).replace(/ /g, '')}@c.us`;
		const isRegistered = await client.isRegisteredUser(formatedNumber);
		if (isRegistered) {
			try {
				await client.sendMessage(formatedNumber, payload, options);
	
				return {
					receipientPhone,
					isRegistered,
					messageSent: true,
				};
			} catch (error) {
				return {
					receipientPhone,
					isRegistered,
					messageSent: false,
				};
			}
		}

		return {
			isRegistered
		};
	});

	const data = await Promise.all(registeredNumbers);
	
	return data;
};

export const broadcastStatusMessage = async (senderPhone: string, receipientData: { phone: string, message: string }[], options?: WAWebJS.MessageSendOptions) : Promise<Array<{
	receipientPhone?: string,
	isRegistered?: boolean,
	messageSent?: boolean,
	error?: string,
}>> => {
	const client = clientSessionStore[senderPhone.substring(1).replace(/ /g, '')];

	if (!client?.info?.wid) {
		throw new Error('Client is not initialized. Please navigate to the Whatsapp page, scan the QR after a successfull scan return to this page and send the message again.');
	}

	const registeredNumbers = receipientData.map(async(receipient: { message: string, phone: string }) : Promise<{
		receipientPhone?: string,
		isRegistered?: boolean,
		messageSent?: boolean,
		error?: string,
	}> => {
		const formatedNumber = `${receipient.phone.substring(1).replace(/ /g, '')}@c.us`;
		const isRegistered = await client.isRegisteredUser(formatedNumber);
		if (isRegistered) {
			try {
				await client.sendMessage(formatedNumber, receipient.message, options);
	
				return {
					receipientPhone: receipient.phone,
					isRegistered,
					messageSent: true,
				};
			} catch (error) {
				return {
					receipientPhone: receipient.phone,
					isRegistered,
					messageSent: false,
				};
			}
		}

		return {
			isRegistered
		};
	});

	const data = await Promise.all(registeredNumbers);
	
	return data;
};

export const deleteClient = (senderPhone: string,) : void => {
	delete clientSessionStore[senderPhone];
};