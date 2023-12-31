import { Server } from 'socket.io';
import { Admin as User } from '../models/Admin';
import { settings } from '../config/config';

const io = new Server({
	cors: {
		origin: settings.CLIENT_URL,
		methods: ['GET', 'POST']
	}
});

export const updateUserSocketId = async (userId: string, socketId: string) => {
	try {
		const user = await User.findById(userId);

		if (user) {
			user.socketID = socketId;
			await user?.save();
		} else {
			throw new Error('User not found');
		}
	} catch (error) {
		throw new Error('An error has occured');
	}
};

export const sendQRCode = async (userSocketID: string, qrCode: string) => {
	io.to(userSocketID).emit('get_qr_code', {
		qrCode,
	});
};

export const sendClientConnected = async (userSocketID: string) => {
	io.to(userSocketID).emit('wa_client_connected', {
		connected: 'connected',
	});
};

io.on('connection', (socket) => {
	socket.on('update_user', async (userId) => {
		await updateUserSocketId(userId, socket.id);
	});
});

export default io;
