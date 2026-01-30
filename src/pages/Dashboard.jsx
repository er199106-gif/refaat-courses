import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Star, Trophy, Zap, Calendar, Target } from 'lucide-react';
import ProgressRing from '../components/dashboard/ProgressRing';
import SectionCard from '../components/dashboard/SectionCard';

// Week locking system
const checkWeekUnlock = (child) => {
  const currentWeek = child.current_week || 1;
  const thinkCompleted = (child.think_progress?.length || 0) >= (currentWeek * 5);
  const designCompleted = (child.design_progress?.length || 0) >= currentWeek;
  const aiCompleted = (child.ai_progress?.length || 0) >= currentWeek;
  const projectCompleted = child.projects_completed?.includes(`week_${currentWeek}`);
  
  return thinkCompleted && designCompleted && aiCompleted && projectCompleted;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChild();
  }, []);

  const loadChild = async () => {
    const childId = localStorage.getItem('childId');
    if (!childId) {
      navigate(createPageUrl('Welcome'));
      return;
    }

    try {
      const children = await base44.entities.Child.filter({ id: childId });
      if (children.length > 0) {
        setChild(children[0]);
      } else {
        navigate(createPageUrl('Welcome'));
      }
    } catch (error) {
      console.error('Error loading child:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-violet-500" size={48} />
        </motion.div>
      </div>
    );
  }

  if (!child) return null;

  const thinkProgress = Math.round((child.think_progress?.length || 0) / 30 * 100);
  const designProgress = Math.round((child.design_progress?.length || 0) / 30 * 100);
  const aiProgress = Math.round((child.ai_progress?.length || 0) / 30 * 100);
  const projectsProgress = Math.round((child.projects_completed?.length || 0) / 4 * 100);
  const overallProgress = Math.round((thinkProgress + designProgress + aiProgress + projectsProgress) / 4);

  const weekLabels = [
    'الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4',
    'الأسبوع 5', 'الأسبوع 6', 'الأسبوع 7', 'الأسبوع 8',
    'الأسبوع 9', 'الأسبوع 10', 'الأسبوع 11', 'الأسبوع 12'
  ];
  const monthLabels = ['الشهر الأول - الأساسيات', 'الشهر الثاني - التطبيق', 'الشهر الثالث - الإبداع'];

  const exploreProgress = Math.round((child.explore_progress?.length || 0) / 6 * 100);

  const sections = [
    { title: 'أفكر 🧠', icon: '🧠', description: 'أسئلة ذكية وألعاب منطقية', progress: thinkProgress, color: 'blue', link: 'Think' },
    { title: 'أصمم 🎨', icon: '🎨', description: 'مهام إبداعية مع Canva', progress: designProgress, color: 'pink', link: 'Design' },
    { title: 'ذكاء اصطناعي 🤖', icon: '🤖', description: 'استكشف عالم AI', progress: aiProgress, color: 'green', link: 'AISection' },
    { title: 'استكشف 🔭', icon: '🔭', description: 'اكتشف عالمك', progress: exploreProgress, color: 'violet', link: 'Explore' },
    { title: 'المشاريع 🧩', icon: '🧩', description: 'مشاريع أسبوعية ممتعة', progress: projectsProgress, color: 'orange', link: 'Projects' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-xl border border-white/50 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl text-4xl md:text-5xl"
              >
                {child.avatar || '🦁'}
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  مرحباً {child.name}! 👋
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium">
                    المستوى {child.level || 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    {child.points || 0} نقطة
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="flex-1 flex justify-center">
              <ProgressRing progress={overallProgress} size={140} strokeWidth={14} />
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-100">
                <Calendar className="mx-auto text-cyan-500 mb-2" size={28} />
                <p className="text-xs text-gray-500">الأسبوع</p>
                <p className="text-xl font-bold text-gray-800">{child.current_week || 1}</p>
              </div>
              <div className="text-center bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
                <Trophy className="mx-auto text-amber-500 mb-2" size={28} />
                <p className="text-xs text-gray-500">الإنجازات</p>
                <p className="text-xl font-bold text-gray-800">{child.achievements?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Week & Month Progress */}
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {monthLabels[(child.current_month || 1) - 1]} - {weekLabels[(child.current_week || 1) - 1]}
                </span>
                <span className="text-sm text-gray-500">{overallProgress}% مكتمل</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
            
            {/* 12 Week Timeline */}
            <div className="flex gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
                const isUnlocked = (child.unlocked_weeks || [1]).includes(week);
                const isCurrent = week === (child.current_week || 1);
                return (
                  <div
                    key={week}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                        : isUnlocked
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                    }`}
                    title={`الأسبوع ${week}`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-400 text-center">خطة 3 أشهر (12 أسبوع)</p>
          </div>
        </motion.div>

        {/* Motivation Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-violet-500 via-purple-600 to-pink-500 rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${0.5 + Math.random()})`
                }}
                size={20}
                fill="currentColor"
              />
            ))}
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <Zap size={40} className="text-yellow-300" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold">استمر في التألق! ✨</h2>
              <p className="text-white/80">أنت تتقدم بشكل رائع! أكمل مهامك واجمع المزيد من النقاط.</p>
            </div>
          </div>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sections.map((section, index) => (
            <SectionCard key={section.title} {...section} delay={0.1 * (index + 1)} />
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(createPageUrl('Achievements'))}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100 text-right"
          >
            <Trophy className="text-yellow-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-800">إنجازاتي 🏆</h3>
            <p className="text-sm text-gray-500">شاهد تقدمك ومعرض أعمالك</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(createPageUrl('ParentDashboard'))}
            className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-100 text-right"
          >
            <Target className="text-slate-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-800">لوحة ولي الأمر 👨‍👩‍👦</h3>
            <p className="text-sm text-gray-500">متابعة التقدم الأسبوعي</p>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-8">
          © 2026 ER199. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
