import { Request, Response } from 'express';
import { settings } from '../config/config';
import { User } from '../models/User';
import { generatePassword, comparePassword } from '../utils/passwordGenerator';
import { generateToken } from '../utils/tokenGenerator';

export async function signUp (req: Request, res: Response) : Promise<unknown> {
	const { email, firstName, lastName, password, mobileNo, businessName } = req.body;

	if (!email || email?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	if (!firstName || firstName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	if (!lastName || lastName?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	if (!password || password?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	// if (!mobileNo || mobileNo?.trim() == '') {
	// 	return res.status(400).send({ err: 'Error: Bad request'});
	// }

	// if (!businessName || businessName?.trim() == '') {
	// 	return res.status(400).send({ err: 'Error: Bad request'});
	// }

	try {
		const exists = await User.findOne({ email });

		if (exists) {
			return res.status(409).send({ err: `A user has already been registered with this name: ${exists.name}`});
		}
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
		console.log(error);
		
	}

	const newUser = new User({
		email,
		firstName,
		lastName,
		businessName,
		mobileNo,
	});

	try {
		const hashedPassword = await generatePassword(password);
		newUser.password = hashedPassword;

		await newUser.save();

		const token = generateToken(newUser, settings.secret, '365d');

		return res.status(201).send({ msg: 'Your account has been created', token, userId: newUser.id });
	} catch (error) {
		console.log(error);
		
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}
}

export async function login (req: Request, res: Response) : Promise<unknown> {
	const { email, password } = req.body;

	if (!email || email?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	if (!password || email?.trim() == '') {
		return res.status(400).send({ err: 'Error: Bad request'});
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).send({ err: 'Error: Unauthorized. Wrong username or password'});
		}

		const isCorrectPassword = await comparePassword(password, user.password || '');

		if (!isCorrectPassword) {
			return res.status(401).send({ err: 'Error: Unauthorized. Wrong username or password'});
		}

		const token = generateToken(user, settings.secret, '365d');

		return res.status(200).send({ msg: 'Login successful', token, userId: user.id });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}
}
