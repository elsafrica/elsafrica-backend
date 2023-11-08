import { sign } from 'jsonwebtoken';
import { User } from '../types/user';

/**
 * Generates a token for user
 *
 * @param {object} user
 * @param {string} secret
 * @param {date} expiresIn
 */
export function generateToken(user: User, secret: string, expiresIn: string) : string {
	const { _id, name, userType } = user;

	return sign({ id: _id, username: name, userType }, secret, { expiresIn });
}