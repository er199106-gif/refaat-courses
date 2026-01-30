import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Upload, Check, Star, Image, Play, FileText, BarChart3, Video, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

export default function TaskCard({ task, childId, isCompleted, onComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const taskTypeIcons = {
    image: Image,
    video: Video,
    presentation: FileText,
    infographic: BarChart3,
  };

  const taskTypeLabels = {
    image: 'تصميم صورة',
    video: 'فيديو',
    presentation: 'عرض تقديمي',
    infographic: 'إنفوجرافيك',
  };

  const TaskIcon = taskTypeIcons[task.task_type] || Image;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      
      // Create submission
      await base44.entities.Submission.create({
        child_id: childId,
        type: 'design',
        task_id: task.id,
        file_url
      });

      onComplete(task.id);
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
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
              : 'bg-gradient-to-br from-pink-500 to-rose-500'
          }`}>
            {isCompleted ? <Check className="text-white" size={24} /> : <TaskIcon className="text-white" size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">الأسبوع {task.week}</span>
              <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                {taskTypeLabels[task.task_type] || 'تصميم'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
          <Star className="text-yellow-500" size={14} fill="currentColor" />
          <span className="text-sm font-bold text-yellow-700">+{task.points || 20}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{task.description}</p>

      {/* Instructions */}
      {task.instructions && task.instructions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-pink-600 font-medium text-sm"
          >
            <ListChecks size={16} />
            <span>خطوات التنفيذ</span>
            {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showInstructions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 bg-pink-50 rounded-xl p-3 border border-pink-100"
            >
              <ol className="space-y-1.5">
                {task.instructions.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-pink-200 text-pink-700 text-xs flex items-center justify-center flex-shrink-0">
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

      {/* Tutorial Video */}
      {task.tutorial_video && (
        <Button
          variant="outline"
          onClick={() => window.open(task.tutorial_video, '_blank')}
          className="w-full mb-4 h-10 rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          <Play className="ml-2" size={16} />
          شاهد الشرح
        </Button>
      )}

      {task.example_image && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100">
          <img src={task.example_image} alt="مثال" className="w-full h-40 object-cover" />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {task.canva_link && (
          <Button
            variant="outline"
            onClick={() => window.open(task.canva_link || 'https://www.canva.com', '_blank')}
            className="flex-1 h-12 rounded-xl border-2 border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            <ExternalLink className="ml-2" size={18} />
            افتح Canva
          </Button>
        )}
        
        {!isCompleted && (
          <div className="flex-1">
            {showUpload ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`upload-${task.id}`}
                />
                <label
                  htmlFor={`upload-${task.id}`}
                  className={`flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all ${
                    uploading
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                  }`}
                >
                  {uploading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Upload size={18} />
                    </motion.div>
                  ) : (
                    <>
                      <Upload className="ml-2" size={18} />
                      اختر صورة
                    </>
                  )}
                </label>
              </div>
            ) : (
              <Button
                onClick={() => setShowUpload(true)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500"
              >
                <Upload className="ml-2" size={18} />
                ارفع عملك
              </Button>
            )}
          </div>
        )}
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
