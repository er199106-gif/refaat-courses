import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ChevronLeft, Star } from 'lucide-react';

export default function SectionCard({ title, icon, description, progress, color, link, delay = 0 }) {

  const bgGradients = {
    violet: 'from-violet-50 to-purple-50',
    blue: 'from-blue-50 to-cyan-50',
    pink: 'from-pink-50 to-rose-50',
    green: 'from-emerald-50 to-teal-50',
    orange: 'from-orange-50 to-amber-50',
    yellow: 'from-yellow-50 to-orange-50',
    indigo: 'from-indigo-50 to-purple-50',
  };

  const gradients = {
    violet: 'from-violet-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
    yellow: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link to={createPageUrl(link)}>
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={`bg-gradient-to-br ${bgGradients[color]} rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="text-3xl">{icon}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-1">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="text-sm font-bold text-gray-700">{progress}%</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-white/60 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: delay + 0.3, duration: 0.8 }}
              className={`absolute inset-y-0 right-0 bg-gradient-to-l ${gradients[color]} rounded-full`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">اضغط للمتابعة</span>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradients[color]} flex items-center justify-center group-hover:translate-x-1 transition-transform`}>
              <ChevronLeft className="text-white" size={18} />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
