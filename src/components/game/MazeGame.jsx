import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function MazeGame({ difficulty = 'easy', onComplete }) {
  const size = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 9 : 11;
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [maze, setMaze] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const goalPos = { x: size - 2, y: size - 2 };

  useEffect(() => {
    generateMaze();
  }, [difficulty]);

  const generateMaze = () => {
    // Simple maze generation
    const newMaze = Array(size).fill(null).map(() => Array(size).fill(1));
    
    // Create path
    const carve = (x, y) => {
      newMaze[y][x] = 0;
      const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };
    
    carve(1, 1);
    newMaze[size - 2][size - 2] = 0; // Ensure goal is accessible
    newMaze[size - 3][size - 2] = 0;
    newMaze[size - 2][size - 3] = 0;
    
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setMoves(0);
    setIsComplete(false);
  };

  const movePlayer = useCallback((dx, dy) => {
    if (isComplete) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (newX >= 0 && newX < size && newY >= 0 && newY < size && maze[newY]?.[newX] === 0) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(m => m + 1);
      
      if (newX === goalPos.x && newY === goalPos.y) {
        setIsComplete(true);
        const points = Math.max(60 - moves, 15);
        onComplete?.(points);
      }
    }
  }, [playerPos, maze, isComplete, moves, goalPos, size, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">🌀 المتاهة</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">الخطوات: {moves}</span>
          <Button variant="outline" size="sm" onClick={generateMaze}>
            <RefreshCw size={16} className="ml-1" />
            متاهة جديدة
          </Button>
        </div>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
            <Trophy className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 وصلت!</h3>
          <p className="text-gray-600">أكملت المتاهة في {moves} خطوة!</p>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div 
              className="grid gap-0.5 bg-gray-200 p-2 rounded-xl"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-sm transition-colors ${
                      playerPos.x === x && playerPos.y === y
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : x === goalPos.x && y === goalPos.y
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : cell === 1
                        ? 'bg-gray-700'
                        : 'bg-white'
                    }`}
                  >
                    {playerPos.x === x && playerPos.y === y && (
                      <span className="flex items-center justify-center h-full text-xs">🚀</span>
                    )}
                    {x === goalPos.x && y === goalPos.y && playerPos.x !== x && (
                      <span className="flex items-center justify-center h-full text-xs">⭐</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex flex-col items-center gap-2 md:hidden">
            <Button variant="outline" size="icon" onClick={() => movePlayer(0, -1)}>
              <ArrowUp size={20} />
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => movePlayer(-1, 0)}>
                <ArrowLeft size={20} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => movePlayer(0, 1)}>
                <ArrowDown size={20} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => movePlayer(1, 0)}>
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            استخدم الأسهم للتحرك نحو النجمة ⭐
          </p>
        </>
      )}
    </div>
  );
}
