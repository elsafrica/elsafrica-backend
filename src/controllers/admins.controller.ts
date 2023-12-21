import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Admin } from '../models/Admin';

export async function deleteUser(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.params;

	try {
		const exists = await Admin.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The user you are trying to delete doesn\'t exist' });
		}

		await exists.deleteOne();

		return res.status(201).send({ msg: `User ${exists.name} has been deleted.` });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function activate(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { id } = req.body;

	try {
		const exists = await Admin.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The customer you are trying to update doesn\'t exist' });
		}

		exists.isActivated = !exists.isActivated;

		await exists.save();

		return res.status(201).send({ msg: `User ${exists.name} has been ${exists.isActivated ? 'deactivated': 'activated'}.` });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getUsers(req: Request, res: Response): Promise<unknown> {
	const result = validationResult(req);
	if(!result.isEmpty()) {
		return res.status(400).send({ err: 'Bad request, please send valid data to server.', errors: result.array() });
	}

	const { pageNum = 0, rowsPerPage = 10, searchValue } = req.query;
	const regex = searchValue && typeof searchValue === 'string' ? new RegExp(searchValue) : '';

	try {
		const users = await Admin
			.find({
				name: {
					$regex: regex,
					$options: 'i'
				}
			})
			.skip(Number(pageNum) * Number(rowsPerPage))
			.limit(Number(rowsPerPage))
			.sort({
				last_payment: 'desc'
			});

		const userCount = await Admin
			.countDocuments({
				name: {
					$regex: regex,
					$options: 'i',
				},
			});

		return res.status(200).send({ users, dataLength: userCount });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

