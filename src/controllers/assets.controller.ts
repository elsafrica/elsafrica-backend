import { Request, Response } from 'express';
import { Asset } from '../models/Assets';
import { User } from '../models/User';

export async function createAsset(req: Request, res: Response): Promise<unknown> {
	const { name, macAddress, location, belongsTo } = req.body;

	if (!name || name?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!macAddress || macAddress?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!location || location?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	if (!belongsTo || belongsTo?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await Asset.findOne({ mac_address: macAddress });
		const userExists = await User.findOne({
			ip: belongsTo
		});

		if (exists) {
			return res.status(409).send({ err: `An asset using mac address ${macAddress} has already been registered.` });
		}

		if (!userExists) {
			return res.status(404).send({ err: 'The user tied to the asset you are attempting to add doesn\'t exist.' });
		}

		const newAsset = new Asset(req.body);
		newAsset.mac_address = macAddress;
		newAsset.belongs_to = userExists.id;

		await newAsset.save();
	
		return res.status(201).send({ msg: 'Asset has been successfully registered.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function getAssets(req: Request, res: Response): Promise<unknown> {
	const { pageNum = 0, rowsPerPage = 10 } = req.query;

	try {
		const assets = await Asset
			.find({})
			.populate('belongs_to')
			.skip(Number(pageNum) * Number(rowsPerPage));

		return res.status(200).send({ assets });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}

export async function deleteAsset(req: Request, res: Response): Promise<unknown> {
	const { id } = req.params;

	if (!id || id?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request' });
	}

	try {
		const exists = await Asset.findById(id);

		if (!exists) {
			return res.status(409).send({ err: 'The package you are attempting to deleete doesn\'t exist.' });
		}

		await Asset.findByIdAndDelete(id);

		return res.status(201).send({ msg: 'Package has been successfully deleted.' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured' });
	}
}