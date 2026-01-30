import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Home, Brain, Palette, Bot, Puzzle, Trophy, Users, 
  Menu, X, Sparkles, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './components/assistant/AIAssistant';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isWelcomePage = currentPageName === 'Welcome';
  
  const navItems = [
    { name: 'Dashboard', label: 'الرئيسية', icon: Home, color: 'from-violet-500 to-purple-600' },
    { name: 'Think', label: 'أفكر 🧠', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { name: 'Design', label: 'أصمم 🎨', icon: Palette, color: 'from-pink-500 to-rose-500' },
    { name: 'AISection', label: 'ذكاء اصطناعي 🤖', icon: Bot, color: 'from-emerald-500 to-teal-500' },
    { name: 'Explore', label: 'استكشف 🔭', icon: Sparkles, color: 'from-indigo-500 to-purple-600' },
    { name: 'Projects', label: 'المشاريع 🧩', icon: Puzzle, color: 'from-orange-500 to-amber-500' },
    { name: 'Achievements', label: 'إنجازاتي 🏆', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { name: 'ParentDashboard', label: 'ولي الأمر 👨‍👩‍👦', icon: Users, color: 'from-slate-500 to-gray-600' },
  ];

  if (isWelcomePage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-cyan-100" dir="rtl">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          * { font-family: 'Tajawal', sans-serif; }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(108, 99, 255, 0.6); }
          }
          
          .float-animation { animation: float 3s ease-in-out infinite; }
          .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-cyan-100" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(108, 99, 255, 0.6); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .float-animation { animation: float 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .sparkle { animation: sparkle 1.5s ease-in-out infinite; }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-violet-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-600" size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Refaat Courses
            </span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="fixed right-0 top-0 h-full w-72 bg-white/90 backdrop-blur-xl shadow-2xl z-50 lg:z-30 border-l border-violet-200"
            >
              <div className="p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Refaat Courses
                    </h1>
                    <p className="text-xs text-gray-500">تعلم وأستمتع! 🌟</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = currentPageName === item.name;
                    return (
                      <Link
                        key={item.name}
                        to={createPageUrl(item.name)}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                            : 'hover:bg-violet-50 text-gray-700'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${
                          isActive 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-r ${item.color} bg-opacity-10`
                        }`}>
                          <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <Star className="mr-auto sparkle" size={16} />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-violet-100">
                <p className="text-xs text-center text-gray-400">
                  © 2026 ER1991. All Rights Reserved.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${!isWelcomePage ? 'lg:mr-72' : ''}`}>
        <div className="pt-16 lg:pt-0 min-h-screen">
          {children}
        </div>
      </main>

      {/* Floating Decorations */}
      <div className="fixed bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 opacity-20 blur-2xl float-animation" />
      <div className="fixed top-40 left-20 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 opacity-20 blur-2xl float-animation" style={{ animationDelay: '1s' }} />
      
      {/* AI Assistant */}
      {!isWelcomePage && <AIAssistant />}
    </div>
  );
}
