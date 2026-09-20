import { Router } from 'express';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import branchRoutes from './branch.routes';

const apiRouter = Router();

apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/branches', branchRoutes);

export default apiRouter;
