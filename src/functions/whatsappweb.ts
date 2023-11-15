import qrcodeterminal from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { sendQRCode } from './socket';
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
	});

	client.on('qr', (qr) => {
		qrcodeterminal.generate(qr, { small: true });
		sendQRCode(socketID, qr);
	});

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
	const client = clientSessionStore[senderPhone];

	if (!client?.info?.wid) {
		throw new Error('Client is not initialized');
	}

	const formatedNumber = `${receipientPhone.trim().substring(1)}@c.us`;
	
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

export const deleteClient = (senderPhone: string,) : void => {
	delete clientSessionStore[senderPhone];
};