import { Router } from 'express';
import * as ctrl from '../controllers/bounties';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBountySchema, updateBountySchema } from '../models/bounty';

const router = Router();

router.get('/', ctrl.listBounties);
router.get('/:id', ctrl.getBounty);
router.post('/', authenticate, validate(createBountySchema), ctrl.createBounty);
router.put('/:id', authenticate, validate(updateBountySchema), ctrl.updateBounty);
router.delete('/:id', authenticate, ctrl.deleteBounty);

export default router;
