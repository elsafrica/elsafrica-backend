import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/admins.controller';
import { body, param, query } from 'express-validator';
import { isSuperUser } from '../middlewares/auth';

const router = Router();

router.post(
	'/activate',
	body('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	isSuperUser,
	controllers.activate
);

router.delete(
	'/delete/:id',
	param('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	isSuperUser,
	controllers.deleteUser
);
		
router.get(
	'/get',
	query(['rowsPerPage', 'pageNum'])
		.isNumeric({ no_symbols: true }),
	passport.authenticate('jwt', { session: false }),
	isSuperUser,
	controllers.getUsers
);

export default router;