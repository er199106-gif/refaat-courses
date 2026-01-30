import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Sparkles, Lock, Eye, RefreshCw, Calendar, Star, Brain, Palette, Bot, Puzzle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProgressRing from '../components/dashboard/ProgressRing';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPinDialog, setShowPinDialog] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin === (child?.parent_pin || '1234')) {
      setIsAuthenticated(true);
      setShowPinDialog(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleReset = async () => {
    if (!child) return;
    
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع التقدم؟')) {
      try {
        await base44.entities.Child.update(child.id, {
          think_progress: [],
          design_progress: [],
          ai_progress: [],
          projects_completed: [],
          achievements: [],
          points: 0,
          level: 1,
          current_week: 1
        });
        loadChild();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-slate-500" size={48} />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-md mx-auto">
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
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Lock className="text-white" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لوحة ولي الأمر</h2>
            <p className="text-gray-500 mb-6">أدخل رمز الدخول للمتابعة</p>
            
            <div className="space-y-4">
              <Input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="رمز الدخول (الافتراضي: 1234)"
                className={`h-14 text-center text-2xl tracking-widest rounded-2xl ${
                  pinError ? 'border-red-500 bg-red-50' : ''
                }`}
                maxLength={4}
              />
              {pinError && (
                <p className="text-red-500 text-sm">رمز خاطئ، حاول مرة أخرى</p>
              )}
              <Button
                onClick={handlePinSubmit}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-slate-600 to-gray-700"
              >
                دخول
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const thinkProgress = Math.round((child?.think_progress?.length || 0) / 30 * 100);
  const designProgress = Math.round((child?.design_progress?.length || 0) / 30 * 100);
  const aiProgress = Math.round((child?.ai_progress?.length || 0) / 30 * 100);
  const projectsProgress = Math.round((child?.projects_completed?.length || 0) / 4 * 100);
  const overallProgress = Math.round((thinkProgress + designProgress + aiProgress + projectsProgress) / 4);

  const stats = [
    { label: 'أفكر', icon: Brain, progress: thinkProgress, count: child?.think_progress?.length || 0, total: 30, color: 'blue' },
    { label: 'أصمم', icon: Palette, progress: designProgress, count: child?.design_progress?.length || 0, total: 30, color: 'pink' },
    { label: 'AI', icon: Bot, progress: aiProgress, count: child?.ai_progress?.length || 0, total: 30, color: 'green' },
    { label: 'المشاريع', icon: Puzzle, progress: projectsProgress, count: child?.projects_completed?.length || 0, total: 4, color: 'orange' },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
  };

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">لوحة ولي الأمر 👨‍👩‍👦</h1>
              <p className="text-sm text-gray-500">متابعة التقدم</p>
            </div>
          </div>
        </motion.div>

        {/* Child Info Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">{child?.avatar || '🦁'}</div>
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{child?.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full font-medium">
                  المستوى {child?.level || 1}
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {child?.points || 0} نقطة
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                  <Calendar size={16} />
                  الأسبوع {child?.current_week || 1}
                </span>
              </div>
            </div>
            <ProgressRing progress={overallProgress} size={120} strokeWidth={12} />
          </div>
        </motion.div>

        {/* Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.count}/{stat.total}</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${colorClasses[stat.color]} rounded-full`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.progress}% مكتمل</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-violet-500" size={24} />
            ملخص الأسبوع {child?.current_week || 1}
          </h3>
          
          <div className="space-y-4">
            {[
              { label: 'الأسئلة المحلولة', value: child?.think_progress?.length || 0, max: 8 },
              { label: 'التصاميم المكتملة', value: child?.design_progress?.length || 0, max: 8 },
              { label: 'مهام AI', value: child?.ai_progress?.length || 0, max: 8 },
              { label: 'المشاريع', value: child?.projects_completed?.length || 0, max: 1 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{item.value}</span>
                  <span className="text-gray-400">من {item.max}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-12 px-6"
          >
            <RefreshCw className="ml-2" size={18} />
            إعادة تعيين التقدم
          </Button>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-400 mt-8">
          لوحة قراءة فقط - لا يمكن تعديل محتوى الدروس
        </p>
      </div>
    </div>
  );
}
