import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phone1: {
		type: String,
		required: true,
	},
	phone2: String,
	location: {
		type: String,
		required: true,
	},
	ip: {
		type: String,
		required: true,
	},
	bill: {
		type: {
			package: {
				type: String,
				required: true
			},
			amount: {
				type: String,
				required: true
			}
		},
	},
	total_earnings: {
		type: Number,
		default: 0
	},
	status: {
		type: String,
		enum: ['Active', 'Due', 'Overdue', 'Suspended'],
		default: 'Active'
	},
	isDisconnected: Boolean,
	last_payment: Date,
	userType: {
		type: String,
		enum: ['customer', 'superuser', 'admin'],
		default: 'customer'
	},
}, {
	timestamps: true,
});

export const User = model('User', UserSchema);