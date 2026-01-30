import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, Lightbulb, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SudokuGame({ difficulty = 'easy', onComplete }) {
  const size = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 9;
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hints, setHints] = useState(3);

  useEffect(() => {
    generatePuzzle();
  }, [difficulty]);

  const generatePuzzle = () => {
    // Generate a simple valid puzzle for kids
    let newBoard, newSolution;
    
    if (size === 4) {
      // 4x4 Sudoku for easy
      newSolution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];
      newBoard = newSolution.map(row => row.map(cell => Math.random() > 0.5 ? cell : 0));
    } else if (size === 6) {
      // 6x6 for medium
      newSolution = [
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 1, 5, 6, 4],
        [5, 6, 4, 2, 3, 1],
        [3, 1, 2, 6, 4, 5],
        [6, 4, 5, 3, 1, 2]
      ];
      newBoard = newSolution.map(row => row.map(cell => Math.random() > 0.4 ? cell : 0));
    } else {
      // Simplified 9x9
      newSolution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];
      newBoard = newSolution.map(row => row.map(cell => Math.random() > 0.35 ? cell : 0));
    }
    
    setBoard(newBoard);
    setSolution(newSolution);
    setSelected(null);
    setIsComplete(false);
    setHints(3);
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] === solution[row][col]) return;
    setSelected({ row, col });
  };

  const handleNumberClick = (num) => {
    if (!selected) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[selected.row][selected.col] = num;
    setBoard(newBoard);
    
    // Check if complete
    const complete = newBoard.every((row, r) => 
      row.every((cell, c) => cell === solution[r][c])
    );
    
    if (complete) {
      setIsComplete(true);
      onComplete?.(50);
    }
  };

  const useHint = () => {
    if (hints <= 0 || !selected) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[selected.row][selected.col] = solution[selected.row][selected.col];
    setBoard(newBoard);
    setHints(h => h - 1);
    setSelected(null);
  };

  const boxSize = size === 4 ? 2 : size === 6 ? 2 : 3;
  const cellSize = size === 4 ? 'w-12 h-12 text-xl' : size === 6 ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm';

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">🔢 سودوكو</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={useHint} disabled={hints <= 0 || !selected}>
            <Lightbulb size={16} className="ml-1" />
            تلميح ({hints})
          </Button>
          <Button variant="outline" size="sm" onClick={generatePuzzle}>
            <RefreshCw size={16} className="ml-1" />
            جديد
          </Button>
        </div>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
            <Trophy className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 رائع!</h3>
          <p className="text-gray-600">حللت السودوكو بنجاح!</p>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div 
              className="grid gap-0.5 bg-gray-300 p-1 rounded-lg"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selected?.row === r && selected?.col === c;
                  const isCorrect = cell === solution[r][c] && cell !== 0;
                  const isWrong = cell !== 0 && cell !== solution[r][c];
                  const isFixed = board[r][c] === solution[r][c] && cell !== 0;
                  
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`${cellSize} flex items-center justify-center font-bold rounded-sm transition-all ${
                        isSelected
                          ? 'bg-violet-200 ring-2 ring-violet-500'
                          : isWrong
                          ? 'bg-red-100 text-red-600'
                          : isFixed
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-white hover:bg-violet-50'
                      } ${
                        (c + 1) % boxSize === 0 && c < size - 1 ? 'border-l-2 border-l-gray-400' : ''
                      } ${
                        (r + 1) % boxSize === 0 && r < size - 1 ? 'border-t-2 border-t-gray-400' : ''
                      }`}
                    >
                      {cell || ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Number Buttons */}
          <div className="flex justify-center gap-2 flex-wrap">
            {Array.from({ length: size }, (_, i) => i + 1).map(num => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumberClick(num)}
                disabled={!selected}
                className="w-10 h-10 text-lg font-bold"
              >
                {num}
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            اضغط على خلية فارغة ثم اختر الرقم المناسب
          </p>
        </>
      )}
    </div>
  );
}
