import { Request, Response } from 'express';
import { User } from '../models/User';
import moment from 'moment';
import { validationResult } from 'express-validator';

export async function getDue(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';

	try {
		const users = await User
			.find({
				name: {
					$regex: regex,
					$options: 'i'
				},
				last_payment: {
					$lte: moment(new Date()).subtract(30, 'days').toISOString(),
					$gte: moment(new Date()).subtract(35, 'days').toISOString()
				},
				isDisconnected: false,
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage));

		const userCount = await User
			.countDocuments({
				name: {
					$regex: regex,
					$options: 'i',
				},
				last_payment: {
					$lte: moment(new Date()).subtract(30, 'days').toISOString(),
					$gte: moment(new Date()).subtract(35, 'days').toISOString()
				},
				isDisconnected: false,
			});
		
		return res.status(201).send({ users, dataLength: userCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getOverdue(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';
 
	try {
		const users = await User
			.find({
				name: {
					$regex: regex,
					$options: 'i',
				},
				last_payment: {
					$lte: moment(new Date()).subtract(35, 'days').toISOString(),
				},
				isDisconnected: false,
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage));

		const userCount = await User
			.countDocuments({
				name: {
					$regex: regex,
					$options: 'i',
				},
				last_payment: {
					$lte: moment(new Date()).subtract(35, 'days').toISOString(),
				},
				isDisconnected: false,
			});

		return res.status(201).send({ users, dataLength: userCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getSuspended(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';
 
	try {
		const users = await User
			.find({
				name: {
					$regex: regex,
					$options: 'i',
				},
				isDisconnected: true
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage));

		const userCount = await User
			.countDocuments({
				name: {
					$regex: regex,
					$options: 'i',
				},
				isDisconnected: true
			});

		return res.status(201).send({ users, dataLength: userCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getAccrued(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';

	try {
		const users = await User
			.find({
				name: {
					$regex: regex,
					$options: 'i',
				},
				accrued_amount: {
					$gt: 0
				}
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage));

		const userCount = await User
			.countDocuments({
				name: {
					$regex: regex,
					$options: 'i',
				},
				accrued_amount: {
					$gt: 0
				}
			});

		return res.status(201).send({ users, dataLength: userCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}
