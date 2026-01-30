import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

const emojis = ['🌟', '🎨', '🚀', '🎮', '🦄', '🌈', '🎵', '🏆'];

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsComplete(false);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          setIsComplete(true);
          onComplete?.(Math.max(50 - moves * 2, 10));
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">🎴 لعبة الذاكرة</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">المحاولات: {moves}</span>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RefreshCw size={16} className="ml-1" />
            إعادة
          </Button>
        </div>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <Star className="text-white" size={40} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 رائع!</h3>
          <p className="text-gray-600">أكملت اللعبة في {moves} محاولة!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-2xl text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 ${
                flipped.includes(card.id) || matched.includes(card.id)
                  ? 'bg-gradient-to-br from-violet-100 to-purple-100 rotate-0'
                  : 'bg-gradient-to-br from-violet-500 to-purple-600 rotate-0'
              }`}
            >
              {(flipped.includes(card.id) || matched.includes(card.id)) ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <span className="text-white text-2xl">?</span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
