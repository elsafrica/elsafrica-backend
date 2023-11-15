import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/messages.controller';

const router = Router();

router.get(
	'/init_client',
	passport.authenticate('jwt', { session: false }),
	controllers.requestCilentInit,
);

router.post(
	'/send_message',
	passport.authenticate('jwt', { session: false }),
	controllers.sendMessageToClient,
);

export default router;