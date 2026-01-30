import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Sparkles, Star, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExploreCard from '../components/explore/ExploreCard';

const sampleContent = [
  {
    id: '1',
    title: 'رحلة إلى الفضاء',
    description: 'اكتشف أسرار الكون والنجوم',
    content: 'الفضاء الخارجي هو المنطقة الموجودة خارج الغلاف الجوي للأرض. يحتوي على الكواكب والنجوم والمجرات. هل تعلم أن الضوء من الشمس يستغرق 8 دقائق للوصول إلى الأرض؟',
    category: 'space',
    facts: [
      'الشمس أكبر من الأرض بمليون مرة!',
      'يوجد أكثر من 100 مليار نجم في مجرتنا',
      'رواد الفضاء يطفون لأنه لا توجد جاذبية'
    ],
    quiz_questions: [
      { question: 'كم يستغرق ضوء الشمس للوصول للأرض؟', options: ['8 ثواني', '8 دقائق', '8 ساعات'], answer: '8 دقائق' }
    ],
    week: 1,
    points: 20
  },
  {
    id: '2',
    title: 'جسم الإنسان المذهل',
    description: 'تعرف على أعضائك وكيف تعمل',
    content: 'جسم الإنسان آلة مذهلة! القلب يضخ الدم إلى جميع أنحاء الجسم، والدماغ يتحكم في كل شيء نفعله. لدينا 206 عظمة تساعدنا على الحركة.',
    category: 'human_body',
    facts: [
      'قلبك يضخ حوالي 7500 لتر من الدم يومياً!',
      'دماغك يحتوي على 100 مليار خلية عصبية',
      'عظامك أقوى من الخرسانة!'
    ],
    quiz_questions: [
      { question: 'كم عدد عظام جسم الإنسان؟', options: ['106', '206', '306'], answer: '206' }
    ],
    week: 1,
    points: 20
  },
  {
    id: '3',
    title: 'عالم الحيوانات',
    description: 'حقائق مدهشة عن الحيوانات',
    content: 'الحيوانات تعيش في كل مكان على كوكبنا! من الغابات إلى الصحاري، ومن المحيطات إلى القطب الشمالي. كل حيوان لديه طريقة خاصة للتكيف مع بيئته.',
    category: 'animals',
    facts: [
      'الفيل يمكنه أن يشم الماء من مسافة 5 كم!',
      'الدلفين ينام بنصف دماغه فقط',
      'النحل يرقص ليخبر أصدقاءه أين الطعام'
    ],
    quiz_questions: [
      { question: 'أي حيوان يمكنه شم الماء من بعيد؟', options: ['الأسد', 'الفيل', 'الزرافة'], answer: 'الفيل' }
    ],
    week: 2,
    points: 20
  },
  {
    id: '4',
    title: 'عجائب الطبيعة',
    description: 'اكتشف جمال كوكبنا',
    content: 'الأرض مليئة بالعجائب الطبيعية! من الشلالات الضخمة إلى البراكين النارية، ومن الغابات الاستوائية إلى الصحاري الذهبية.',
    category: 'nature',
    facts: [
      'شلالات نياجرا تضخ 750,000 جالون من الماء كل ثانية',
      'أطول شجرة في العالم يبلغ ارتفاعها 115 متراً',
      'البرق يضرب الأرض 100 مرة كل ثانية'
    ],
    quiz_questions: [
      { question: 'كم مرة يضرب البرق الأرض كل ثانية؟', options: ['10 مرات', '50 مرة', '100 مرة'], answer: '100 مرة' }
    ],
    week: 2,
    points: 20
  },
  {
    id: '5',
    title: 'عالم التكنولوجيا',
    description: 'كيف تعمل الأجهزة من حولنا',
    content: 'التكنولوجيا تجعل حياتنا أسهل! الهواتف الذكية، الحواسيب، والإنترنت كلها اختراعات حديثة غيرت العالم. هل تعلم أن أول حاسوب كان بحجم غرفة كاملة؟',
    category: 'technology',
    facts: [
      'أول رسالة بريد إلكتروني أُرسلت عام 1971',
      'هناك أكثر من 5 مليار مستخدم للإنترنت',
      'الروبوتات يمكنها الآن إجراء عمليات جراحية!'
    ],
    quiz_questions: [
      { question: 'متى أُرسل أول بريد إلكتروني؟', options: ['1951', '1971', '1991'], answer: '1971' }
    ],
    week: 3,
    points: 20
  },
  {
    id: '6',
    title: 'قصص من التاريخ',
    description: 'رحلة عبر الزمن',
    content: 'التاريخ مليء بالقصص المثيرة! من الأهرامات المصرية إلى اكتشاف القارات الجديدة. تعلم من أخطاء الماضي واستلهم من إنجازاته.',
    category: 'history',
    facts: [
      'الأهرامات بُنيت قبل أكثر من 4500 سنة',
      'كان الناس قديماً يعتقدون أن الأرض مسطحة',
      'أول طائرة حلقت عام 1903'
    ],
    quiz_questions: [
      { question: 'متى حلقت أول طائرة؟', options: ['1803', '1903', '2003'], answer: '1903' }
    ],
    week: 3,
    points: 20
  }
];

export default function Explore() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState(sampleContent);
  const [activeCategory, setActiveCategory] = useState('all');

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
      
      const dbContents = await base44.entities.ExploreContent.list();
      if (dbContents.length > 0) {
        setContents(dbContents);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (contentId) => {
    if (!child) return;
    
    try {
      const newProgress = [...(child.explore_progress || [])];
      if (!newProgress.includes(contentId)) {
        newProgress.push(contentId);
        const content = contents.find(c => c.id === contentId);
        const newPoints = (child.points || 0) + (content?.points || 15);
        
        await base44.entities.Child.update(child.id, {
          explore_progress: newProgress,
          points: newPoints
        });
        
        setChild({ ...child, explore_progress: newProgress, points: newPoints });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-indigo-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'الكل', icon: '🌍' },
    { id: 'space', label: 'الفضاء', icon: '🚀' },
    { id: 'human_body', label: 'جسم الإنسان', icon: '🫀' },
    { id: 'animals', label: 'الحيوانات', icon: '🦁' },
    { id: 'nature', label: 'الطبيعة', icon: '🌿' },
    { id: 'technology', label: 'التكنولوجيا', icon: '💻' },
    { id: 'history', label: 'التاريخ', icon: '🏛️' },
  ];

  const filteredContents = activeCategory === 'all' 
    ? contents 
    : contents.filter(c => c.category === activeCategory);

  const progress = Math.round((child?.explore_progress?.length || 0) / contents.length * 100);

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Compass className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">استكشف 🔭</h1>
              <p className="text-sm text-gray-500">اكتشف عالمك</p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">تقدمك في الاستكشاف</span>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="text-sm font-bold">{child?.points || 0} نقطة</span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{child?.explore_progress?.length || 0} / {contents.length} موضوع</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 rounded-xl ${
                activeCategory === cat.id 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : ''
              }`}
            >
              <span className="ml-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Content Cards */}
        <div className="space-y-4">
          {filteredContents.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ExploreCard
                content={content}
                isViewed={child?.explore_progress?.includes(content.id)}
                onView={handleView}
              />
            </motion.div>
          ))}
        </div>

        {filteredContents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔭</div>
            <p className="text-gray-500">لا يوجد محتوى في هذا التصنيف بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
