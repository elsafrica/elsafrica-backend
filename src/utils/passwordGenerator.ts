import { compare, genSalt, hash } from 'bcryptjs';

export async function generatePassword(password: string) : Promise<string> {
	const salt = await genSalt(10);

	const hashedPassword = await hash(password, salt);

	return hashedPassword;
}

export async function comparePassword(password: string, hash: string) : Promise<boolean> {
	return await compare(password, hash);
}