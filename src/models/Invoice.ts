import { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema({
	number: {
		type: String,
		required: true,
	},
	date: Date,
	poNumber: String,
	dueDate: Date,
	to: String,
	items: [{
		name: {
			type: String,
			required: true,
		},
		quantity: {
			type: Number,
			required: true
		},
		unit_cost: {
			type: Number,
			required: true
		}
	}],
	notes: String,
	terms: String,
	tax: Number,
	discount: Number,
	shipping: Number
}, {
	timestamps: true,
});

export const Invoice = model('Invoice', InvoiceSchema);