import { Router } from 'express';
// import passport from 'passport';
import * as controllers from '../controllers/customers.controller';

const router = Router();

router.post(
	'/create',
	controllers.create
);

router.patch(
	'/update',
	controllers.update
);

router.patch(
	'/activate',
	// passport.authenticate('jwt', { session: false }),
	controllers.activate
);

router.patch(
	'/accept_payment',
	controllers.acceptPayment
);
	
router.get(
	'/send_mail/:id',
	controllers.sendMail
);
		
router.get(
	'/get_customers',
	controllers.getCustomers
);

export default router;