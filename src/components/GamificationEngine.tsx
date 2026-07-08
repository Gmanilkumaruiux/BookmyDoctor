import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Award, Flame, Sparkles, CheckCircle2, ChevronRight, HelpCircle, 
  Heart, Brain, Play, RotateCcw, Compass, Star, Smile, ShieldCheck, Zap
} from 'lucide-react';
import { Badge, Quest, GamifiedStats } from '../utils/gamification';

interface GamificationEngineProps {
  stats: GamifiedStats;
  role: 'patient' | 'doctor';
  onActionClick?: (section: string) => void;
}

export const GamificationEngine: React.FC<GamificationEngineProps> = ({ stats, role, onActionClick }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'badges' | 'mindfulness'>('quests');
  
  // Mindfulness Game States
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const [mindfulnessCompleted, setMindfulnessCompleted] = useState(false);
  const [breatheXpEarned, setBreatheXpEarned] = useState(0);

  // Check for Level Up trigger
  useEffect(() => {
    const currentLevel = stats.level;
    localStorage.setItem(`level_${role}`, currentLevel.toString());
  }, [stats.level, role]);

  // Mindfulness cycle timer
  useEffect(() => {
    let interval: any;
    if (breathState !== 'idle') {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev === 1) {
            // State transition
            if (breathState === 'inhale') {
              setBreathState('hold');
              return 4;
            } else if (breathState === 'hold') {
              setBreathState('exhale');
              return 4;
            } else if (breathState === 'exhale') {
              const nextCycles = breathCycles + 1;
              setBreathCycles(nextCycles);
              if (nextCycles >= 3) {
                // Completed mindfulness game
                setBreathState('idle');
                setMindfulnessCompleted(true);
                setBreatheXpEarned(40);
                // Trigger local storage award or mock notification
                const prevBonus = parseInt(localStorage.getItem('breathe_bonus') || '0');
                localStorage.setItem('breathe_bonus', (prevBonus + 40).toString());
                return 0;
              } else {
                setBreathState('inhale');
                return 4;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathState, breathCycles]);

  const startBreathing = () => {
    setBreathState('inhale');
    setBreathTimer(4);
    setBreathCycles(0);
    setMindfulnessCompleted(false);
    setBreatheXpEarned(0);
  };

  const resetBreathing = () => {
    setBreathState('idle');
    setBreathTimer(4);
    setBreathCycles(0);
    setMindfulnessCompleted(false);
  };

  const percentage = Math.min(100, Math.floor((stats.currentLevelXp / stats.nextLevelXp) * 100));

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#1e293b] to-indigo-950 p-6 rounded-[28px] border border-slate-800 text-white shadow-xl relative overflow-hidden text-left">
      {/* Decorative floating grids */}
      <div className="absolute -top-12 -right-12 h-44 w-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 h-44 w-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER: Level & XP Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/10 border border-amber-300/30">
            <Trophy className="h-7 w-7 text-white fill-white/10 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {role === 'patient' ? 'Wellness Rank' : 'Clinical Mastery'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>{stats.streakDays} Day Streak (1.5x XP Boost)</span>
              </div>
            </div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              Level {stats.level} <span className="text-slate-400 font-medium text-sm">({stats.totalXp} Total XP)</span>
            </h3>
          </div>
        </div>

        {/* Dynamic XP Progress */}
        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>Progress to Level {stats.level + 1}</span>
            <span className="text-amber-400">{stats.currentLevelXp} / {stats.nextLevelXp} XP</span>
          </div>
          <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[shimmer_1s_infinite_linear]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* CORE NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 pb-3 mb-4 gap-2">
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quests' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Compass className="h-4 w-4" />
          Active Health Quests
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'badges' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="h-4 w-4" />
          Badges ({stats.unlockedBadgesCount}/{stats.badges.length})
        </button>
        {role === 'patient' && (
          <button
            onClick={() => setActiveTab('mindfulness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mindfulness' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Brain className="h-4 w-4" />
            Calm Breathing
          </button>
        )}
      </div>

      {/* TAB CONTENT: QUESTS */}
      {activeTab === 'quests' && (
        <div className="space-y-3.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">Active Missions</span>
            <span className="text-[11px] text-slate-400 font-semibold">Earn XP to Level Up</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.quests.map((quest) => (
              <div 
                key={quest.id} 
                className={`p-4 rounded-2xl border transition-all flex justify-between items-start ${
                  quest.completed 
                    ? 'bg-slate-800/40 border-slate-700/40 opacity-85' 
                    : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1.5 text-left flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    {quest.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-500 flex-shrink-0 animate-pulse" />
                    )}
                    <h4 className={`text-xs font-bold leading-none ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                      {quest.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-medium">{quest.description}</p>
                  
                  {/* Progress Line */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${quest.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${quest.progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400">{quest.progress}%</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5">
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                    +{quest.xpReward} XP
                  </span>
                  {!quest.completed && onActionClick && quest.actionSection && (
                    <button
                      onClick={() => onActionClick(quest.actionSection!)}
                      className="text-[10px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{quest.actionLabel}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">Achievements Showcase</span>
            <span className="text-[11px] text-slate-400 font-semibold">{stats.unlockedBadgesCount} / {stats.badges.length} Unlocked</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {stats.badges.map((badge) => (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center justify-between space-y-2.5 transition-all relative overflow-hidden ${
                  badge.unlocked 
                    ? 'bg-slate-800/80 border-slate-700 shadow-md hover:scale-102 hover:border-indigo-500/50' 
                    : 'bg-slate-900/40 border-slate-800/80 opacity-40'
                }`}
              >
                {/* Floating sparkles for unlocked badges */}
                {badge.unlocked && (
                  <div className="absolute top-1 right-1">
                    <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                )}
                
                <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-pulse">{badge.icon}</span>
                
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-100">{badge.title}</h4>
                  <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed max-w-[120px] mx-auto">
                    {badge.description}
                  </p>
                </div>

                <div className="w-full pt-1.5 border-t border-slate-800/80 flex items-center justify-center">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    badge.unlocked 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {badge.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CALM BREATHING MIND GAME */}
      {activeTab === 'mindfulness' && (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row items-center gap-6 justify-between text-left">
          <div className="space-y-3 max-w-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                Daily Wellness Focus
              </span>
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-emerald-400" />
                Clinician Pre-Appointment Breathing Break
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Calm your central nervous system before your medical consultation. Complete 3 deep breath cycles (Inhale, Hold, Exhale) to level up your focus and earn <strong className="text-amber-400">+40 XP</strong>!
            </p>

            <div className="flex gap-2">
              {breathState === 'idle' ? (
                <button
                  onClick={startBreathing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  Begin Session
                </button>
              ) : (
                <button
                  onClick={resetBreathing}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Cancel Session
                </button>
              )}
            </div>
          </div>

          {/* Interactive Breathing Stage */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 w-full md:w-56 h-48 relative overflow-hidden">
            {breathState !== 'idle' ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Breathing Expanding Circle */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={
                      breathState === 'inhale' 
                        ? { scale: [1, 2] } 
                        : breathState === 'hold' 
                        ? { scale: 2 } 
                        : { scale: [2, 1] }
                    }
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className={`h-16 w-16 rounded-full border-4 relative z-10 flex items-center justify-center ${
                      breathState === 'inhale' 
                        ? 'bg-emerald-500/20 border-emerald-400' 
                        : breathState === 'hold' 
                        ? 'bg-amber-500/20 border-amber-400' 
                        : 'bg-indigo-500/20 border-indigo-400'
                    }`}
                  >
                    <span className="text-sm font-extrabold text-white">{breathTimer}s</span>
                  </motion.div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-black text-slate-100 uppercase tracking-widest block">
                    {breathState === 'inhale' && '🌬️ Inhale Deeply'}
                    {breathState === 'hold' && '⏳ Hold Your Breath'}
                    {breathState === 'exhale' && '🍃 Exhale Gently'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                    Cycle {breathCycles + 1} of 3
                  </span>
                </div>
              </div>
            ) : mindfulnessCompleted ? (
              <div className="text-center space-y-3 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <Smile className="h-6 w-6 text-emerald-400 fill-emerald-400/20 animate-bounce" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-[#E8F5EC]">Stress Levels Restored!</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Daily relaxation challenge complete.</p>
                </div>
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
                  +{breatheXpEarned} XP Awarded
                </span>
              </div>
            ) : (
              <div className="text-center space-y-2 flex flex-col items-center justify-center">
                <Brain className="h-8 w-8 text-slate-500" />
                <h5 className="text-xs font-bold text-slate-300">Ready for Calmness</h5>
                <p className="text-[9.5px] text-slate-500 max-w-[140px] leading-normal font-medium mx-auto">
                  Click 'Begin Session' to align your clinical composure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
