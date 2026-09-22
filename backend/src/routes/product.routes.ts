import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.get('/', productController.getProducts);
router.post('/', validateBody(createProductSchema), productController.createProduct);
router.get('/:slug', productController.getProductBySlug);
router.put('/:id', validateBody(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
