import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, RefreshCw, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";

const images = [
  '🚀', '🌍', '🌙', '⭐', '🎨', '🎮', '🦁', '🌈', '🎵'
];

export default function PuzzleGame({ difficulty = 'easy', onComplete }) {
  const gridSize = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    const totalTiles = gridSize * gridSize;
    const shuffled = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    shuffled.push(null); // Empty tile
    
    // Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setTiles(shuffled);
    setMoves(0);
    setIsComplete(false);
  };

  const canMove = (index) => {
    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    
    return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
  };

  const moveTile = (index) => {
    if (!canMove(index)) return;
    
    const newTiles = [...tiles];
    const emptyIndex = tiles.indexOf(null);
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    
    setTiles(newTiles);
    setMoves(m => m + 1);
    
    // Check win
    const isWin = newTiles.slice(0, -1).every((tile, i) => tile === i + 1);
    if (isWin) {
      setIsComplete(true);
      const points = Math.max(50 - moves, 10);
      onComplete?.(points);
    }
  };

  const tileColors = ['bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-purple-500'];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">🧩 لعبة البازل</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">الحركات: {moves}</span>
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
            <Trophy className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 ممتاز!</h3>
          <p className="text-gray-600">حللت اللغز في {moves} حركة!</p>
        </motion.div>
      ) : (
        <div 
          className="grid gap-2 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: gridSize * 70 + (gridSize - 1) * 8
          }}
        >
          {tiles.map((tile, index) => (
            <motion.button
              key={index}
              whileHover={canMove(index) ? { scale: 1.05 } : {}}
              whileTap={canMove(index) ? { scale: 0.95 } : {}}
              onClick={() => moveTile(index)}
              disabled={tile === null}
              className={`aspect-square rounded-xl text-xl font-bold flex items-center justify-center transition-all ${
                tile === null
                  ? 'bg-gray-100'
                  : `${tileColors[tile % tileColors.length]} text-white shadow-lg cursor-pointer hover:shadow-xl`
              }`}
              style={{ width: 60, height: 60 }}
            >
              {tile}
            </motion.button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        رتب الأرقام من 1 إلى {gridSize * gridSize - 1}
      </p>
    </div>
  );
}
