import { Router } from 'express';
import passport from 'passport';
import * as controllers from '../controllers/assets.controller';

const router = Router();

router.post(
	'/create',
	passport.authenticate('jwt', { session: false }),
	controllers.createAsset
);

router.get(
	'/get',
	passport.authenticate('jwt', { session: false }),
	controllers.getAssets
);

router.delete(
	'/delete/:id',
	passport.authenticate('jwt', { session: false }),
	controllers.deleteAsset
);

export default router;