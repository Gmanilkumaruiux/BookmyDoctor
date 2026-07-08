import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'indigo' | 'rose';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue' 
}) => {
  const themes = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100/80',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100/80',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      iconBg: 'bg-amber-100/80',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100/80',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      iconBg: 'bg-rose-100/80',
    },
  };

  const selectedTheme = themes[color] || themes.blue;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between"
    >
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-400 block tracking-wide uppercase">{title}</span>
        <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h4>
        {description && (
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${selectedTheme.iconBg} ${selectedTheme.text}`}>
        <Icon className="h-6 w-6" />
      </div>
    </motion.div>
  );
};

export default StatsCard;
