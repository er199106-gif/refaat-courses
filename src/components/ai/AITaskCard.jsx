import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Check, Sparkles, Wand2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AITaskCard({ task, isCompleted, onComplete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(task.prompt_template);
    setCopied(true);
    toast.success('تم نسخ الـ Prompt! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/app', '_blank');
    onComplete(task.id);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 transition-all ${
        isCompleted ? 'border-green-300 bg-green-50/50' : 'border-white/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isCompleted 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-500'
          }`}>
            {isCompleted ? <Check className="text-white" size={24} /> : <Wand2 className="text-white" size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
            <p className="text-sm text-gray-500">الأسبوع {task.week}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
          <Sparkles className="text-emerald-500" size={14} />
          <span className="text-sm font-bold text-emerald-700">+{task.points || 15}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{task.description}</p>

      {/* Prompt Box */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Wand2 size={12} />
            الـ Prompt الجاهز:
          </span>
          <button
            onClick={handleCopy}
            className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
              copied ? 'bg-green-100 text-green-600' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'تم النسخ!' : 'نسخ'}
          </button>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed font-mono bg-white rounded-xl p-3 border border-gray-100">
          {task.prompt_template}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 h-12 rounded-xl border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
        >
          <Copy className="ml-2" size={18} />
          نسخ Prompt
        </Button>
        
        <Button
          onClick={handleOpenGemini}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <ExternalLink className="ml-2" size={18} />
          افتح Gemini
        </Button>
      </div>

      {isCompleted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 p-3 bg-green-100 rounded-xl flex items-center gap-2"
        >
          <Check className="text-green-600" size={20} />
          <span className="text-green-700 font-medium">تم إكمال المهمة! 🎉</span>
        </motion.div>
      )}
    </motion.div>
  );
}
