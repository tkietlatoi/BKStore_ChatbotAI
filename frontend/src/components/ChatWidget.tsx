'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  initialPrompt?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  initialPrompt,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Xin chào! Tôi là **BK-Bot**, trợ lý AI kỹ thuật của BK-Store. Tôi có thể giúp bạn so sánh cấu hình laptop, kiểm tra tồn kho tại 3 chi nhánh hoặc giải đáp chính sách bảo hành!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Tư vấn laptop lập trình & AI tầm 30-50 triệu',
    'So sánh iPhone 15 Pro Max và Galaxy S24 Ultra',
    'Kiểm tra tình trạng đơn hàng mẫu #BK-1024',
    'Chính sách đổi mới 30 ngày tại BK-Store',
  ];

  const handleSendPrompt = React.useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock intelligent response for now (before full LangChain SSE integration)
    setTimeout(() => {
      let botReply = '';
      const lower = text.toLowerCase();

      if (lower.includes('bk-1024') || lower.includes('đơn hàng') || lower.includes('tra cứu')) {
        botReply =
          'Tôi có thể hỗ trợ bạn tra cứu đơn hàng! Mã đơn hàng **#BK-1024** hiện đang ở trạng thái **Đang vận chuyển (shipping)**. Bạn có thể mở chức năng Tra cứu vận đơn ở thanh điều hướng để xem chi tiết nhé.';
      } else if (lower.includes('m3 max') || lower.includes('macbook')) {
        botReply =
          '**MacBook Pro 16" M3 Max** sở hữu 14 nhân CPU, 30 nhân GPU cùng 36GB RAM Unified, băng thông 300GB/s cực kỳ tối ưu cho xử lý mô hình AI cục bộ và render đồ họa. Sản phẩm hiện đang sẵn hàng tại cả 3 chi nhánh Hà Nội, TP.HCM và Đà Nẵng!';
      } else if (lower.includes('s24 ultra') || lower.includes('iphone 15 pro max')) {
        botReply =
          '• **Galaxy S24 Ultra**: Nổi bật với bút S-Pen, tính năng Galaxy AI (Circle to Search, Live Translate) và zoom quang 5x 50MP.\n• **iPhone 15 Pro Max**: Khung Titan siêu nhẹ, chip A17 Pro (3nm), cổng USB-C 3.0 và hệ sinh thái iOS mượt mà.\nTùy nhu cầu làm việc tự do hay hệ sinh thái Apple, cả hai đều là sự lựa chọn hoàn hảo!';
      } else if (lower.includes('bảo hành') || lower.includes('đổi')) {
        botReply =
          'BK-Store cam kết **100% sản phẩm chính hãng** với chính sách:\n• Lỗi 1 đổi 1 trong vòng **30 ngày đầu tiên**.\n• Bảo hành chính hãng từ 12 đến 24 tháng theo tiêu chuẩn nhà sản xuất.\n• Miễn phí vệ sinh máy trọn đời tại hệ thống 3 chi nhánh.';
      } else {
        botReply =
          'Cảm ơn câu hỏi của bạn! BK-Bot đang phân tích thông số kỹ thuật trong cơ sở dữ liệu để đưa ra đề xuất tối ưu nhất cho bạn. Bạn có thể tham khảo danh sách sản phẩm hoặc liên hệ hotline **1800 6868** để được kỹ thuật viên hỗ trợ nhanh nhất!';
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 700);
  }, []);

  useEffect(() => {
    if (initialPrompt) {
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
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 text-white hover:bg-slate-700'
            : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-500/30'
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
            <span className="text-xs font-bold pr-1 hidden sm:inline">Hỏi BK-Bot</span>
          </>
        )}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-32px)] sm:w-96 max-h-[580px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>BK-Bot Assistant</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI 2.4
                  </span>
                </h3>
                <span className="text-[10px] text-slate-300 font-mono">Tư vấn cấu hình & Vận đơn 24/7</span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-200" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-xs whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                <span>BK-Bot đang suy nghĩ...</span>
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
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-full border border-slate-200 transition-colors flex items-center gap-1"
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
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi kỹ thuật hoặc mã đơn..."
              className="flex-1 bg-slate-100 text-xs text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
