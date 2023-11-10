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

export default router;