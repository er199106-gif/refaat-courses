import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Sparkles, Star, Download, Share2, Image as ImageIcon, Award, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProgressRing from '../components/dashboard/ProgressRing';
import CertificateCard from '../components/certificate/CertificateCard';

const achievementsList = [
  { id: 'first_question', title: 'أول سؤال', description: 'أجبت على سؤالك الأول', icon: '🎯', color: 'from-blue-400 to-cyan-500' },
  { id: 'first_design', title: 'أول تصميم', description: 'أكملت أول مهمة تصميم', icon: '🎨', color: 'from-pink-400 to-rose-500' },
  { id: 'first_ai', title: 'مستكشف AI', description: 'استخدمت الذكاء الاصطناعي', icon: '🤖', color: 'from-green-400 to-emerald-500' },
  { id: 'first_project', title: 'أول مشروع', description: 'أكملت مشروعك الأول', icon: '🧩', color: 'from-orange-400 to-amber-500' },
  { id: 'all_projects', title: 'بطل المشاريع', description: 'أكملت جميع المشاريع', icon: '🏆', color: 'from-yellow-400 to-orange-500' },
  { id: 'week_1_complete', title: 'الأسبوع الأول', description: 'أكملت الأسبوع الأول', icon: '📅', color: 'from-violet-400 to-purple-500' },
  { id: 'week_4_complete', title: 'شهر كامل', description: 'أكملت شهراً كاملاً', icon: '🌟', color: 'from-amber-400 to-yellow-500' },
  { id: 'week_12_complete', title: 'خريج متميز', description: 'أكملت الدورة كاملة', icon: '🎓', color: 'from-rose-400 to-pink-500' },
  { id: '100_points', title: '100 نقطة', description: 'جمعت 100 نقطة', icon: '⭐', color: 'from-amber-400 to-yellow-500' },
  { id: '500_points', title: '500 نقطة', description: 'جمعت 500 نقطة', icon: '💫', color: 'from-rose-400 to-pink-500' },
  { id: '1000_points', title: '1000 نقطة', description: 'جمعت 1000 نقطة', icon: '🌟', color: 'from-violet-400 to-purple-500' },
  { id: 'explorer', title: 'مستكشف', description: 'شاهدت 5 مواضيع استكشاف', icon: '🔭', color: 'from-indigo-400 to-blue-500' },
  { id: 'game_master', title: 'بطل الألعاب', description: 'فزت في 10 ألعاب', icon: '🎮', color: 'from-cyan-400 to-teal-500' },
  { id: 'streak_5', title: 'سلسلة 5', description: '5 إجابات صحيحة متتالية', icon: '🔥', color: 'from-red-400 to-orange-500' },
  { id: 'streak_10', title: 'سلسلة 10', description: '10 إجابات صحيحة متتالية', icon: '💥', color: 'from-purple-400 to-pink-500' },
];

const badgesList = [
  { id: 'math_star', title: 'نجم الرياضيات', icon: '🔢', requirement: '80% في الرياضيات' },
  { id: 'english_star', title: 'نجم الإنجليزية', icon: '🇬🇧', requirement: '80% في الإنجليزية' },
  { id: 'science_star', title: 'عالم صغير', icon: '🔬', requirement: '80% في العلوم' },
  { id: 'creative_star', title: 'مبدع', icon: '🎨', requirement: '10 تصاميم' },
  { id: 'ai_expert', title: 'خبير AI', icon: '🤖', requirement: '15 مهمة AI' },
];

export default function Achievements() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Check for new achievements
  const checkAndUpdateAchievements = async (childData) => {
    if (!childData) return;
    
    const unlockedAchievements = childData.achievements || [];
    const newAchievements = [...unlockedAchievements];
    
    // Points achievements
    if ((childData.points || 0) >= 100 && !newAchievements.includes('100_points')) {
      newAchievements.push('100_points');
    }
    if ((childData.points || 0) >= 500 && !newAchievements.includes('500_points')) {
      newAchievements.push('500_points');
    }
    if ((childData.points || 0) >= 1000 && !newAchievements.includes('1000_points')) {
      newAchievements.push('1000_points');
    }
    
    // Explorer achievement
    if ((childData.explore_progress?.length || 0) >= 5 && !newAchievements.includes('explorer')) {
      newAchievements.push('explorer');
    }
    
    // Game master achievement
    if ((childData.games_progress?.length || 0) >= 10 && !newAchievements.includes('game_master')) {
      newAchievements.push('game_master');
    }
    
    // Streak achievements
    if ((childData.correct_streak || 0) >= 5 && !newAchievements.includes('streak_5')) {
      newAchievements.push('streak_5');
    }
    if ((childData.correct_streak || 0) >= 10 && !newAchievements.includes('streak_10')) {
      newAchievements.push('streak_10');
    }
    
    if (newAchievements.length > unlockedAchievements.length) {
      await base44.entities.Child.update(childData.id, { achievements: newAchievements });
      return { ...childData, achievements: newAchievements };
    }
    return childData;
  };

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
        const updatedChild = await checkAndUpdateAchievements(children[0]);
        setChild(updatedChild);
        
        const subs = await base44.entities.Submission.filter({ child_id: childId });
        setSubmissions(subs);
        
        const certs = await base44.entities.Certificate.filter({ child_id: childId });
        setCertificates(certs);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-yellow-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const thinkProgress = Math.round((child?.think_progress?.length || 0) / 30 * 100);
  const designProgress = Math.round((child?.design_progress?.length || 0) / 30 * 100);
  const aiProgress = Math.round((child?.ai_progress?.length || 0) / 30 * 100);
  const projectsProgress = Math.round((child?.projects_completed?.length || 0) / 12 * 100);
  const exploreProgress = Math.round((child?.explore_progress?.length || 0) / 12 * 100);
  const overallProgress = Math.round((thinkProgress + designProgress + aiProgress + projectsProgress + exploreProgress) / 5);

  const unlockedAchievements = child?.achievements || [];
  const unlockedBadges = child?.badges || [];

  const motivationalQuotes = [
    "Great Job! 🌟",
    "You Are Amazing! ✨",
    "Keep Going! 🚀",
    "Excellent Work! 🎉",
    "You're A Star! ⭐"
  ];

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">إنجازاتي 🏆</h1>
              <p className="text-sm text-gray-500">تتبع تقدمك وجوائزك</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-violet-500 via-purple-600 to-pink-500 rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
              <Star
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                size={16}
                fill="currentColor"
              />
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">{child?.avatar || '🦁'}</div>
            <div className="text-center md:text-right flex-1">
              <h2 className="text-3xl font-bold mb-2">{child?.name}</h2>
              <p className="text-white/80 text-lg mb-4">
                {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-2 bg-white/20 rounded-full">
                  المستوى {child?.level || 1}
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {child?.points || 0} نقطة
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full flex items-center gap-1">
                  <Calendar size={16} />
                  الأسبوع {child?.current_week || 1}
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full">
                  {unlockedAchievements.length} إنجاز
                </span>
              </div>
            </div>
            <ProgressRing progress={overallProgress} size={120} strokeWidth={10} color="yellow" />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 bg-white/60 p-1 rounded-2xl grid grid-cols-4">
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs md:text-sm">
              <Trophy className="ml-1 hidden md:block" size={16} />
              الإنجازات
            </TabsTrigger>
            <TabsTrigger value="badges" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs md:text-sm">
              <Award className="ml-1 hidden md:block" size={16} />
              الشارات
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white text-xs md:text-sm">
              <ImageIcon className="ml-1 hidden md:block" size={16} />
              المعرض
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white text-xs md:text-sm">
              <Sparkles className="ml-1 hidden md:block" size={16} />
              الشهادات
            </TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievementsList.map((achievement, index) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-3xl p-4 text-center transition-all ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg` 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-bold text-sm">{achievement.title}</h3>
                    <p className={`text-xs mt-1 ${isUnlocked ? 'text-white/80' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    {isUnlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2"
                      >
                        <Star size={16} className="mx-auto" fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badgesList.map((badge, index) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-3xl p-6 text-center transition-all ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-white border-2 border-dashed border-gray-200'
                    }`}
                  >
                    <div className={`text-5xl mb-3 ${!isUnlocked && 'grayscale opacity-30'}`}>
                      {badge.icon}
                    </div>
                    <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>{badge.title}</h3>
                    <p className={`text-xs mt-1 ${isUnlocked ? 'text-white/80' : 'text-gray-400'}`}>
                      {badge.requirement}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {submissions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg group"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <img 
                        src={submission.file_url} 
                        alt="عمل" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={submission.file_url}
                          download
                          className="p-2 bg-white rounded-full"
                        >
                          <Download size={20} className="text-gray-700" />
                        </a>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'عملي في Refaat Courses',
                                url: submission.file_url
                              });
                            }
                          }}
                          className="p-2 bg-white rounded-full"
                        >
                          <Share2 size={20} className="text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.type === 'design' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {submission.type === 'design' ? 'تصميم' : 'مشروع'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-3xl">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-gray-500">لم ترفع أي أعمال بعد</p>
                <p className="text-gray-400 text-sm">أكمل المهام وارفع أعمالك لتظهر هنا</p>
              </div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            {selectedCertificate ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCertificate(null)}
                  className="mb-4"
                >
                  <ArrowRight size={18} className="ml-2" />
                  رجوع
                </Button>
                <CertificateCard 
                  certificate={selectedCertificate} 
                  childName={child?.name}
                  childAvatar={child?.avatar}
                />
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, index) => (
                  <motion.button
                    key={cert.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedCertificate(cert)}
                    className="bg-white rounded-2xl p-6 shadow-lg text-right hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        cert.type === 'week' ? 'bg-blue-100' :
                        cert.type === 'month' ? 'bg-purple-100' : 'bg-yellow-100'
                      }`}>
                        <Award className={`${
                          cert.type === 'week' ? 'text-blue-500' :
                          cert.type === 'month' ? 'text-purple-500' : 'text-yellow-500'
                        }`} size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{cert.title}</h3>
                        <p className="text-sm text-gray-500">{cert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(cert.issued_date || cert.created_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-3xl">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-gray-500">لم تحصل على شهادات بعد</p>
                <p className="text-gray-400 text-sm">أكمل أسبوعاً كاملاً للحصول على شهادتك الأولى!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Progress Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-800 mb-4">ملخص التقدم</h3>
          <div className="space-y-3">
            {[
              { label: 'أفكر 🧠', progress: thinkProgress, color: 'from-blue-500 to-cyan-500' },
              { label: 'أصمم 🎨', progress: designProgress, color: 'from-pink-500 to-rose-500' },
              { label: 'ذكاء اصطناعي 🤖', progress: aiProgress, color: 'from-emerald-500 to-teal-500' },
              { label: 'استكشف 🔭', progress: exploreProgress, color: 'from-indigo-500 to-purple-500' },
              { label: 'المشاريع 🧩', progress: projectsProgress, color: 'from-orange-500 to-amber-500' },
            ].map((item, index) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
