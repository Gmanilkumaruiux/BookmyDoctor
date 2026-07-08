import React, { useState } from 'react';
import { Sparkles, Loader2, Calendar, Star, DollarSign, Award, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiSmartSearchProps {
  onBookTrigger: (doctor: any) => void;
  allDoctors: any[];
  patientId?: string;
}

const AiSmartSearch: React.FC<AiSmartSearchProps> = ({ onBookTrigger, allDoctors, patientId }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [interpretedFilters, setInterpretedFilters] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResults(null);
    setInterpretedFilters(null);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          patientId: patientId || 'guest',
          clientDoctors: allDoctors // Sync with current app doctors
        })
      });

      if (!response.ok) {
        throw new Error('Could not process AI search query.');
      }

      const data = await response.json();
      setInterpretedFilters(data.interpretedFilters);
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullDoctorDetails = (doctorId: string) => {
    return allDoctors.find(d => d.id === doctorId);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/40 via-white to-slate-50/30 p-8 rounded-[20px] border border-blue-100 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3B82F6] fill-blue-100 animate-pulse" />
            AI Smart Matchmaker
          </h4>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Describe what you need in plain words (e.g., "skin doctor under 150", "female heart clinician near SF", "experienced child specialist"). Our clinical AI maps details instantly.
          </p>
        </div>

        {/* AI Powered Badge */}
        <div className="self-start sm:self-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F5EC] text-[#2E6F40] font-bold text-[10px] uppercase tracking-wider border border-[#D1EADE] shadow-sm">
            <Sparkles className="h-3 w-3 fill-[#2E6F40]/10" />
            AI Powered
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your health concern, budget, or preferred doctor..."
          className="flex-1 px-5 py-3.5 bg-[#F5F7F5] border border-[#E5E7EB] rounded-xl text-slate-800 text-sm focus:border-[#3B82F6] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.03]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Parsing Intent...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Search with AI
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
          ⚠️ {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* Loading overlay indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center space-y-3.5"
          >
            <div className="h-11 w-11 bg-blue-50 text-[#3B82F6] flex items-center justify-center rounded-full mx-auto animate-bounce border border-blue-100 shadow-sm">
              <Sparkles className="h-5 w-5 fill-blue-100" />
            </div>
            <p className="text-xs font-bold text-slate-600">Clinical LLM is matching physicians to your constraints...</p>
          </motion.div>
        )}

        {/* Results layout */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Interpreted Filters display */}
            {interpretedFilters && Object.keys(interpretedFilters).length > 0 && (
              <div className="space-y-2 bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Interpreted Query Parameters
                </span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {interpretedFilters.specialization && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[11px] flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Specialty: {interpretedFilters.specialization}
                    </span>
                  )}
                  {interpretedFilters.gender && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 font-bold text-[11px]">
                      Gender: {interpretedFilters.gender}
                    </span>
                  )}
                  {interpretedFilters.feesLimit && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[11px] flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3" />
                      Max Fee: ${interpretedFilters.feesLimit}
                    </span>
                  )}
                  {interpretedFilters.experienceMin && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[11px]">
                      Exp: {interpretedFilters.experienceMin}+ Years
                    </span>
                  )}
                  {interpretedFilters.availableToday && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[11px]">
                      Urgent Booking Today
                    </span>
                  )}
                  {interpretedFilters.ratingMin && (
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 font-bold text-[11px] flex items-center gap-1">
                      <Star className="h-3 w-3 fill-teal-500" />
                      Rating: {interpretedFilters.ratingMin}+
                    </span>
                  )}
                  {interpretedFilters.location && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Loc: {interpretedFilters.location}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* AI Recommended Grid */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                AI Match Score Recommendations ({results.length} matched)
              </span>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {results.map((rec) => {
                    const fullDoc = getFullDoctorDetails(rec.doctorId);
                    return (
                      <div
                        key={rec.doctorId}
                        className="bg-white rounded-[20px] border border-slate-200/70 p-6 shadow-sm space-y-4 hover:border-[#3B82F6] transition-all text-left flex flex-col justify-between hover:shadow-md hover:-translate-y-1 duration-300"
                      >
                        {/* Doctor Info Row */}
                        <div className="flex gap-3 justify-between items-start">
                          <div className="flex gap-3">
                            <img
                              src={rec.avatar}
                              alt={rec.name}
                              className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-0.5">
                              <h5 className="font-bold text-[#1F2937] text-sm leading-tight">{rec.name}</h5>
                              <span className="text-[10px] font-bold text-[#2E6F40] uppercase tracking-wider block">
                                {rec.specialization}
                              </span>
                            </div>
                          </div>

                          {/* Match Score */}
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-[#2E6F40] border border-emerald-100 text-xs font-extrabold flex-shrink-0">
                            <Sparkles className="h-3.5 w-3.5 fill-[#2E6F40]/15 text-[#2E6F40]" />
                            <span>{rec.matchScore}% Match</span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E5E7EB]/50 space-y-1.5 text-xs text-[#6B7280]">
                          {rec.reasons.map((reason: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-[#2E6F40] mt-0.5 flex-shrink-0" />
                              <span className="leading-normal font-medium">{reason}</span>
                            </div>
                          ))}
                        </div>

                        {/* Booking & Fees details */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="text-[#6B7280] font-medium space-y-0.5">
                            <span className="block font-extrabold text-[#1F2937]">${rec.fees} fee</span>
                            <span className="block text-[10px] font-semibold">{rec.experience} years experience</span>
                          </div>

                          <button
                            onClick={() => fullDoc && onBookTrigger(fullDoc)}
                            className="px-4 py-2.5 bg-[#2E6F40] hover:bg-[#245A33] text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Book Consult
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-white border border-slate-100 rounded-2xl text-center text-slate-400 text-xs">
                  No specialists matched those precise requirements. Please broaden your query wording.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiSmartSearch;
