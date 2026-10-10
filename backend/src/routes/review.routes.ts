import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { createReviewSchema } from '../schemas/review.schema';

const router = Router();

router.post('/', validateBody(createReviewSchema), reviewController.createReview);
router.get('/product/:slug', reviewController.getProductReviews);
router.get('/order/:orderCode', reviewController.getOrderReviews);

export default router;
