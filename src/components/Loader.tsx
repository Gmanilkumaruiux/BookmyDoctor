import React from 'react';
import { motion } from 'motion/react';

export const SpinnerLoader: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = 'border-blue-600' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex justify-center items-center py-6">
      <div className={`animate-spin rounded-full border-t-transparent ${color} ${sizeClasses[size]}`}></div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-200 rounded-md w-full" style={{ opacity: 1 - idx * 0.2 }}></div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="rounded-full bg-slate-200 h-16 w-16"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-xl w-full pt-4"></div>
    </div>
  );
};
