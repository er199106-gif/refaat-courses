import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Sparkles, Star, Gamepad2, Lock, Play, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuestionCard from '../components/think/QuestionCard';
import MemoryGame from '../components/games/MemoryGame';
import PuzzleGame from '../components/games/PuzzleGame';
import MazeGame from '../components/games/MazeGame';
import SudokuGame from '../components/games/SudokuGame';

// Extended questions for 3 months
const sampleQuestions = [
  // Week 1 - Easy
  { id: '1', question_ar: 'كم يساوي 5 + 3 ؟', category: 'math', type: 'multiple_choice', options: ['6', '7', '8', '9'], correct_answer: '8', explanation: '5 + 3 = 8، عندما نجمع 5 مع 3 نحصل على 8', week: 1, difficulty: 'easy', points: 10 },
  { id: '2', question_ar: 'What color is the sky?', category: 'english', type: 'multiple_choice', options: ['Red', 'Blue', 'Green', 'Yellow'], correct_answer: 'Blue', explanation: 'السماء زرقاء! The sky is blue.', week: 1, difficulty: 'easy', points: 10 },
  { id: '3', question_ar: 'ما هو أكبر كوكب في المجموعة الشمسية؟', category: 'general', type: 'multiple_choice', options: ['الأرض', 'المشتري', 'زحل', 'المريخ'], correct_answer: 'المشتري', explanation: 'المشتري هو أكبر كوكب!', week: 1, difficulty: 'easy', points: 10 },
  { id: '4', question_ar: 'الماء يغلي عند درجة 100', category: 'science', type: 'true_false', options: ['صح', 'خطأ'], correct_answer: 'صح', explanation: 'نعم، الماء يغلي عند 100 درجة مئوية', week: 1, difficulty: 'easy', points: 10 },
  { id: '5', question_ar: 'Wie heißt du? (كيف تقول اسمي أحمد؟)', category: 'deutsch', type: 'multiple_choice', options: ['Ich heiße Ahmad', 'Du heißt Ahmad', 'Er heißt Ahmad'], correct_answer: 'Ich heiße Ahmad', explanation: 'Ich heiße = اسمي', week: 1, difficulty: 'easy', points: 10 },
  // Week 2 - Easy to Medium
  { id: '6', question_ar: 'كم يساوي 12 - 4 ؟', category: 'math', type: 'input', correct_answer: '8', explanation: '12 - 4 = 8', week: 2, difficulty: 'easy', points: 10 },
  { id: '7', question_ar: 'What is the opposite of big?', category: 'english', type: 'multiple_choice', options: ['Small', 'Large', 'Tall'], correct_answer: 'Small', explanation: 'Big = كبير، Small = صغير', week: 2, difficulty: 'easy', points: 10 },
  { id: '8', question_ar: 'كم عدد أرجل العنكبوت؟', category: 'science', type: 'multiple_choice', options: ['4', '6', '8', '10'], correct_answer: '8', explanation: 'العنكبوت له 8 أرجل!', week: 2, difficulty: 'medium', points: 15 },
  { id: '9', question_ar: 'ما هي عاصمة مصر؟', category: 'general', type: 'multiple_choice', options: ['الإسكندرية', 'القاهرة', 'الجيزة'], correct_answer: 'القاهرة', explanation: 'القاهرة هي عاصمة مصر', week: 2, difficulty: 'medium', points: 15 },
  { id: '10', question_ar: 'كم يساوي 7 × 2 ؟', category: 'math', type: 'input', correct_answer: '14', explanation: '7 × 2 = 14', week: 2, difficulty: 'medium', points: 15 },
  // Week 3 - Medium
  { id: '11', question_ar: 'ما هو العضو الذي يضخ الدم؟', category: 'science', type: 'multiple_choice', options: ['الرئة', 'القلب', 'الكبد'], correct_answer: 'القلب', explanation: 'القلب يضخ الدم لجميع أنحاء الجسم', week: 3, difficulty: 'medium', points: 15 },
  { id: '12', question_ar: 'How many days are in a week?', category: 'english', type: 'input', correct_answer: '7', explanation: 'There are 7 days in a week', week: 3, difficulty: 'medium', points: 15 },
  { id: '13', question_ar: 'كم يساوي 25 ÷ 5 ؟', category: 'math', type: 'multiple_choice', options: ['4', '5', '6', '7'], correct_answer: '5', explanation: '25 ÷ 5 = 5', week: 3, difficulty: 'medium', points: 15 },
  { id: '14', question_ar: 'من بنى الأهرامات؟', category: 'history', type: 'multiple_choice', options: ['الرومان', 'المصريون القدماء', 'الإغريق'], correct_answer: 'المصريون القدماء', explanation: 'بنى المصريون القدماء الأهرامات قبل آلاف السنين', week: 3, difficulty: 'medium', points: 15 },
  // Week 4 - Medium to Hard
  { id: '15', question_ar: 'ما هي أطول نهر في العالم؟', category: 'general', type: 'multiple_choice', options: ['النيل', 'الأمازون', 'المسيسيبي'], correct_answer: 'النيل', explanation: 'نهر النيل هو أطول نهر في العالم', week: 4, difficulty: 'hard', points: 20 },
  { id: '16', question_ar: 'كم يساوي 8 × 9 ؟', category: 'math', type: 'input', correct_answer: '72', explanation: '8 × 9 = 72', week: 4, difficulty: 'hard', points: 20 },
  // More questions for weeks 5-12...
  { id: '17', question_ar: 'ما هو الحيوان الأسرع في العالم؟', category: 'science', type: 'multiple_choice', options: ['الأسد', 'الفهد', 'النمر'], correct_answer: 'الفهد', explanation: 'الفهد هو أسرع حيوان بري', week: 5, difficulty: 'medium', points: 15 },
  { id: '18', question_ar: 'What is the capital of England?', category: 'english', type: 'multiple_choice', options: ['Paris', 'London', 'Berlin'], correct_answer: 'London', explanation: 'London is the capital of England', week: 5, difficulty: 'medium', points: 15 },
];

export default function Think() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(sampleQuestions);
  const [activeTab, setActiveTab] = useState('questions');
  const [activeGame, setActiveGame] = useState(null);
  const [showDifficultyAlert, setShowDifficultyAlert] = useState(false);
  const [difficultyMessage, setDifficultyMessage] = useState('');

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
        // Filter questions based on current week and difficulty
        filterQuestionsByDifficulty(children[0]);
      }
      
      const dbQuestions = await base44.entities.ThinkQuestion.list();
      if (dbQuestions.length > 0) {
        setQuestions(dbQuestions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestionsByDifficulty = (childData) => {
    const difficulty = childData.difficulty_level || 'easy';
    const currentWeek = childData.current_week || 1;
    
    // Filter questions for current week and unlocked weeks
    const unlockedWeeks = childData.unlocked_weeks || [1];
    const availableQuestions = sampleQuestions.filter(q => 
      unlockedWeeks.includes(q.week) || q.week <= currentWeek
    );
    
    // Prioritize questions matching child's difficulty
    const sortedQuestions = availableQuestions.sort((a, b) => {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      const childDiff = diffOrder[difficulty];
      const aDiff = diffOrder[a.difficulty];
      const bDiff = diffOrder[b.difficulty];
      
      // Prioritize questions closest to child's level
      return Math.abs(aDiff - childDiff) - Math.abs(bDiff - childDiff);
    });
    
    setQuestions(sortedQuestions);
  };

  const adjustDifficulty = async (isCorrect) => {
    if (!child) return;
    
    let newCorrectStreak = isCorrect ? (child.correct_streak || 0) + 1 : 0;
    let newWrongStreak = !isCorrect ? (child.wrong_streak || 0) + 1 : 0;
    let newDifficulty = child.difficulty_level || 'easy';
    
    // Increase difficulty after 5 correct answers
    if (newCorrectStreak >= 5 && newDifficulty !== 'hard') {
      newDifficulty = newDifficulty === 'easy' ? 'medium' : 'hard';
      newCorrectStreak = 0;
      setDifficultyMessage('🎉 رائع! مستوى الصعوبة زاد لأنك متفوق!');
      setShowDifficultyAlert(true);
      setTimeout(() => setShowDifficultyAlert(false), 3000);
    }
    
    // Decrease difficulty after 3 wrong answers
    if (newWrongStreak >= 3 && newDifficulty !== 'easy') {
      newDifficulty = newDifficulty === 'hard' ? 'medium' : 'easy';
      newWrongStreak = 0;
      setDifficultyMessage('💪 لا تقلق! سنجعل الأسئلة أسهل قليلاً');
      setShowDifficultyAlert(true);
      setTimeout(() => setShowDifficultyAlert(false), 3000);
    }
    
    await base44.entities.Child.update(child.id, {
      correct_streak: newCorrectStreak,
      wrong_streak: newWrongStreak,
      difficulty_level: newDifficulty
    });
    
    setChild({
      ...child,
      correct_streak: newCorrectStreak,
      wrong_streak: newWrongStreak,
      difficulty_level: newDifficulty
    });
  };

  const updateCategoryPerformance = async (category, isCorrect) => {
    if (!child) return;
    
    const performance = child.category_performance || {};
    if (!performance[category]) {
      performance[category] = { correct: 0, total: 0 };
    }
    
    performance[category].total += 1;
    if (isCorrect) {
      performance[category].correct += 1;
    }
    
    // Identify weak areas and interests
    const weakAreas = [];
    const interests = [];
    
    Object.entries(performance).forEach(([cat, data]) => {
      const accuracy = data.correct / data.total;
      if (accuracy < 0.5 && data.total >= 3) {
        weakAreas.push(cat);
      }
      if (accuracy > 0.8 && data.total >= 5) {
        interests.push(cat);
      }
    });
    
    await base44.entities.Child.update(child.id, {
      category_performance: performance,
      weak_areas: weakAreas,
      interests: interests
    });
    
    setChild({
      ...child,
      category_performance: performance,
      weak_areas: weakAreas,
      interests: interests
    });
  };

  const handleAnswer = async (isCorrect) => {
    if (!child) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update progress
    const newProgress = [...(child.think_progress || [])];
    if (isCorrect && !newProgress.includes(currentQuestion.id)) {
      newProgress.push(currentQuestion.id);
      const newPoints = (child.points || 0) + (currentQuestion.points || 10);
      
      await base44.entities.Child.update(child.id, {
        think_progress: newProgress,
        points: newPoints
      });
      
      setChild({ ...child, think_progress: newProgress, points: newPoints });
    }
    
    // Adjust difficulty and track category performance
    await adjustDifficulty(isCorrect);
    await updateCategoryPerformance(currentQuestion.category, isCorrect);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleGameComplete = async (points) => {
    if (!child) return;
    try {
      const newPoints = (child.points || 0) + points;
      const newGamesProgress = [...(child.games_progress || []), activeGame + '_' + Date.now()];
      
      await base44.entities.Child.update(child.id, { 
        points: newPoints,
        games_progress: newGamesProgress
      });
      setChild({ ...child, points: newPoints, games_progress: newGamesProgress });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="text-violet-500" size={48} />
        </motion.div>
      </div>
    );
  }

  const progress = Math.round((child?.think_progress?.length || 0) / questions.length * 100);
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };
  const difficultyLabels = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

  const games = [
    { id: 'memory', name: 'لعبة الذاكرة 🎴', icon: '🎴', color: 'from-purple-500 to-pink-500' },
    { id: 'puzzle', name: 'البازل 🧩', icon: '🧩', color: 'from-blue-500 to-cyan-500' },
    { id: 'maze', name: 'المتاهة 🌀', icon: '🌀', color: 'from-green-500 to-emerald-500' },
    { id: 'sudoku', name: 'سودوكو 🔢', icon: '🔢', color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Brain className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">أفكر 🧠</h1>
              <p className="text-sm text-gray-500">تنمية التفكير والمنطق</p>
            </div>
          </div>
        </motion.div>

        {/* Difficulty Alert */}
        <AnimatePresence>
          {showDifficultyAlert && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-4"
            >
              <Alert className="bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                <AlertDescription className="text-violet-700">
                  {difficultyMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress & Stats */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">تقدمك</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${difficultyColors[child?.difficulty_level || 'easy']}`}>
                    {difficultyLabels[child?.difficulty_level || 'easy']}
                  </span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{child?.think_progress?.length || 0} / {questions.length} سؤال</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <span className="text-lg font-bold">{child?.points || 0}</span>
            </div>
          </div>
          
          {/* Weak Areas Suggestion */}
          {child?.weak_areas?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-500 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-amber-700">نصيحة للتحسين</p>
                  <p className="text-xs text-amber-600">
                    جرب التركيز أكثر على: {child.weak_areas.map(a => {
                      const labels = { math: 'الرياضيات', english: 'الإنجليزية', science: 'العلوم', general: 'المعلومات العامة' };
                      return labels[a] || a;
                    }).join('، ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6 bg-white/60 p-1 rounded-2xl">
            <TabsTrigger value="questions" className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Brain className="ml-2" size={18} />
              الأسئلة
            </TabsTrigger>
            <TabsTrigger value="games" className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Gamepad2 className="ml-2" size={18} />
              الألعاب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <AnimatePresence mode="wait">
              {currentQuestionIndex < questions.length ? (
                <QuestionCard
                  key={currentQuestionIndex}
                  question={questions[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                />
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 text-center"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">أحسنت! أكملت جميع الأسئلة!</h2>
                  <p className="text-gray-600 mb-6">استمر في التعلم واللعب لجمع المزيد من النقاط</p>
                  <Button onClick={() => setCurrentQuestionIndex(0)} className="bg-gradient-to-r from-violet-500 to-purple-600">
                    إعادة من البداية
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question Navigator */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {questions.slice(0, 20).map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : child?.think_progress?.includes(q.id)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games">
            {!activeGame ? (
              <div className="grid grid-cols-2 gap-4">
                {games.map((game, index) => (
                  <motion.button
                    key={game.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveGame(game.id)}
                    className={`bg-gradient-to-br ${game.color} rounded-3xl p-6 text-white text-center shadow-lg`}
                  >
                    <span className="text-5xl block mb-3">{game.icon}</span>
                    <h3 className="font-bold text-lg">{game.name}</h3>
                    <p className="text-white/80 text-sm mt-1">اضغط للعب</p>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setActiveGame(null)}
                  className="mb-4"
                >
                  <ArrowRight size={18} className="ml-2" />
                  رجوع للألعاب
                </Button>
                
                {activeGame === 'memory' && (
                  <MemoryGame onComplete={handleGameComplete} />
                )}
                {activeGame === 'puzzle' && (
                  <PuzzleGame difficulty={child?.difficulty_level || 'easy'} onComplete={handleGameComplete} />
                )}
                {activeGame === 'maze' && (
                  <MazeGame difficulty={child?.difficulty_level || 'easy'} onComplete={handleGameComplete} />
                )}
                {activeGame === 'sudoku' && (
                  <SudokuGame difficulty={child?.difficulty_level || 'easy'} onComplete={handleGameComplete} />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
