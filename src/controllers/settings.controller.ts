import { Request, Response } from 'express';
import { Package } from '../models/Packages';

export async function createPackage(req: Request, res: Response): Promise<unknown> {
	const { name, amount } = req.body;

	if (!name || name?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!amount || amount?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await Package.findOne({ name });

		if (exists) {
			return res.status(409).send({ err: `A package named ${name} has already been created.` });
		}
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}

	const newPackage = new Package(req.body);

	try {
		await newPackage.save();

		return res.status(201).send({ msg: 'Package has been successfully created.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function updatePackage(req: Request, res: Response): Promise<unknown> {
	const { id, name, amount } = req.body;

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!name || name?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!amount || amount?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await Package.findById(id);

		if (!exists) {
			return res.status(409).send({ err: `A package named ${name} doesn't exist.` });
		}

		exists.name = name;
		exists.amount = amount;

		await exists.save();

		return res.status(201).send({ msg: 'Package has been successfully updated.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}
