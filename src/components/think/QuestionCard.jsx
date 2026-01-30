import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuestionCard({ question, onAnswer, onNext }) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const categoryColors = {
    math: 'from-blue-500 to-cyan-500',
    english: 'from-purple-500 to-pink-500',
    deutsch: 'from-green-500 to-teal-500',
    general: 'from-orange-500 to-amber-500',
  };

  const categoryLabels = {
    math: 'رياضيات 🔢',
    english: 'English 🇬🇧',
    deutsch: 'Deutsch 🇩🇪',
    general: 'معلومات عامة 🌍',
  };

  const handleSubmit = () => {
    const answer = question.type === 'input' ? inputAnswer.trim() : selectedAnswer;
    const correct = answer.toLowerCase() === question.correct_answer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer('');
    setInputAnswer('');
    onNext();
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-xl border border-white/50"
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${categoryColors[question.category]} text-white text-sm font-bold`}>
          {categoryLabels[question.category]}
        </span>
        <span className="text-sm text-gray-500">
          +{question.points || 10} نقطة
        </span>
      </div>

      {/* Question */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
        {question.question_ar}
      </h2>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Multiple Choice */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="space-y-3 mb-6">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-4 rounded-2xl text-right transition-all ${
                      selectedAnswer === option
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-violet-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input Answer */}
            {question.type === 'input' && (
              <div className="mb-6">
                <Input
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="h-14 text-lg rounded-2xl border-2 border-violet-200 focus:border-violet-500"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={question.type === 'input' ? !inputAnswer.trim() : !selectedAnswer}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              تأكيد الإجابة ✓
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            {isCorrect ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle className="text-white" size={48} />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">🎉 أحسنت! Excellent!</h3>
                <p className="text-gray-600 mb-4">إجابة صحيحة! +{question.points || 10} نقطة</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center"
                >
                  <XCircle className="text-white" size={48} />
                </motion.div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">حاول مرة أخرى! 💪</h3>
                <p className="text-gray-600 mb-2">الإجابة الصحيحة: <span className="font-bold text-violet-600">{question.correct_answer}</span></p>
              </>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-6 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-amber-500 mt-1" size={20} />
                  <p className="text-gray-700 text-sm text-right">{question.explanation}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600"
            >
              <ArrowLeft className="ml-2" size={20} />
              السؤال التالي
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
