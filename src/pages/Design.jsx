import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Palette, ArrowRight, Sparkles, Star, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskCard from '../components/design/TaskCard';

const sampleTasks = [
  // Month 1
  { id: '1', title: 'صمم بطاقة عيد ميلاد', description: 'استخدم Canva لتصميم بطاقة عيد ميلاد جميلة لصديقك', instructions: ['افتح Canva واختر قالب بطاقة', 'أضف صورًا وألوانًا مبهجة', 'اكتب رسالة تهنئة'], week: 1, points: 20, task_type: 'image' },
  { id: '2', title: 'ملصق ترحيبي', description: 'صمم ملصقًا يقول مرحباً بألوان مبهجة', instructions: ['اختر خلفية ملونة', 'أضف كلمة مرحباً بخط كبير', 'زين الملصق برسومات'], week: 1, points: 20, task_type: 'image' },
  { id: '3', title: 'بطاقة شكر', description: 'صمم بطاقة شكر لمعلمك المفضل', instructions: ['اختر ألواناً هادئة', 'اكتب رسالة شكر من القلب', 'أضف زهوراً أو قلوباً'], week: 2, points: 20, task_type: 'image' },
  { id: '4', title: 'غلاف كتاب', description: 'صمم غلافًا لكتاب قصة من تأليفك', instructions: ['اختر عنواناً مشوقاً', 'صمم صورة غلاف جذابة', 'أضف اسمك ككاتب'], week: 2, points: 25, task_type: 'image' },
  // Month 2
  { id: '5', title: 'عرض تقديمي', description: 'صمم عرضاً تقديمياً عن هوايتك المفضلة', instructions: ['أضف 5 شرائح', 'استخدم صوراً توضيحية', 'اكتب معلومات مختصرة'], week: 5, points: 30, task_type: 'presentation' },
  { id: '6', title: 'إنفوجرافيك', description: 'صمم إنفوجرافيك عن فوائد الرياضة', instructions: ['رتب المعلومات بشكل جميل', 'استخدم أيقونات', 'اختر ألواناً متناسقة'], week: 6, points: 30, task_type: 'infographic' },
  // Month 3
  { id: '7', title: 'فيديو قصير', description: 'صمم فيديو قصير عن يومك المفضل', instructions: ['صور لقطات قصيرة', 'أضف موسيقى مناسبة', 'اكتب عناوين'], week: 10, points: 40, task_type: 'video', tutorial_video: 'https://www.youtube.com/watch?v=example' },
  { id: '8', title: 'هوية بصرية', description: 'صمم شعاراً وهوية لمشروعك الخاص', instructions: ['اختر اسماً لمشروعك', 'صمم شعاراً بسيطاً', 'اختر ألوان العلامة'], week: 11, points: 40, task_type: 'image' },
];

export default function Design() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(sampleTasks);
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
      
      const dbTasks = await base44.entities.DesignTask.list();
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
      const newProgress = [...(child.design_progress || [])];
      if (!newProgress.includes(taskId)) {
        newProgress.push(taskId);
        const task = tasks.find(t => t.id === taskId);
        const newPoints = (child.points || 0) + (task?.points || 20);
        
        await base44.entities.Child.update(child.id, {
          design_progress: newProgress,
          points: newPoints
        });
        
        setChild({ ...child, design_progress: newProgress, points: newPoints });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-pink-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const filteredTasks = selectedWeek === 'all' 
    ? tasks 
    : tasks.filter(t => t.week === parseInt(selectedWeek));

  const progress = Math.round((child?.design_progress?.length || 0) / tasks.length * 100);

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Palette className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">أصمم 🎨</h1>
              <p className="text-sm text-gray-500">مهام إبداعية مع Canva</p>
            </div>
          </div>
        </motion.div>

        {/* Progress & Filter */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">تقدمك في التصميم</span>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={16} fill="currentColor" />
                  <span className="text-sm font-bold">{child?.points || 0} نقطة</span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{child?.design_progress?.length || 0} / {tasks.length} مهمة</p>
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
              <TaskCard
                task={task}
                childId={child?.id}
                isCompleted={child?.design_progress?.includes(task.id)}
                onComplete={handleComplete}
              />
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-gray-500">لا توجد مهام في هذا الأسبوع بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
