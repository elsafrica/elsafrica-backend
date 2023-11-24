import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/customers.controller';
import { body, query } from 'express-validator';
import { csvUploads } from '../middlewares/multer';

const router = Router();

router.post(
	'/new',
	[
		body([
			'firstName',
			'lastName',
			'phone1',
			'package',
			'location'
		])
			.notEmpty(),
		body('email')
			.isEmail(),
		body('ip')
			.notEmpty()
			.custom((value: string) => /^(\.\d\d\d$)|(\.\d\d$)/.test(value)),
		body('customAmount')
			.if(body('package').toLowerCase().equals('custom'))
			.notEmpty()
	],
	passport.authenticate('jwt', { session: false }),
	controllers.create
);

router.patch(
	'/update',
	[
		body([
			'firstName',
			'lastName',
			'phone1',
			'package',
			'location'
		])
			.notEmpty(),
		body('email')
			.isEmail(),
		body('ip')
			.notEmpty()
			.custom((value: string) => /^(\.\d\d\d$)|(\.\d\d$)/.test(value)),
		body('customAmount')
			.if(body('package').toLowerCase().equals('custom'))
			.notEmpty()
	],
	passport.authenticate('jwt', { session: false }),
	controllers.update
);

router.patch(
	'/activate',
	[
		body('id')
			.notEmpty()
			.isMongoId(),
		body('deactivate')
			.notEmpty()
			.isBoolean()
	],
	passport.authenticate('jwt', { session: false }),
	controllers.activate
);

router.patch(
	'/accept_payment',
	body('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.acceptPayment
);

router.patch(
	'/accrue_payment',
	body('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.accruePayment
);

router.patch(
	'/deduct_accrued_debt',
	[
		body('id')
			.notEmpty()
			.isMongoId(),
		body('amount')
			.isNumeric({ no_symbols: true })
	],
	passport.authenticate('jwt', { session: false }),
	controllers.deductAccruedDebt
);
	
router.get(
	'/send_mail/:id',
	passport.authenticate('jwt', { session: false }),
	controllers.sendMail
);
		
router.get(
	'/get_customers',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getCustomers
);

router.post(
	'/upload_csv',
	passport.authenticate('jwt', { session: false }),
	csvUploads.single('file'),
	controllers.populateDBWithCSV
);

export default router;