import { Router } from 'express';
import * as ctrl from '../controllers/applications';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationSchema } from '../models/application';

const router = Router();

router.get('/', ctrl.listApplications);
router.post('/', authenticate, validate(createApplicationSchema), ctrl.createApplication);
router.put('/:id', authenticate, validate(updateApplicationSchema), ctrl.updateApplication);

export default router;
