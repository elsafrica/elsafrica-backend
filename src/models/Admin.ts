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
	password: String,
}, {
	timestamps: true,
});

export const Admin = model('Admin', AdminSchema);