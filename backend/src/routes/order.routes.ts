import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema';

const router = Router();

router.get('/', orderController.getOrders);
router.post('/', validateBody(createOrderSchema), orderController.createOrder);
router.get('/:orderCode', orderController.getOrder);
router.patch('/:orderCode/status', validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
