import { Router } from 'express';
import {
  getKnowledgeDocuments,
  getKnowledgeMetrics,
  getDocumentChunks,
  searchKnowledge,
} from '../controllers/knowledge.controller';

const router = Router();

router.get('/', getKnowledgeDocuments);
router.get('/metrics', getKnowledgeMetrics);
router.get('/search', searchKnowledge);
router.get('/:docId/chunks', getDocumentChunks);

export default router;
