import { Admin as User } from '../models/Admin';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWTPAYLOAD, Options } from '../types/auth';
import { PassportStatic } from 'passport';
import { NextFunction, Request, Response } from 'express';

const options : Options = { jwtFromRequest: () => '', secretOrKey: ''};

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET || '';

export const passportStatic = (passport: PassportStatic) => {
	passport.use(
		new Strategy(options, (jwt_payload: JWTPAYLOAD, done) => {
			User.findById(jwt_payload.id)
				.then((user) => {
					if (user) {
						return done(null, { id: user._id.toString(), userType: user.userType });
					}
					return done(null, false);
				})
				.catch((err) => {
					console.log(err);
				});
		})
	);
};

export const isSuperUser = async (req: Request, res: Response, next: NextFunction) => {
	const { userType } = req.user as { userType: string };
	
	if (userType && userType.toLowerCase() === 'super') {
		return next();
	}

	res.status(401).send({ err: 'You are not allowed to perform this action.'});
};


