import { Request, Response } from 'express';
import { User } from '../models/User';
import moment from 'moment';

export async function getDue(req: Request, res: Response): Promise<unknown> {
	const { pageNum = 0, rowsPerPage = 10 } = req.query;

	try {
		const users = await User
			.find({ 
				last_payment: {
					$lte: moment(new Date()).subtract(30, 'days').toISOString(),
					$gte: moment(new Date()).subtract(35, 'days').toISOString()
				},
				isDisconnected: false,
			})
			.skip(Number(pageNum) * Number(rowsPerPage));
		return res.status(201).send({ users });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getOverdue(req: Request, res: Response): Promise<unknown> {
	const { pageNum = 0, rowsPerPage = 10 } = req.query;
 
	try {
		const users = await User
			.find({ 
				last_payment: {
					$lte: moment(new Date()).subtract(35, 'days').toISOString(),
				},
				isDisconnected: false,
			})
			.skip(Number(pageNum) * Number(rowsPerPage));

		return res.status(201).send({ users });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getSuspended(req: Request, res: Response): Promise<unknown> {
	const { pageNum = 0, rowsPerPage = 10 } = req.query;
 
	try {
		const users = await User
			.find({ isDisconnected: true })
			.skip(Number(pageNum) * Number(rowsPerPage));

		return res.status(201).send({ users });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}