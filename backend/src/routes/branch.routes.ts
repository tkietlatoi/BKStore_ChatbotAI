import { Router } from 'express';
import * as branchController from '../controllers/branch.controller';

const router = Router();

router.get('/', branchController.getBranches);

export default router;
