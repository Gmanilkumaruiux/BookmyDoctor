import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface SearchBarProps {
  onFilterChange: (filters: { query: string; specialty: string; sortBy: string }) => void;
  availableSpecialties: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onFilterChange, availableSpecialties }) => {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Trigger filter change whenever fields change
  useEffect(() => {
    onFilterChange({ query, specialty, sortBy });
  }, [query, specialty, sortBy, onFilterChange]);

  const handleReset = () => {
    setQuery('');
    setSpecialty('');
    setSortBy('');
  };

  return (
    <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E5E7EB] space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Name/Hospital Search */}
        <div className="relative md:col-span-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors by name, hospital, or bio..."
            className="w-full pl-11 pr-4 py-3 bg-[#F5F7F5] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
          />
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#2E6F40]" />
        </div>

        {/* Specialization Filter */}
        <div className="relative md:col-span-3">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#F5F7F5] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All Specializations</option>
            {availableSpecialties.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <Filter className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#2E6F40]" />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#2E6F40]">
            <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="relative md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#F5F7F5] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">Sort By</option>
            <option value="rating">Highest Rating</option>
            <option value="experience">Most Experienced</option>
            <option value="fees-asc">Consultation: Low to High</option>
            <option value="fees-desc">Consultation: High to Low</option>
          </select>
          <ArrowUpDown className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#2E6F40]" />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#2E6F40]">
            <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Quick resets */}
      {(query || specialty || sortBy) && (
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F5F7F5]">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[#6B7280] font-medium">Applied Filters:</span>
            {query && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E8F5EC] text-[#2E6F40] font-bold border border-[#D1EADE]">
                Search: "{query}"
              </span>
            )}
            {specialty && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E8F5EC] text-[#2E6F40] font-bold border border-[#D1EADE]">
                Specialty: {specialty}
              </span>
            )}
            {sortBy && (
              <span className="px-2.5 py-1 rounded-lg bg-[#E8F5EC] text-[#2E6F40] font-bold border border-[#D1EADE]">
                Sorted
              </span>
            )}
          </div>
          <button
            onClick={handleReset}
            className="text-[#2E6F40] hover:text-[#245A33] font-bold hover:underline transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
