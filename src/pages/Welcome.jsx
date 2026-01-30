import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Star, ArrowLeft, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const avatars = [
  '🦁', '🐱', '🐶', '🦊', '🐼', '🐨', '🦄', '🐸', 
  '🐵', '🐰', '🐯', '🦋', '🌟', '🚀', '🎨', '🎮'
];

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      const child = await base44.entities.Child.create({
        name: name.trim(),
        avatar: selectedAvatar,
        level: 1,
        points: 0,
        current_month: 1,
        current_week: 1,
        unlocked_weeks: [1],
        think_progress: [],
        games_progress: [],
        design_progress: [],
        ai_progress: [],
        projects_completed: [],
        explore_progress: [],
        achievements: [],
        badges: [],
        certificates: [],
        difficulty_level: 'easy',
        correct_streak: 0,
        wrong_streak: 0,
        category_performance: {},
        interests: [],
        weak_areas: [],
        parent_pin: '1234',
        sound_enabled: true,
        music_enabled: true
      });
      
      localStorage.setItem('childId', child.id);
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error creating child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              scale: [0.5, 1, 0.5],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            <Star className="text-yellow-400 opacity-30" size={20 + Math.random() * 20} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/50">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="text-center"
            >
              {/* Logo */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl"
              >
                <Sparkles className="text-white" size={48} />
              </motion.div>

              <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Refaat Courses
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                مرحباً بك في رحلة التعلم الممتعة! 🚀
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🧠', label: 'أفكر' },
                  { icon: '🎨', label: 'أصمم' },
                  { icon: '🤖', label: 'ذكاء اصطناعي' },
                  { icon: '🧩', label: 'مشاريع' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <p className="text-sm font-medium text-gray-700 mt-1">{item.label}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 pulse-glow"
              >
                <Rocket className="ml-2" size={24} />
                ابدأ المغامرة!
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-500 hover:text-violet-600 mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                رجوع
              </button>

              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  {selectedAvatar}
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800">من أنت؟</h2>
                <p className="text-gray-500">اختر صورتك واسمك</p>
              </div>

              {/* Avatar Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-3">اختر صورتك الرمزية:</p>
                <div className="grid grid-cols-8 gap-2">
                  {avatars.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-2xl p-2 rounded-xl transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg'
                          : 'bg-gray-100 hover:bg-violet-100'
                      }`}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-600 mb-3">ما اسمك؟</p>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك هنا..."
                    className="h-14 pr-12 text-lg rounded-2xl border-2 border-violet-200 focus:border-violet-500 bg-white/50"
                  />
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={!name.trim() || isLoading}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles size={24} />
                  </motion.div>
                ) : (
                  <>
                    <Sparkles className="ml-2" size={24} />
                    فلنبدأ!
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 ER1991. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
}
