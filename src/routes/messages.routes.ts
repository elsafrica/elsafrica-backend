import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/messages.controller';
import { body } from 'express-validator';

const router = Router();

router.get(
	'/init_client',
	passport.authenticate('jwt', { session: false }),
	controllers.requestCilentInit,
);

router.post(
	'/send_message',
	body('idd')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.sendMessageToClient,
);

export default router;