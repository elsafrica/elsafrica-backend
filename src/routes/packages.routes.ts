import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/packages.controller';
import { body, param } from 'express-validator';

const router = Router();

router.post(
	'/create',
	body(['name', 'amount'])
		.trim()
		.notEmpty()
		.escape(),
	passport.authenticate('jwt', { session: false }),
	controllers.createPackage
);

router.patch(
	'/update',
	[
		body(['name', 'amount'])
			.notEmpty(),
		body('id')
			.notEmpty()
			.isMongoId(),
	],
	passport.authenticate('jwt', { session: false }),
	controllers.updatePackage
);

router.get(
	'/get',
	passport.authenticate('jwt', { session: false }),
	controllers.getPackages
);

router.delete(
	'/delete/:id',
	param('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.deletePackage
);

export default router;