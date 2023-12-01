import { CronJob } from 'cron';
import { User } from '../models/User';
import moment from 'moment';
import { Admin } from '../models/Admin';
import { broadcastStatusMessage } from './whatsappweb';
import { User as TypeUser } from '../types/user';

const sendMessage = async () => {
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
		const admin = await Admin.findOne({ email: 'elsafricaltd@gmail.com' });
		const users = await User.find({
			last_payment: {
				$gte: moment().subtract(30, 'days').subtract(7, 'hours').toISOString(),
				$lt: moment().subtract(30, 'days').add(16, 'hours').toISOString()
			}
		});
	
		const messageMetadata: { message: string, phone: string }[] = users.map((user: TypeUser) => ({ phone: user.phone1 || '', message: message('due', user )}));
		await broadcastStatusMessage(admin?.phoneNo || '', messageMetadata);
	} catch (error) {
		console.log(error);
	}
};

export default function initCron() {
	new CronJob(
		'0 8 * * *',
		sendMessage,
		null,
		true,
		'UTC+3'
	);
}
