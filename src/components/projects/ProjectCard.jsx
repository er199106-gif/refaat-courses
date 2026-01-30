import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, Star, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

export default function ProjectCard({ project, childId, isCompleted, onComplete }) {
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.Submission.create({
        child_id: childId,
        type: 'project',
        task_id: project.id,
        file_url
      });

      onComplete(project.id);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const weekColors = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-orange-500 to-amber-500',
    4: 'from-emerald-500 to-teal-500',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border-2 transition-all ${
        isCompleted ? 'border-green-300' : 'border-white/50'
      }`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${weekColors[project.week] || weekColors[1]} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            الأسبوع {project.week}
          </span>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Star className="text-yellow-300" size={14} fill="currentColor" />
            <span className="text-sm font-bold">+{project.points || 50}</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold">{project.title}</h3>
        {isCompleted && (
          <div className="mt-2 flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 w-fit">
            <Check size={16} />
            <span className="text-sm">مكتمل!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4">{project.description}</p>

        {/* Instructions Toggle */}
        {project.instructions && project.instructions.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 text-violet-600 font-medium"
            >
              <ListChecks size={18} />
              <span>خطوات التنفيذ</span>
              {showInstructions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 bg-violet-50 rounded-2xl p-4 border border-violet-100"
              >
                <ol className="space-y-2">
                  {project.instructions.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </div>
        )}

        {/* Upload Section */}
        {!isCompleted ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`project-upload-${project.id}`}
            />
            <label
              htmlFor={`project-upload-${project.id}`}
              className={`flex items-center justify-center gap-2 w-full h-14 rounded-2xl cursor-pointer transition-all ${
                uploading
                  ? 'bg-gray-100 text-gray-400'
                  : `bg-gradient-to-r ${weekColors[project.week] || weekColors[1]} text-white hover:shadow-lg`
              }`}
            >
              {uploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Upload size={20} />
                </motion.div>
              ) : (
                <>
                  <Upload size={20} />
                  <span className="font-bold">ارفع مشروعك</span>
                </>
              )}
            </label>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-green-100 rounded-2xl flex items-center justify-center gap-2"
          >
            <Check className="text-green-600" size={24} />
            <span className="text-green-700 font-bold text-lg">🎉 أحسنت! مشروع رائع!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
