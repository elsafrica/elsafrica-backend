import { Router } from 'express';
import * as controllers from '../controllers/auth.controller';

const router = Router();

router.post(
	'/sign_up',
	controllers.signUp
);

router.post(
	'/sign_in',
	controllers.login
);

export default router;