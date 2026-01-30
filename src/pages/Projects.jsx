import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Puzzle, ArrowRight, Sparkles, Star, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProjectCard from '../components/projects/ProjectCard';

const sampleProjects = [
  { 
    id: '1', 
    title: 'بطاقة تعريفية', 
    description: 'صمم بطاقة تعريفية عن نفسك تتضمن اسمك وعمرك وهواياتك المفضلة',
    instructions: ['اختر ألوانك المفضلة', 'أضف صورتك أو رسمة تمثلك', 'اكتب اسمك بخط كبير', 'أضف 3 هوايات تحبها'],
    week: 1, 
    points: 50 
  },
  { 
    id: '2', 
    title: 'قصة بالذكاء الاصطناعي', 
    description: 'استخدم Gemini لكتابة قصة قصيرة ثم صمم غلافًا لها',
    instructions: ['اطلب من Gemini كتابة قصة', 'اختر عنوانًا للقصة', 'صمم غلافًا باستخدام Canva', 'أضف الشخصيات الرئيسية'],
    week: 2, 
    points: 50 
  },
  { 
    id: '3', 
    title: 'ملصق العادات الصحية', 
    description: 'صمم ملصقًا يوضح 5 عادات صحية يومية للأطفال',
    instructions: ['ابحث عن عادات صحية', 'صمم الملصق بألوان جذابة', 'أضف صورًا توضيحية', 'اكتب نصائح قصيرة'],
    week: 3, 
    points: 50 
  },
  { 
    id: '4', 
    title: 'مشروع التخرج', 
    description: 'اجمع كل ما تعلمته في مشروع واحد: قصة + تصميم + AI',
    instructions: ['اكتب قصة باستخدام AI', 'صمم 3 صور للقصة', 'أضف غلافًا احترافيًا', 'شارك مشروعك مع أصدقائك'],
    week: 4, 
    points: 100 
  },
];

export default function Projects() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(sampleProjects);

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
      
      const dbProjects = await base44.entities.Project.list();
      if (dbProjects.length > 0) {
        setProjects(dbProjects);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (projectId) => {
    if (!child) return;
    
    try {
      const newCompleted = [...(child.projects_completed || [])];
      if (!newCompleted.includes(projectId)) {
        newCompleted.push(projectId);
        const project = projects.find(p => p.id === projectId);
        const newPoints = (child.points || 0) + (project?.points || 50);
        
        // Check for achievement
        const newAchievements = [...(child.achievements || [])];
        if (newCompleted.length === 1 && !newAchievements.includes('first_project')) {
          newAchievements.push('first_project');
        }
        if (newCompleted.length === 4 && !newAchievements.includes('all_projects')) {
          newAchievements.push('all_projects');
        }
        
        await base44.entities.Child.update(child.id, {
          projects_completed: newCompleted,
          points: newPoints,
          achievements: newAchievements
        });
        
        setChild({ ...child, projects_completed: newCompleted, points: newPoints, achievements: newAchievements });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-orange-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const currentWeek = child?.current_week || 1;
  const completedCount = child?.projects_completed?.length || 0;

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Puzzle className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">المشاريع 🧩</h1>
              <p className="text-sm text-gray-500">مشروع كل أسبوع</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center">
            <Calendar className="mx-auto text-violet-500 mb-2" size={28} />
            <p className="text-xs text-gray-500">الأسبوع الحالي</p>
            <p className="text-2xl font-bold text-gray-800">{currentWeek}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center">
            <Puzzle className="mx-auto text-orange-500 mb-2" size={28} />
            <p className="text-xs text-gray-500">المشاريع المكتملة</p>
            <p className="text-2xl font-bold text-gray-800">{completedCount}/{projects.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center">
            <Star className="mx-auto text-yellow-500 mb-2" size={28} fill="currentColor" />
            <p className="text-xs text-gray-500">النقاط</p>
            <p className="text-2xl font-bold text-gray-800">{child?.points || 0}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center">
            <Sparkles className="mx-auto text-pink-500 mb-2" size={28} />
            <p className="text-xs text-gray-500">التقدم</p>
            <p className="text-2xl font-bold text-gray-800">{Math.round(completedCount / projects.length * 100)}%</p>
          </div>
        </motion.div>

        {/* Projects */}
        <div className="space-y-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard
                project={project}
                childId={child?.id}
                isCompleted={child?.projects_completed?.includes(project.id)}
                onComplete={handleComplete}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
