import { Schema, model } from 'mongoose';

const MonthlyEarningsSchema = new Schema({
	slug: {
		type: String,
		required: true,
	},
	monthName: String,
	amount: {
		type: Number,
		required: true,
	}
}, {
	timestamps: true
});

export const MonthlyEarnings = model('MonthlyEarnings', MonthlyEarningsSchema);