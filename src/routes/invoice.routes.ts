import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/invoice.controller';
import { body, query, param } from 'express-validator';

const router = Router();

router.post(
	'/create',
	[
		body([
			'number',
			'to',
		])
			.notEmpty(),
		body([
			'date',
			'dueDate'
		])
			.notEmpty(),
		body('items')
			.notEmpty()
			.isArray({ min: 1 }),
		body([
			'tax',
			'discount',
			'shipping'
		])
			.isNumeric({ no_symbols: true })
	],
	passport.authenticate('jwt', { session: false }),
	controllers.createInvoice
);

router.get(
	'/get',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getInvoices
);

router.get(
	'/latest-invoice',
	passport.authenticate('jwt', { session: false }),
	controllers.getRecentInvoiceNumber
);

router.get(
	'/download/:id',
	param('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.downloadInvoice
);

router.delete(
	'/delete/:id',
	param('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.deleteInvoice
);

export default router;