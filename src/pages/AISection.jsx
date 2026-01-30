import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Sparkles, Star, Filter, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AITaskCard from '../components/ai/AITaskCard';

const sampleAITasks = [
  { id: '1', title: 'اسأل عن الحيوانات', description: 'اسأل الذكاء الاصطناعي عن معلومات ممتعة عن حيوانك المفضل', prompt_template: 'أخبرني 5 معلومات ممتعة عن حيوان الأسد للأطفال', week: 1, points: 15 },
  { id: '2', title: 'اكتب قصة قصيرة', description: 'اطلب من AI أن يساعدك في كتابة قصة قصيرة ممتعة', prompt_template: 'اكتب لي قصة قصيرة للأطفال عن أرنب شجاع يذهب في مغامرة', week: 1, points: 15 },
  { id: '3', title: 'تعلم كلمات جديدة', description: 'اطلب من AI أن يعلمك كلمات إنجليزية جديدة', prompt_template: 'علمني 5 كلمات إنجليزية جديدة عن الطعام مع معناها بالعربية', week: 1, points: 15 },
  { id: '4', title: 'اصنع لغزًا', description: 'اطلب من AI أن يصنع لك لغزًا ممتعًا', prompt_template: 'اصنع لي 3 ألغاز سهلة وممتعة للأطفال مع الإجابات', week: 2, points: 15 },
  { id: '5', title: 'استكشف الفضاء', description: 'اسأل عن الكواكب والنجوم', prompt_template: 'أخبرني عن كوكب المريخ بطريقة ممتعة للأطفال', week: 2, points: 15 },
  { id: '6', title: 'وصفة سهلة', description: 'اطلب وصفة طعام بسيطة يمكنك صنعها', prompt_template: 'أعطني وصفة سهلة لصنع كوكيز الشوكولاتة يمكن للأطفال صنعها مع والديهم', week: 2, points: 15 },
];

export default function AISection() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(sampleAITasks);
  const [selectedWeek, setSelectedWeek] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const childId = localStorage.getItem('childId');
    if (!childId) {
      navigate(createPageUrl('Welcome'));
      return;
    }

    try {
      const children = await base44.entities.Child.filter({ id: childId });
      if (children.length > 0) {
        setChild(children[0]);
      }
      
      const dbTasks = await base44.entities.AITask.list();
      if (dbTasks.length > 0) {
        setTasks(dbTasks);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    if (!child) return;
    
    try {
      const newProgress = [...(child.ai_progress || [])];
      if (!newProgress.includes(taskId)) {
        newProgress.push(taskId);
        const task = tasks.find(t => t.id === taskId);
        const newPoints = (child.points || 0) + (task?.points || 15);
        
        await base44.entities.Child.update(child.id, {
          ai_progress: newProgress,
          points: newPoints
        });
        
        setChild({ ...child, ai_progress: newProgress, points: newPoints });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-emerald-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const filteredTasks = selectedWeek === 'all' 
    ? tasks 
    : tasks.filter(t => t.week === parseInt(selectedWeek));

  const progress = Math.round((child?.ai_progress?.length || 0) / tasks.length * 100);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="gap-2"
          >
            <ArrowRight size={20} />
            رجوع
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Bot className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ذكاء اصطناعي 🤖</h1>
              <p className="text-sm text-gray-500">استكشف عالم AI</p>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 mb-6 text-white"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-1" size={24} />
            <div>
              <h3 className="font-bold mb-1">كيف تستخدم Gemini؟</h3>
              <p className="text-sm text-white/90">
                1. انسخ الـ Prompt الجاهز 📋
                <br />
                2. افتح Gemini 🚀
                <br />
                3. الصق الـ Prompt واضغط إرسال ✨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress & Filter */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">تقدمك في AI</span>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={16} fill="currentColor" />
                  <span className="text-sm font-bold">{child?.points || 0} نقطة</span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{child?.ai_progress?.length || 0} / {tasks.length} مهمة</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue placeholder="الأسبوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأسابيع</SelectItem>
                  <SelectItem value="1">الأسبوع 1</SelectItem>
                  <SelectItem value="2">الأسبوع 2</SelectItem>
                  <SelectItem value="3">الأسبوع 3</SelectItem>
                  <SelectItem value="4">الأسبوع 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <AITaskCard
                task={task}
                isCompleted={child?.ai_progress?.includes(task.id)}
                onComplete={handleComplete}
              />
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-gray-500">لا توجد مهام في هذا الأسبوع بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
