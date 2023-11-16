import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/assets.controller';
import { body, query, param } from 'express-validator';

const router = Router();

router.post(
	'/create',
	[
		body('name')
			.notEmpty(),
		body('macAddress')
			.notEmpty()
			.custom((value: string) => /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)),
		body('belongsTo')
			.notEmpty(),
		body('location')
			.notEmpty(),
	],
	passport.authenticate('jwt', { session: false }),
	controllers.createAsset
);

router.get(
	'/get',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getAssets
);

router.delete(
	'/delete/:id',
	param('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.deleteAsset
);

export default router;