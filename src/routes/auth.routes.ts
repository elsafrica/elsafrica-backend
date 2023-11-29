import { Router } from 'express';
import * as controllers from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();

router.post(
	'/sign_up',
	body([
		'firstName',
		'lastName',
		'phoneNo',
		'password',
		'email'
	])
		.notEmpty(),
	controllers.signUp
);

router.post(
	'/sign_in',
	body([
		'password',
		'email'
	])
		.notEmpty(),
	controllers.login
);

router.post(
	'/change_password',
	body([
		'password',
		'newPassword',
		'confirmPassword',
	])
		.notEmpty(),
	controllers.changePassword
);

router.post(
	'/reset_password',
	body([
		'email'
	])
		.notEmpty(),
	controllers.forgotPassword
);

router.post(
	'/new_password',
	body([
		'password',
		'sentToken'
	])
		.notEmpty(),
	controllers.newPassword
);

export default router;