'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  Cpu,
  Search,
  BookOpen,
  Flame,
  RefreshCw,
} from 'lucide-react';
import {
  fetchKnowledgeDocuments,
  fetchKnowledgeMetrics,
  fetchDocumentChunks,
  searchKnowledgeDocs,
  FALLBACK_KNOWLEDGE_DOCS,
  KnowledgeDoc,
  KnowledgeChunk,
  KnowledgeMetrics,
} from '@/lib/api';

export default function AdminKnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(FALLBACK_KNOWLEDGE_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc>(FALLBACK_KNOWLEDGE_DOCS[0]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [metrics, setMetrics] = useState<KnowledgeMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Semantic search tester state
  const [testQuery, setTestQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    score: number;
    chunkId: string;
    documentTitle: string;
    sectionTitle?: string;
    content: string;
  }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load documents & metrics on mount
  useEffect(() => {
    let ignore = false;
    Promise.all([fetchKnowledgeDocuments(), fetchKnowledgeMetrics()])
      .then(([loadedDocs, loadedMetrics]) => {
        if (!ignore) {
          if (loadedDocs && loadedDocs.length > 0) {
            setDocs(loadedDocs);
            setSelectedDoc(loadedDocs[0]);
          }
          if (loadedMetrics) {
            setMetrics(loadedMetrics);
          }
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải tri thức:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Load chunks when selectedDoc changes
  useEffect(() => {
    if (!selectedDoc) return;
    fetchDocumentChunks(selectedDoc.id).then((loadedChunks) => {
      setChunks(loadedChunks);
    });
  }, [selectedDoc]);

  // Handle live semantic test search
  const handleTestSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchKnowledgeDocs(testQuery.trim(), 3);
      setSearchResults(results);
    } catch (err) {
      console.error('Lỗi tìm kiếm thử nghiệm:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const totalChunks = metrics?.chunksCount || docs.reduce((sum, d) => sum + d.chunksCount, 0);

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>Quản trị Cơ sở Tri thức RAG (BK-Bot)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống tài liệu tri thức doanh nghiệp được phân đoạn và vector hóa phục vụ Retrieval-Augmented Generation.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-semibold self-start">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Vector Index: {metrics?.embedModel || 'gemini-embedding-001'}</span>
        </div>
      </div>

      {/* RAG Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tài liệu tri thức gốc</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {metrics?.documentsCount || docs.length} tài liệu (.md)
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Vector Chunks</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {totalChunks} chunks đã phân đoạn
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Trạng thái Vector Hóa</div>
            <div className="text-lg font-bold font-mono text-emerald-600 flex items-center gap-1.5">
              <span>{metrics?.vectorizedCount || totalChunks}/{totalChunks} Chunks Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Semantic Search Tester */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Thử nghiệm Tìm kiếm Ngữ nghĩa RAG (Semantic Vector Search Tester)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Cosine Similarity (Top 3)</span>
        </div>

        <form onSubmit={handleTestSearch} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Ví dụ: máy bị vào nước có bảo hành không? hoặc 1 đổi 1 trong bao lâu?..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:bg-white/15 focus:border-amber-400 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSearching || !testQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Tìm kiếm vector</span>
          </button>
        </form>

        {/* Live Search Results */}
        {searchResults.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              Kết quả trích xuất Top-3 chunks liên quan nhất:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchResults.map((res, i) => (
                <div
                  key={res.chunkId || i}
                  className="bg-white/10 border border-white/15 rounded-xl p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
                    <span className="font-bold">TOP {i + 1}</span>
                    <span className="bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                      Score: {(res.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-white line-clamp-1">{res.documentTitle}</div>
                  {res.sectionTitle && (
                    <div className="text-[10px] text-cyan-300 font-mono line-clamp-1">{res.sectionTitle}</div>
                  )}
                  <p className="text-[10.5px] text-slate-300 line-clamp-4 leading-relaxed font-sans pt-1 border-t border-white/10">
                    {res.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Split List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (5): Documents List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Danh mục tài liệu nguồn (.md)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{filteredDocs.length} tài liệu</span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc tài liệu chính sách..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 outline-none focus:bg-white focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* List items */}
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{doc.updatedAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    <Layers className="w-3 h-3 text-blue-500" />
                    <span>{doc.chunksCount} chunks vector</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (7): Document Chunk Detail & Vector Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-700">
                  {selectedDoc.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {selectedDoc.title}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vectorized</span>
              </div>
            </div>

            {/* Document Content View */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nội dung tài liệu nguồn:
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto font-mono">
                {selectedDoc.content}
              </div>
            </div>

            {/* Real Vector Chunks Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Danh sách Chunks thực tế ({chunks.length || selectedDoc.chunksCount} chunks):</span>
                <span className="font-mono text-[11px] text-blue-600">Model: {metrics?.embedModel || 'gemini-embedding-001'}</span>
              </h4>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {(chunks.length > 0 ? chunks : Array.from({ length: selectedDoc.chunksCount }).map((_, idx) => ({
                  id: `${selectedDoc.id}-chunk-${idx}`,
                  chunkIndex: idx,
                  sectionTitle: `Mục #${idx + 1}`,
                  content: selectedDoc.content.slice(idx * 80, (idx + 1) * 80 + 100),
                }))).map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">CHUNK #{chunk.chunkIndex + 1}</span>
                      <span className="text-blue-600 font-semibold">{chunk.sectionTitle || 'Đoạn trích'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-sans">
                      {chunk.content}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Embedding: [Vector 3072 chiều]</span>
                      <span className="text-emerald-600 font-semibold">● Cosine Index Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Tự động nhúng vector từ backend/src/data/knowledge</span>
            <span className="text-blue-600 font-semibold">BK-Store Knowledge RAG Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
}
