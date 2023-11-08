import { User } from '../models/User';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWTPAYLOAD, Options } from '../types/auth';
import { PassportStatic } from 'passport';

const options : Options = { jwtFromRequest: () => '', secretOrKey: ''};

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET || '';

export const passportStatic = (passport: PassportStatic) => {
	passport.use(
		new Strategy(options, (jwt_payload: JWTPAYLOAD, done) => {
			User.findById(jwt_payload.id)
				.then((user) => {
					if (user) {
						return done(null, { id: user._id.toString()});
					}
					return done(null, false);
				})
				.catch((err) => {
					console.log(err);
				});
		})
	);
};

