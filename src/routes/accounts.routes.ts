import { Router } from 'express';
// import passport from 'passport';
import * as controllers from '../controllers/accounts.controller';

const router = Router();

router.get(
	'/due',
	controllers.getDue
);

router.get(
	'/overdue',
	controllers.getOverdue
);

router.get(
	'/suspended',
	controllers.getSuspended
);

export default router;