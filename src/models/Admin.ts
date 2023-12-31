import { Schema, model } from 'mongoose';

const AdminSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phoneNo: String,
	password: String,
	socketID: String,
	resetToken: String,
	tokenExpiresAt: Date,
	isActivated: Boolean,
	userType: {
		type: String,
		enum: ['user', 'super'],
		default: 'user'
	}
}, {
	timestamps: true,
});

export const Admin = model('Admin', AdminSchema);