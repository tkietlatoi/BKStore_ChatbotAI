import { Router } from 'express';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import branchRoutes from './branch.routes';
import knowledgeRoutes from './knowledge.routes';

const apiRouter = Router();

apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/branches', branchRoutes);
apiRouter.use('/knowledge', knowledgeRoutes);

export default apiRouter;
