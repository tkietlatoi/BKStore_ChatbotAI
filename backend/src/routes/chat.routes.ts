import { Router } from 'express';
import { handleChatMessage } from '../controllers/chat.controller';

const router = Router();

// POST /api/chat - Gửi câu hỏi đến AI BK-Bot (hỗ trợ cả JSON và SSE streaming)
router.post('/', handleChatMessage);

export default router;
