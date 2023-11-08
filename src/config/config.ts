import dotenv from 'dotenv';
import { Settings } from '../types/config';
dotenv.config();

const {
	MONGO_URI,
	JWT_SECRET,
	PORT,
	SMTP_HOST,
	SMTP_SENDER,
	SMTP_USERNAME,
	SMTP_PASSWORD,
} = process.env;

export const settings = <Settings>{
	database: MONGO_URI,
	secret: JWT_SECRET,
	PORT,
	SMTP_HOST,
	SMTP_SENDER,
	SMTP_USERNAME,
	SMTP_PASSWORD,
};