import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';

const quickSuggestions = [
  { icon: '🎯', text: 'كيف أحسّن درجاتي؟' },
  { icon: '🎨', text: 'ساعدني في التصميم' },
  { icon: '🤖', text: 'علمني عن الذكاء الاصطناعي' },
  { icon: '💡', text: 'أعطني فكرة مشروع' },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! 👋 أنا مساعدك الذكي. كيف أقدر أساعدك اليوم؟ يمكنني مساعدتك في الأسئلة، التصميم، أو أي شيء تحتاجه! 🌟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد تعليمي ودود للأطفال من عمر 7-12 سنة. أجب بطريقة بسيطة ومشجعة وممتعة. استخدم الإيموجي. الرسالة: "${text}"`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }
          }
        }
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response || 'عذراً، حدث خطأ. حاول مرة أخرى! 🙏'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، لم أستطع الرد الآن. حاول مرة أخرى! 🙏'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-2xl flex items-center justify-center"
        style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
      >
        <Bot size={32} />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
        >
          <Sparkles size={12} className="text-yellow-800" />
        </motion.div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 left-6 z-50 w-[350px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-violet-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">المساعد الذكي</h3>
                    <p className="text-xs text-white/80">متصل الآن 🟢</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-violet-50/50 to-white">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-violet-100 text-gray-800 rounded-tr-none'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-3 rounded-2xl rounded-tl-none">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex items-center gap-1"
                    >
                      <span className="w-2 h-2 bg-white rounded-full" />
                      <span className="w-2 h-2 bg-white rounded-full" />
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion.text)}
                    className="flex-shrink-0 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 rounded-full text-xs text-violet-700 transition-colors"
                  >
                    <span className="ml-1">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 rounded-xl border-violet-200 focus:border-violet-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
