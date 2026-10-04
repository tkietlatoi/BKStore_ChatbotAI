import { Request, Response } from 'express';
import { ragService } from '../services/rag.service';

export const getKnowledgeDocuments = async (_req: Request, res: Response) => {
  try {
    const docs = ragService.getDocuments();
    return res.json({
      success: true,
      data: docs,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi lấy danh sách tài liệu',
    });
  }
};

export const getKnowledgeMetrics = async (_req: Request, res: Response) => {
  try {
    const metrics = ragService.getMetrics();
    return res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi lấy thống kê RAG',
    });
  }
};

export const getDocumentChunks = async (req: Request, res: Response) => {
  try {
    const docId = String(req.params.docId);
    const chunks = ragService.getChunksByDocId(docId);
    return res.json({
      success: true,
      data: chunks,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi lấy danh sách chunks',
    });
  }
};

export const searchKnowledge = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const topK = parseInt(req.query.limit as string) || 3;

    if (!query.trim()) {
      return res.json({ success: true, data: [] });
    }

    const results = await ragService.search(query, topK);
    return res.json({
      success: true,
      data: results.map((r) => ({
        score: r.score,
        chunkId: r.chunk.id,
        documentTitle: r.chunk.documentTitle,
        sectionTitle: r.chunk.sectionTitle,
        content: r.chunk.content,
      })),
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi tìm kiếm tri thức',
    });
  }
};
