import { Router } from 'express';
import passport from 'passport';
import { query } from 'express-validator';
import * as controllers from '../controllers/accounts.controller';

const router = Router();

router.get(
	'/due',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getDue
);

router.get(
	'/overdue',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getOverdue
);

router.get(
	'/suspended',
	query(['rowsPerPage', 'pageNum'])
		.isEmpty()
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	controllers.getSuspended
);

export default router;