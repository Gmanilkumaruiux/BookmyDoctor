import React from 'react';
import { motion } from 'motion/react';

export const PatientDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 text-left animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50" />
        ))}
      </div>

      {/* Bento Layout Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appointments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-10 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />
                <div className="h-16 bg-slate-200/40 dark:bg-slate-700/40 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-200/60 rounded-xl" />
              <div className="h-10 bg-slate-200/60 rounded-xl" />
            </div>
          </div>
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-32 bg-slate-200/40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DoctorDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 text-left animate-pulse">
      {/* Clinician Welcome Bar Skeleton */}
      <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200/50 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3.5 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50" />
        ))}
      </div>

      {/* Grid Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appointments Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/50" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-52 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-10 bg-slate-200/60 dark:bg-slate-700/60 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-10 bg-slate-200/40 rounded-xl" />
            <div className="h-20 bg-slate-200/40 rounded-xl animate-pulse" />
          </div>
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 p-6 space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 w-full bg-slate-200/50 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
