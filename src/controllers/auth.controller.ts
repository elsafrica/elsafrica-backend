import { Request, Response } from 'express';
import { settings } from '../config/config';
import { Admin as User } from '../models/Admin';
import { generatePassword, comparePassword } from '../utils/passwordGenerator';
import { generateToken } from '../utils/tokenGenerator';
import { validationResult } from 'express-validator';
import { sendEmail } from '../utils/mail';
import { generateRandomString } from '../utils/randomString';
import moment from 'moment';

export async function signUp (req: Request, res: Response) : Promise<unknown> {
	const result = validationResult(req);

	if(!result.isEmpty())
		return res.status(401).send({ err: 'Error: Bad requests', errors: result.array() });

	const { email, firstName, lastName, phoneNo, password } = req.body;

	try {
		const exists = await User.findOne({ email });

		if (exists) {
			return res.status(409).send({ err: `A user has already been registered with this email: ${exists.email}`});
		}
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}

	const newUser = new User({
		email,
		name: firstName + ' ' + lastName,
		phoneNo,
	});

	try {
		const hashedPassword = await generatePassword(password);
		newUser.password = hashedPassword;

		await newUser.save();

		const token = generateToken(newUser, settings.secret, '365d');

		const user: { email: string, id: string } = {
			email: newUser.email,
			id: newUser.id,
		};

		return res.status(201).send({ msg: 'Your account has been created', token, user });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}
}

export async function login (req: Request, res: Response) : Promise<unknown> {
	const result = validationResult(req);

	if(!result.isEmpty())
		return res.status(401).send({ err: 'Error: Bad requests', errors: result.array() });

	const { email, password } = req.body;

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

		const userDetails: { email: string, id: string } = {
			email: user.email,
			id: user.id,
		};

		return res.status(200).send({ msg: 'Login successful', token, user: userDetails });
	} catch (error) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}
}

export async function changePassword (req: Request, res: Response) : Promise<unknown> {
	const result = validationResult(req);

	if(!result.isEmpty())
		return res.status(401).send({ err: 'Error: Bad requests', errors: result.array() });

	const { password, newPassword, confirmNewPassword } = req.body;
	const { id } = req.user as { id: string };

	try {
		const user = await User.findById(id);

		if (!user) {
			return res.status(401).send({ err: 'Error: Unauthorized. Wrong username or password'});
		}

		const isValidPassword = await comparePassword(password, user.password || '');

		if (!isValidPassword){
			return res.status(400).send({ err: 'Error: Invalid Old Password' });
		}

		if (newPassword !== confirmNewPassword) {
			return res.status(400).send({ err: 'Passwords don\'t match' });
		}

		user.password = await generatePassword(newPassword);
		await user.save();

		return res.status(200).json({ msg: 'Your password has been updated' });
	} catch (err) {
		return res.status(500).send({ err: 'Error: An internal server error has occured'});
	}
}

export async function forgotPassword (req: Request, res: Response) : Promise<unknown> {
	const result = validationResult(req);

	if(!result.isEmpty())
		return res.status(401).send({ err: 'Error: Bad requests', errors: result.array() });

	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
									
		if (!user) {
			res
				.status(422)
				.send({
					msg: 'The email does not exist, try to create an account if you don\'t have one'
				});

			return;
		}

		const token = generateRandomString(48);

		const mailOptions = {
			to: user.email,
			subject: 'Password reset',
			html: `
				<p>Use the link below to reset your password.</p>
				<p>This link <b>expires in 20 minutes.</b></p>
				<p><a href="${process.env.CLIENT_HOST}/auth/confirm_reset/${token}">Link to reset</a></p>
			`
		};

		await User.updateOne({ email: email }, {
			resetToken: token,
			tokenExpiresAt: moment().add(20, 'minutes').toISOString(),
		});

		await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

		res.status(200).send({ msg: 'An E-mail has been sent to you for password reset' });
	} catch (error) {
		return res.status(500).send({ err: 'Error: Internal server error' });
	}
}

export async function newPassword (req: Request, res: Response) : Promise<unknown> {
	const { password, sentToken } = req.body;

	try {
		const user = await User.findOne({
			resetToken: sentToken,
			tokenExpiresAt: {
				$gt: new Date().toISOString(),
			}
		});
														
		if(!user) {
			return res.status(422)
				.send({
					err: 'Try to reset you password again, your session has expired'
				});

		} else {
			const hashedPassword = await generatePassword(password);
			user.password = hashedPassword;

			await user.save();

			res.send({ msg: 'Password update success' });
		}

	} catch {
		return res.status(500).send({ err: 'Error: Internal server error' });
	}
}
