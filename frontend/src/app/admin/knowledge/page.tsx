'use client';

import React, { useState } from 'react';
import {
  Database,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  Cpu,
  Search,
  BookOpen,
} from 'lucide-react';
import { FALLBACK_KNOWLEDGE_DOCS, KnowledgeDoc } from '@/lib/api';

export default function AdminKnowledgePage() {
  const [docs] = useState<KnowledgeDoc[]>(FALLBACK_KNOWLEDGE_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc>(FALLBACK_KNOWLEDGE_DOCS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const totalChunks = docs.reduce((sum, d) => sum + d.chunksCount, 0);

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
            Quản lý tài liệu tri thức doanh nghiệp được nhúng vector (embedding 768 chiều) phục vụ Retrieval-Augmented Generation.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-semibold self-start">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>PGVector: HNSW Index Active</span>
        </div>
      </div>

      {/* RAG Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tài liệu tri thức</div>
            <div className="text-lg font-bold font-mono text-slate-900">{docs.length} tài liệu gốc</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Vector Chunks</div>
            <div className="text-lg font-bold font-mono text-slate-900">{totalChunks} chunks đã phân đoạn</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Mô hình Embedding</div>
            <div className="text-lg font-bold font-mono text-slate-900">text-embedding-004 (768d)</div>
          </div>
        </div>
      </div>

      {/* Main Content: Split List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (5): Documents List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Danh mục tài liệu nguồn</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{filteredDocs.length} tài liệu</span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tài liệu chính sách..."
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
                <span>Indexed</span>
              </div>
            </div>

            {/* Document Content View */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nội dung tài liệu gốc:
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedDoc.content}
              </div>
            </div>

            {/* Simulated Vector Chunks Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Phân đoạn Vector Chunks (Kích thước ~500 ký tự / Overlap 50):</span>
                <span className="font-mono text-[11px] text-blue-600">{selectedDoc.chunksCount} Chunks</span>
              </h4>

              <div className="space-y-2">
                {Array.from({ length: selectedDoc.chunksCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">CHUNK #{idx + 1}</span>
                      <span>Vector ID: doc-{selectedDoc.id}-c{idx + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-sans">
                      {selectedDoc.content.slice(idx * 70, (idx + 1) * 70 + 80)}...
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span>Embedding: [0.0342, -0.0125, 0.0891, ... +765 dims]</span>
                      <span className="text-emerald-600 font-semibold">● Cosine Index</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Tự động nhúng vector khi cập nhật nội dung</span>
            <span className="text-blue-600 font-semibold">BK-Store Knowledge Engine 2.4</span>
          </div>
        </div>

      </div>
    </div>
  );
}
