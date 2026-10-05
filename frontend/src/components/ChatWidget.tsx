'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  PackageCheck,
  Building2,
  CheckCircle2,
  RotateCcw,
  Store,
  Eye,
} from 'lucide-react';
import { ChatMessage, Product } from '@/types';
import { sendChatMessage, fetchProductBySlug } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  initialPrompt?: string;
  onQuickView?: (product: Product) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  initialPrompt,
  onQuickView,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Xin chào! Tôi là **BK-Bot**, trợ lý AI kỹ thuật của BK-Store.\n\nTôi có thể giúp bạn:\n• 💻 **Tư vấn cấu hình** laptop, điện thoại theo nhu cầu & túi tiền\n• 🏢 **Kiểm tra tồn kho thực tế** tại 3 chi nhánh (Hà Nội, TP.HCM, Đà Nẵng)\n• 🚚 **Tra cứu vận đơn & tiến trình đơn hàng** theo mã đơn\n• 📖 **Giải đáp chính sách** bảo hành 1 đổi 1 trong 30 ngày, đổi trả & trả góp\n\nBạn đang quan tâm đến sản phẩm hoặc cần hỗ trợ gì ạ?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const lastPromptRef = useRef<string>('');
  const addItem = useCartStore((state) => state.addItem);

  const quickPrompts = [
    'Tư vấn laptop AI & Lập trình 30-50 triệu',
    'MacBook Air M3 ở Cầu Giấy còn hàng không?',
    'Kiểm tra đơn hàng mẫu #BK-1024',
    'Chính sách đổi mới 30 ngày tại BK-Store',
  ];

  const handleAddToCart = (e: React.MouseEvent, prod: any) => {
    e.stopPropagation();
    const productObj: Product = {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand,
      price: Number(prod.price),
      originalPrice: prod.originalPrice ? Number(prod.originalPrice) : undefined,
      thumbnail: prod.thumbnail,
      images: prod.images || [prod.thumbnail],
      specs: prod.specs || {},
      description: prod.description || '',
      stock: prod.stockQuantity ?? prod.stock ?? 10,
    };

    addItem(productObj, 1);
    setAddedItemIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  const handleOpenQuickView = async (prod: any) => {
    if (!onQuickView) return;

    const baseProduct: Product = {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand,
      price: Number(prod.price),
      originalPrice: prod.originalPrice ? Number(prod.originalPrice) : undefined,
      thumbnail: prod.thumbnail,
      images: prod.images && prod.images.length > 0 ? prod.images : [prod.thumbnail],
      specs: prod.specs && typeof prod.specs === 'object' && Object.keys(prod.specs).length > 0 ? prod.specs : {},
      description: prod.description || prod.specsSummary || '',
      stock: prod.stockQuantity ?? prod.stock ?? 10,
    };

    if (Object.keys(baseProduct.specs).length === 0 || baseProduct.images.length <= 1) {
      try {
        const fullProd = await fetchProductBySlug(prod.slug || prod.id);
        if (fullProd) {
          onQuickView(fullProd);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch full product for quick view:', err);
      }
    }

    onQuickView(baseProduct);
  };

  const handleSendPrompt = React.useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      // Build history for context using stable ref
      const historyPayload = messagesRef.current.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const responseData = await sendChatMessage({
          message: text.trim(),
          history: historyPayload,
        });

        const botMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: responseData.reply,
          cards: responseData.cards,
          citations: responseData.citations,
          toolUsed: responseData.toolUsed,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        console.error('Lỗi khi gửi tin nhắn cho AI:', err);
        const errorMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content:
            'Dạ, hiện tại kết nối đến hệ thống máy chủ BK-Store đang bận. Anh/chị có thể thử lại sau giây lát hoặc liên hệ hotline miễn phí **1800 6868** để được tư vấn viên hỗ trợ ngay ạ!',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping]
  );

  const handleClearHistory = () => {
    lastPromptRef.current = '';
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          'Đã làm mới cuộc trò chuyện! Tôi là **BK-Bot**, trợ lý AI của BK-Store. Tôi có thể hỗ trợ gì cho bạn ngay bây giờ ạ?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && initialPrompt !== lastPromptRef.current) {
      lastPromptRef.current = initialPrompt;
      const timer = setTimeout(() => {
        handleSendPrompt(initialPrompt);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, handleSendPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 text-white hover:bg-slate-700'
            : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-500/30 ring-4 ring-blue-500/20'
        }`}
        title="Trò chuyện cùng AI BK-Bot"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-6 h-6 text-cyan-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse"></span>
            </div>
            <span className="text-xs font-bold pr-1 hidden sm:inline tracking-wide">Hỏi BK-Bot AI</span>
          </>
        )}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-[88px] z-40 w-[calc(100vw-32px)] sm:w-[450px] h-[520px] sm:h-[calc(100vh-145px)] max-h-[760px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>BK-Bot Assistant</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live RAG & Tools
                  </span>
                </h3>
                <span className="text-[10px] text-slate-300">Tư vấn kỹ thuật • Tra cứu kho & Vận đơn 24/7</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5 text-cyan-200" />
                  </div>
                )}

                <div className={`max-w-[88%] space-y-2.5`}>
                  {/* Text Bubble */}
                  <div
                    className={`rounded-2xl p-3.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm whitespace-pre-wrap'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-xs text-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-sm font-bold text-slate-900 mt-2.5 mb-1.5 flex items-center gap-1.5">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xs font-bold text-blue-900 mt-2 mb-1 pb-1 border-b border-slate-100 flex items-center gap-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed text-slate-700">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-900">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 space-y-1 my-1.5 text-slate-700 marker:text-blue-500">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 space-y-1 my-1.5 text-slate-700 marker:text-blue-600 marker:font-semibold">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed pl-0.5">
                              {children}
                            </li>
                          ),
                          code: ({ children }) => (
                            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[11px] border border-slate-200/80">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-blue-500 pl-3 my-2 text-slate-600 italic bg-blue-50/50 py-1 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline font-medium"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* INTERACTIVE CARDS */}
                  {/* 1. PRODUCT CARDS */}
                  {msg.cards?.type === 'products' && Array.isArray(msg.cards.data) && msg.cards.data.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span>Sản phẩm gợi ý từ hệ thống</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.cards.data.map((prod: any) => (
                          <div
                            key={prod.id}
                            onClick={() => handleOpenQuickView(prod)}
                            className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex gap-3 items-center cursor-pointer group"
                          >
                            <img
                              src={prod.thumbnail}
                              alt={prod.name}
                              className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                                {prod.brand}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors" title={prod.name}>
                                {prod.name}
                              </h4>
                              {prod.specsSummary && (
                                <p className="text-[10px] text-slate-500 truncate">{prod.specsSummary}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-bold text-blue-600">
                                  {prod.formattedPrice ||
                                    new Intl.NumberFormat('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND',
                                    }).format(Number(prod.price))}
                                </span>
                                {prod.discountPercent && (
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                                    -{prod.discountPercent}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleAddToCart(e, prod)}
                                className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center transition-all ${
                                  addedItemIds[prod.id]
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                                }`}
                                title="Thêm vào giỏ hàng"
                              >
                                {addedItemIds[prod.id] ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleOpenQuickView(prod)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-[10px] flex items-center justify-center transition-colors"
                                title="Xem chi tiết nhanh"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. ORDER TRACKING CARD */}
                  {msg.cards?.type === 'order' && msg.cards.data && (
                    <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <PackageCheck className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-slate-900">{msg.cards.data.orderCode}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {msg.cards.data.statusLabel}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Khách hàng:</span>
                          <span className="font-semibold text-slate-800">{msg.cards.data.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tổng tiền:</span>
                          <span className="font-bold text-blue-600">{msg.cards.data.formattedTotal}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-700 mt-1 border border-slate-100">
                          <span className="font-semibold">Lộ trình:</span> {msg.cards.data.trackingInfo}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. INVENTORY STOCK CARD */}
                  {msg.cards?.type === 'inventory' && msg.cards.data && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900 truncate max-w-[180px]">
                            {msg.cards.data.product?.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tổng kho: {msg.cards.data.totalStock} máy
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-0.5">
                        {msg.cards.data.branches?.map((b: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">{b.branchName}</p>
                              <p className="text-slate-500 text-[9px] truncate max-w-[180px]">{b.address}</p>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                b.status === 'Còn hàng'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'Sắp hết hàng'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {b.status} ({b.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic bg-white p-2.5 rounded-xl border border-slate-200/60 w-fit">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce delay-200"></div>
                </div>
                <span className="text-[11px]">BK-Bot đang tra cứu tri thức & dữ liệu kho...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                disabled={isTyping}
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-full border border-slate-200 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <span>{p}</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="p-3 border-t border-slate-200/90 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Nhập câu hỏi công nghệ hoặc mã đơn (#BK-1024)..."
              className="flex-1 bg-slate-100 text-xs text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-400 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
