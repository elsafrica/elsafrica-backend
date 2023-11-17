import { Schema, Types, model } from 'mongoose';

const AssetSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	mac_address: {
		type: String,
		unique: true,
		partialFilterExpression: { 
			mac_address: { 
				$type: 'string' 
			} 
		},
	},
	belongs_to: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	},
	assetType: {
		type: String,
		required: true
	},
	assetPrice: {
		type: String,
		required: true
	},
	isForCompany: {
		type: Boolean,
		required: true,
	},
	location: String,
	purpose: String,
}, {
	timestamps: true,
});

export const Asset = model('Asset', AssetSchema);