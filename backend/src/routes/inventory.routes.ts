import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/', inventoryController.getInventory);
router.put('/', inventoryController.updateInventory);
router.post('/transfer', inventoryController.transferStock);

export default router;
