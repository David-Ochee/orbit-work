import { Router } from 'express';
import * as ctrl from '../controllers/users';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id', ctrl.getUser);
router.put('/:id', authenticate, ctrl.updateUser);
router.get('/:id/reputation', ctrl.getReputation);

export default router;
