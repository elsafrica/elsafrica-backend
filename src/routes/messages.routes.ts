import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/messages.controller';
import { body } from 'express-validator';
import { multimediaUpload } from '../middlewares/multer';

const router = Router();

router.get(
	'/init_client',
	passport.authenticate('jwt', { session: false }),
	controllers.requestCilentInit,
);

router.post(
	'/send_message',
	body('id')
		.notEmpty()
		.isMongoId(),
	passport.authenticate('jwt', { session: false }),
	controllers.sendMessageToClient,
);

router.get(
	'/send_test_message',
	passport.authenticate('jwt', { session: false }),
	controllers.sendTestMessage,
);

router.post(
	'/broadcast_message',
	multimediaUpload.single('file'),
	body('message')
		.notEmpty(),
	passport.authenticate('jwt', { session: false }),
	controllers.broadCastMessage,
);

router.post(
	'/broadcast_status_message',
	multimediaUpload.single('file'),
	body('status')
		.notEmpty(),
	passport.authenticate('jwt', { session: false }),
	controllers.broadcastMessageToClient,
);

export default router;