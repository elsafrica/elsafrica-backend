import { Schema, model } from 'mongoose';

const PackageSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	amount: {
		type: String,
		required: true,
	}
}, {
	timestamps: true
});

export const Package = model('Package', PackageSchema);