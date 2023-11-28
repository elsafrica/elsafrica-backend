import { Document } from 'mongoose';

export interface User extends Document{
	name?: string;
	phone1?: string;
	phone2?: string | null;
	location?: string;
  ip?: string;
  total_earnings?: number | null;
  status?: string;
  isDisconnected?: boolean | null;
  last_payment?: Date | null;
	accrued_amount?: number;
  bill?: {
		package: string,
		amount: string
	} | null;
	userType?: string;
}