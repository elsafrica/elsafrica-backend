import { Router } from 'express';
// import passport from 'passport';
import * as controllers from '../controllers/packages.controller';

const router = Router();

router.post(
	'/create',
	controllers.createPackage
);

router.patch(
	'/update',
	controllers.updatePackage
);

router.get(
	'/get',
	controllers.getPackages
);

router.delete(
	'/delete/:id',
	controllers.deletePackage
);

export default router;