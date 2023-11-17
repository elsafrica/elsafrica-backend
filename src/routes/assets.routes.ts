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
			.if(body('assetType').toLowerCase().equals('other'))
			.notEmpty()
			.custom((value: string) => /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)),
		body('belongsTo')
			.notEmpty(),
		body('location')
			.notEmpty(),
		body('assetType')
			.notEmpty(),
		body('assetPrice')
			.notEmpty(),
		body('isForCompany')
			.notEmpty()
			.customSanitizer((value: string) => value.toLowerCase() === 'yes'),
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