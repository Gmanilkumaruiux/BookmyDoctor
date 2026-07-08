import React from 'react';
import { Doctor } from '../types';
import { Star, ShieldCheck, MapPin, Briefcase, CalendarRange, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -6, 
        boxShadow: "0 20px 25px -5px rgba(46, 111, 64, 0.08), 0 8px 10px -6px rgba(46, 111, 64, 0.08)",
        borderColor: "#2E6F40"
      }}
      className="bg-white rounded-[20px] shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col justify-between transition-all duration-300"
    >
      {/* Top Section */}
      <div className="p-6 flex-1 text-left">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 shadow-sm">
            <img 
              src={doctor.avatar} 
              alt={doctor.name} 
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>

          {/* Core Info */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-[#1F2937] text-base md:text-lg truncate hover:text-[#2E6F40] transition-colors">
                <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
              </h4>
              <ShieldCheck className="h-4.5 w-4.5 text-[#2E6F40] flex-shrink-0" />
            </div>

            <p className="text-xs font-bold text-[#2E6F40] tracking-wider uppercase">{doctor.specialization}</p>

            <div className="flex items-center gap-1 text-amber-500 bg-amber-50/70 py-0.5 px-2 rounded-lg w-max">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold">{doctor.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">({doctor.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] space-y-3">
          {/* Hospital */}
          <div className="flex items-center gap-2.5 text-xs text-[#6B7280]">
            <MapPin className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
            <span className="truncate font-medium">{doctor.hospital}</span>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-2.5 text-xs text-[#6B7280]">
            <Briefcase className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
            <span className="font-medium">{doctor.experience}+ Years of Experience</span>
          </div>

          {/* Availability days */}
          <div className="flex items-center gap-2.5 text-xs text-[#6B7280]">
            <CalendarRange className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
            <span className="truncate font-medium">Available: {(doctor.availability || []).join(', ')}</span>
          </div>

          {/* Fee & Slots Summary */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wide">Consultation Fee</span>
              <p className="text-base font-extrabold text-[#1F2937] flex items-center">
                <DollarSign className="h-4 w-4 text-[#2E6F40] -mr-0.5" />
                {doctor.fees}
              </p>
            </div>
            
            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wide">Slots Available</span>
              <p className="text-xs font-bold text-[#2E6F40] bg-[#E8F5EC] py-0.5 px-2.5 rounded-lg inline-block">
                {(doctor.slots || []).length} Slots Today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-50 bg-[#F5F7F5]/50 grid grid-cols-2 gap-3">
        <Link
          to={`/doctors/${doctor.id}`}
          className="text-center py-2.5 px-3 rounded-xl border border-[#2E6F40] text-[#2E6F40] hover:bg-[#FAF9F6] transition-all font-bold text-xs"
        >
          View Profile
        </Link>
        <button
          onClick={() => onBook(doctor)}
          className="py-2.5 px-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white shadow-sm transition-all font-bold text-xs focus:outline-none hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          Book Slot
        </button>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
