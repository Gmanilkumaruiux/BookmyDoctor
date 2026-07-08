import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types';
import DoctorCard from '../components/DoctorCard';
import BookAppointmentModal from '../components/BookAppointmentModal';
import SearchBar from '../components/SearchBar';
import AiSmartSearch from '../components/AiSmartSearch';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Stethoscope, 
  Sparkles, 
  Clock, 
  Users, 
  Building2, 
  CheckCircle, 
  UserCheck, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  Star,
  ChevronLeft,
  ChevronRight,
  Quote
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { doctors, currentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const doctorsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patient') {
        navigate('/dashboard/patient', { replace: true });
      } else if (currentUser.role === 'doctor') {
        navigate('/dashboard/doctor', { replace: true });
      } else if (currentUser.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  // Search Mode & Filter state
  const [searchMode, setSearchMode] = useState<'manual' | 'ai'>('manual');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Reviews Carousel state & data
  const testimonials = [
    {
      name: 'Marcus Sterling',
      role: 'Verified Patient',
      specialty: 'Cardiology',
      doctor: 'Dr. Sarah Jenkins',
      comment: 'The drag-and-drop report uploader let me share my blood scans instantly. Dr. Jenkins was prepared for my consultation ahead of schedule! Extremely professional service.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      date: 'June 18, 2026'
    },
    {
      name: 'Diana Vance',
      role: 'Verified Patient',
      specialty: 'Pediatrics',
      doctor: 'Dr. Michael Chang',
      comment: 'BookMyDoctor removed the phone call anxiety completely. Selected pediatrician Chang, clicked my slot, and checked my toddler in 45 seconds later. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      date: 'May 24, 2026'
    },
    {
      name: 'Robert Chen',
      role: 'Verified Patient',
      specialty: 'Dermatology',
      doctor: 'Dr. Sarah Jenkins',
      comment: 'Getting a dermatological checkup was never this seamless. I uploaded high-res closeups of my skin rash and received an accurate prescription and lifestyle advice within a 15-minute consult.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      date: 'April 12, 2026'
    },
    {
      name: 'Elena Rostova',
      role: 'Verified Patient',
      specialty: 'Neurology',
      doctor: 'Dr. Michael Chang',
      comment: 'The automated text reminders kept me from missing my neurology follow-up. The video room built directly into BMD worked flawlessly on my smartphone browser without installing any app.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      date: 'July 01, 2026'
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    // Show only approved doctors on landing page
    const approved = doctors.filter(d => d.isApproved);
    setFilteredDoctors(approved);
  }, [doctors]);

  // Scroll logic for #doctors query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'doctors' || location.hash === '#doctors') {
      setTimeout(() => {
        doctorsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location]);

  const handleFilterChange = useCallback((filters: { query: string; specialty: string; sortBy: string }) => {
    let result = doctors.filter(d => d.isApproved);

    // Filter by name/hospital/bio
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        d => d.name.toLowerCase().includes(q) || 
             d.hospital.toLowerCase().includes(q) || 
             d.specialization.toLowerCase().includes(q) ||
             d.bio.toLowerCase().includes(q)
      );
    }

    // Filter by specialty
    if (filters.specialty) {
      result = result.filter(d => d.specialization === filters.specialty);
    }

    // Sorting
    if (filters.sortBy) {
      if (filters.sortBy === 'rating') {
        result = [...result].sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'experience') {
        result = [...result].sort((a, b) => b.experience - a.experience);
      } else if (filters.sortBy === 'fees-asc') {
        result = [...result].sort((a, b) => a.fees - b.fees);
      } else if (filters.sortBy === 'fees-desc') {
        result = [...result].sort((a, b) => b.fees - a.fees);
      }
    }

    setFilteredDoctors(result);
  }, [doctors]);

  const specialties = Array.from(new Set(doctors.filter(d => d.isApproved).map(d => d.specialization)));

  const handleBookTrigger = (doctor: Doctor) => {
    if (!currentUser) {
      navigate('/login', { state: { message: `Please log in to your patient account to book an appointment with ${doctor.name}.` } });
      return;
    }
    setSelectedDoctorForBooking(doctor);
    setIsBookingOpen(true);
  };

  const handleScrollToSection = () => {
    doctorsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { label: 'Verified Doctors', value: '1,000+', desc: 'Specialist experts', icon: Stethoscope, color: 'text-[#2E6F40] bg-[#E8F5EC] border-[#D1EADE]' },
    { label: 'Happy Patients', value: '5,000+', desc: 'High rating reviews', icon: Users, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    { label: 'Partner Hospitals', value: '250+', desc: 'Across top networks', icon: Building2, color: 'text-amber-700 bg-amber-50 border-amber-100' },
  ];

  const features = [
    { title: '24/7 Availability', desc: 'Book consultations day or night. Access a network of round-the-clock general and diagnostic specialists.', icon: Clock },
    { title: 'Verified Profiles', desc: 'Every registered clinician goes through rigorous medical board registration check-ups and credentials clearance.', icon: UserCheck },
    { title: 'Instant Confirmation', desc: 'Forget sitting on telephone waitlists. Receive immediate SMS or email slot confirmations inside 60 seconds.', icon: ShieldCheck },
  ];

  const FAQs = [
    { q: 'How do I schedule an appointment?', a: 'Navigate to our search directory below, select your desired specialist, browse their free calendar times, and fill in the appointment request form. You will receive an immediate notification upon confirmation.' },
    { q: 'Can I upload files and medical history reports?', a: 'Yes! Our platform supports full PDF/image attachments. You can drag and drop scans, blood panel results, and medicine scripts while requesting a slot, and view them inside your private patient portal.' },
    { q: 'Is there a consultation fee to book?', a: 'Booking requests are fully free on BookMyDoctor. Consultation fees listed on the doctor profiles are payable directly to the physician/hospital during your checkup.' },
    { q: 'How does verification work for physicians?', a: 'Doctors register credentials including licensing details, board certifications, and clinical backgrounds. Our administrators manually review each profile before approving them onto the public network.' }
  ];

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6 relative">
        {/* Soft decorative background glow shapes */}
        <div className="absolute top-1/4 -left-12 w-72 h-72 bg-[#E8F5EC]/45 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-12 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="lg:col-span-7 space-y-7 text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#E8F5EC] border border-[#D1EADE] text-[#2E6F40] text-xs font-extrabold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2E6F40] fill-[#2E6F40]/10 animate-pulse" />
            <span>Smart Care. Hassle-Free Scheduling.</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1F2937] tracking-tight leading-none"
            >
              Book Trusted Doctors <br className="hidden sm:inline" />
              <span className="text-[#2E6F40] bg-gradient-to-r from-[#2E6F40] to-[#245A33] bg-clip-text text-transparent">Anytime, Anywhere</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#6B7280] text-base md:text-lg max-w-xl leading-relaxed font-medium"
            >
              Access top-tier healthcare professionals in your vicinity. Compare ratings, consultations, clinical experiences, and secure booking slots in under a minute.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            <button
              onClick={handleScrollToSection}
              className="px-8 py-4 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm shadow-md shadow-emerald-950/10 transition-all cursor-pointer text-center hover:scale-[1.03] active:scale-[0.98] duration-300"
            >
              Book Appointment
            </button>
            <button
              onClick={handleScrollToSection}
              className="px-8 py-4 rounded-xl border border-[#E5E7EB] hover:border-[#2E6F40] bg-white text-[#2E6F40] font-bold text-sm transition-all cursor-pointer text-center hover:bg-[#FAF9F6] hover:scale-[1.03] active:scale-[0.98] duration-300"
            >
              Find Doctors
            </button>
          </motion.div>
        </div>

        {/* Hero Illustration with Floating Animation */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="absolute inset-0 bg-[#2E6F40]/5 blur-3xl rounded-full scale-75" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0]
            }}
            transition={{ 
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative w-full max-w-md h-[340px] sm:h-[400px] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white"
          >
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"
              alt="Medical Consultation"
              className="h-full w-full object-cover"
            />
            {/* Soft instant overlay card */}
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#E5E7EB] flex items-center gap-3.5 max-w-[250px]">
              <div className="h-10 w-10 rounded-full bg-[#E8F5EC] border border-[#D1EADE] flex items-center justify-center text-[#2E6F40]">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-[#1F2937] leading-tight">Instant Confirmation</p>
                <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">99.8% Booking success rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex items-center gap-5 hover:shadow-md hover:border-[#2E6F40]/30 transition-all duration-300"
            >
              <div className={`p-4 rounded-xl border ${stat.color} flex-shrink-0`}>
                <StatIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">{stat.value}</h4>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">{stat.label}</p>
                <span className="text-[11px] text-[#6B7280] font-medium block mt-0.5">{stat.desc}</span>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Why Choose BookMyDoctor</h2>
          <p className="text-[#6B7280] text-sm font-semibold">Empowering healthcare choices through technical convenience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-7 rounded-[20px] border border-[#E5E7EB] shadow-sm space-y-4 text-left group hover:border-[#2E6F40]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-[#E8F5EC] text-[#2E6F40] border border-[#D1EADE] flex items-center justify-center group-hover:bg-[#2E6F40] group-hover:text-white transition-all duration-300">
                  <FeatIcon className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-[#1F2937]">{feat.title}</h4>
                <p className="text-[#6B7280] text-xs leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. DOCTORS GRID (SEARCH & BOOK) */}
      <section id="doctors-section" ref={doctorsSectionRef} className="space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Find & Book Doctors</h2>
            <p className="text-[#6B7280] text-sm font-semibold">Filter specialists and pick secure consultation slots.</p>
          </div>
          <span className="text-xs font-bold text-[#2E6F40] bg-[#E8F5EC] border border-[#D1EADE] py-1.5 px-3 rounded-lg block shadow-sm">
            {filteredDoctors.length} Specialists Available
          </span>
        </div>

        {!currentUser && (
          <div className="bg-[#E8F5EC] border border-[#D1EADE] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2E6F40] uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 fill-[#2E6F40]/10 text-[#2E6F40] animate-pulse" />
                Clinician Slot Availability Preview
              </span>
              <p className="text-xs text-[#2E6F40] font-medium leading-relaxed">
                You are currently viewing our interactive specialist directory. Please sign in or register to pick active consultation slots and book clinical appointments.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#2E6F40] hover:bg-[#245A33] text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap self-start sm:self-center shadow-md hover:scale-[1.03] duration-300"
            >
              Login to Book
            </button>
          </div>
        )}

        {/* Search Mode Toggles */}
        <div className="flex border-b border-[#E5E7EB] gap-6 pb-0.5 text-left">
          <button
            onClick={() => setSearchMode('manual')}
            className={`pb-3 px-1 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'manual'
                ? 'border-[#2E6F40] text-[#2E6F40]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            <span>🔍 Standard Filter Directory</span>
          </button>
          <button
            onClick={() => setSearchMode('ai')}
            className={`pb-3 px-1 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === 'ai'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#3B82F6] fill-blue-50" />
            <span>AI Smart Matchmaker</span>
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest font-extrabold scale-90">AI</span>
          </button>
        </div>

        {searchMode === 'ai' ? (
          <AiSmartSearch
            onBookTrigger={handleBookTrigger}
            allDoctors={doctors}
            patientId={currentUser?.id}
          />
        ) : (
          <>
            {/* Search Bar Component */}
            <SearchBar onFilterChange={handleFilterChange} availableSpecialties={specialties} />

            {/* Doctor Grid */}
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} onBook={handleBookTrigger} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-12 text-center max-w-md mx-auto space-y-3.5 shadow-sm">
                <p className="text-4xl">🔍</p>
                <h4 className="font-bold text-[#1F2937] text-lg">No doctors found</h4>
                <p className="text-xs text-[#6B7280] font-medium leading-relaxed">Try modifying your text query or selecting a different specialization filter.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="space-y-10 bg-[#1D3A25] text-white rounded-[24px] p-8 md:p-12 relative overflow-hidden shadow-xl">
        {/* Background ambient glows */}
        <div className="absolute top-0 right-0 h-72 w-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-72 w-72 bg-emerald-300/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Summary stats */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-[#E8F5EC] uppercase tracking-widest block bg-[#FAF9F6]/10 px-3 py-1 rounded-full border border-white/10 w-fit">TESTIMONIALS</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Patient Reviews</h2>
              <p className="text-emerald-100/70 text-xs md:text-sm leading-relaxed font-medium">
                See how BookMyDoctor is transforming healthcare delivery, one seamless consultation at a time.
              </p>
            </div>

            {/* Satisfaction Card */}
            <div className="bg-white/10 border border-white/10 p-6 rounded-2xl space-y-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white">4.9</span>
                <span className="text-emerald-200 text-xs mt-1">/ 5.0</span>
              </div>
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-emerald-100/80 text-xs leading-normal font-medium">
                Based on over 1,420+ verified post-consultation surveys this year.
              </p>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200 font-bold">
                <span>99.2% Recommend BMD</span>
                <span className="text-amber-400 font-black">★ Top Tier</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dynamic Carousel */}
          <div 
            className="lg:col-span-8 relative bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl flex flex-col justify-between min-h-[300px] backdrop-blur-sm shadow-inner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Quote watermark icon */}
            <div className="absolute top-6 right-6 opacity-5 pointer-events-none text-white">
              <Quote className="h-20 w-20" />
            </div>

            {/* Testimonial Display Area with animation */}
            <div className="relative overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="space-y-5 text-left"
                >
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {Array.from({ length: testimonials[currentReview].rating }).map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-white text-sm md:text-base leading-relaxed italic font-medium">
                    "{testimonials[currentReview].comment}"
                  </p>

                  <div className="flex items-center gap-3.5 pt-2">
                    <img 
                      src={testimonials[currentReview].avatar} 
                      alt={testimonials[currentReview].name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-800 shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {testimonials[currentReview].name}
                        <span className="inline-flex items-center justify-center bg-[#E8F5EC]/15 text-[#E8F5EC] text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/20">
                          Verified Patient
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-100/70 font-semibold mt-0.5">
                        Consulted <span className="font-bold text-white">{testimonials[currentReview].doctor}</span> ({testimonials[currentReview].specialty}) • {testimonials[currentReview].date}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation & Indicators */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentReview(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentReview === idx 
                        ? 'w-6 bg-[#E8F5EC]' 
                        : 'w-2 bg-emerald-800 hover:bg-emerald-700'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentReview((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2 bg-emerald-950/45 hover:bg-emerald-900/60 text-white rounded-xl border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8F5EC] cursor-pointer"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setCurrentReview((prev) => (prev + 1) % testimonials.length)}
                  className="p-2 bg-emerald-950/45 hover:bg-emerald-900/60 text-white rounded-xl border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8F5EC] cursor-pointer"
                  aria-label="Next Review"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Frequently Asked Questions</h2>
          <p className="text-[#6B7280] text-sm font-semibold">Clear information regarding the platform workflow.</p>
        </div>

        <div className="space-y-4">
          {FAQs.map((faq, idx) => {
            const isOpened = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm text-left transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpened ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-[#1F2937] hover:text-[#2E6F40] font-semibold text-sm md:text-base focus:outline-none transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-5 w-5 text-[#2E6F40]" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpened ? 'rotate-180 text-[#2E6F40]' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isOpened && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#E5E7EB]/50"
                    >
                      <p className="p-5 text-[#6B7280] text-xs md:text-sm leading-relaxed bg-[#FAF9F6] font-medium">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Appointment Modal container */}
      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctor={selectedDoctorForBooking}
      />

    </div>
  );
};

export default LandingPage;
