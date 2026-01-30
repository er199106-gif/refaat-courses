import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, ChevronUp, Star, Sparkles, BookOpen, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ExploreCard({ content, isViewed, onView }) {
  const [expanded, setExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);

  const categoryIcons = {
    space: '🚀',
    human_body: '🫀',
    animals: '🦁',
    nature: '🌿',
    technology: '💻',
    history: '🏛️',
  };

  const categoryColors = {
    space: 'from-indigo-500 to-purple-600',
    human_body: 'from-red-500 to-pink-600',
    animals: 'from-amber-500 to-orange-600',
    nature: 'from-green-500 to-emerald-600',
    technology: 'from-blue-500 to-cyan-600',
    history: 'from-yellow-600 to-amber-600',
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!isViewed && !expanded) {
      onView(content.id);
    }
  };

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const checkQuiz = () => {
    setQuizComplete(true);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border-2 transition-all ${
        isViewed ? 'border-green-300' : 'border-white/50'
      }`}
    >
      {/* Header */}
      <div 
        className={`bg-gradient-to-r ${categoryColors[content.category]} p-5 cursor-pointer`}
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{categoryIcons[content.category]}</span>
            <div>
              <h3 className="text-xl font-bold">{content.title}</h3>
              <p className="text-white/80 text-sm">{content.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isViewed && <Check className="text-green-300" size={20} />}
            {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Main Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{content.content}</p>
              </div>

              {/* Image */}
              {content.image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden">
                  <img 
                    src={content.image_url} 
                    alt={content.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Video */}
              {content.video_url && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(content.video_url, '_blank')}
                  className="mb-6 w-full h-12 border-2 border-violet-200 text-violet-600"
                >
                  <Play className="ml-2" size={18} />
                  شاهد الفيديو
                </Button>
              )}

              {/* Fun Facts */}
              {content.facts && content.facts.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={18} />
                    حقائق ممتعة!
                  </h4>
                  <div className="space-y-2">
                    {content.facts.map((fact, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-100"
                      >
                        <Star className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} fill="currentColor" />
                        <span className="text-gray-700 text-sm">{fact}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Section */}
              {content.quiz_questions && content.quiz_questions.length > 0 && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="text-violet-500" size={18} />
                    اختبر معلوماتك!
                  </h4>
                  
                  {!showQuiz ? (
                    <Button 
                      onClick={() => setShowQuiz(true)}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
                    >
                      ابدأ الاختبار
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {content.quiz_questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-xl p-4">
                          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
                          <div className="space-y-2">
                            {q.options?.map((option, oIndex) => (
                              <button
                                key={oIndex}
                                onClick={() => handleQuizAnswer(qIndex, option)}
                                disabled={quizComplete}
                                className={`w-full p-3 rounded-xl text-right transition-all ${
                                  quizAnswers[qIndex] === option
                                    ? quizComplete
                                      ? option === q.answer
                                        ? 'bg-green-100 border-2 border-green-500 text-green-700'
                                        : 'bg-red-100 border-2 border-red-500 text-red-700'
                                      : 'bg-violet-100 border-2 border-violet-500 text-violet-700'
                                    : quizComplete && option === q.answer
                                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {!quizComplete && (
                        <Button 
                          onClick={checkQuiz}
                          disabled={Object.keys(quizAnswers).length < content.quiz_questions.length}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                          تحقق من إجاباتك
                        </Button>
                      )}
                      
                      {quizComplete && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl"
                        >
                          <span className="text-2xl">🎉</span>
                          <p className="font-bold text-gray-800">أحسنت! استمر في التعلم!</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Points Badge */}
              <div className="mt-4 flex justify-end">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full text-sm font-bold text-orange-700">
                  +{content.points || 15} نقطة
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
