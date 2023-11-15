import { Schema, Types, model } from 'mongoose';

const AssetSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	mac_address: {
		type: String,
		required: true,
		unique: true,
	},
	belongs_to: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	},
	location: String,
	purpose: String,
}, {
	timestamps: true,
});

export const Asset = model('Asset', AssetSchema);