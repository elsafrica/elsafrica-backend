import { Router } from 'express';
// import passport from 'passport';
import * as controllers from '../controllers/settings.controller';

const router = Router();

router.post(
	'/create',
	controllers.createPackage
);

router.post(
	'/update',
	controllers.updatePackage
);

export default router;