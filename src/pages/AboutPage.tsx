import React from 'react';
import { HeartPulse, Target, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const values = [
    { title: 'Patient-First Focus', desc: 'Every feature is modeled to minimize anxiety and speed up expert specialist connections.', icon: Target },
    { title: 'Credential Security', desc: 'All registered physicians go through thorough background check-ups before slot configurations.', icon: ShieldCheck },
    { title: 'Technical Integrity', desc: 'Drag-and-drop diagnostics storage and slot calendars designed for smooth client performance.', icon: Sparkles }
  ];

  return (
    <div className="space-y-16 py-4 text-left">
      
      {/* 1. Header Banner */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="md:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
            <HeartPulse className="h-3.5 w-3.5" />
            <span>Redefining Medical Bookings</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            We Bridge Patients & Trusted Clinicians
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
            BookMyDoctor was founded with a singular purpose: to remove clinical scheduling friction. By establishing direct, verified channels, we enable families to book consults, store medical scans, and communicate appointments with top specialists securely.
          </p>
        </div>
        <div className="md:col-span-5 rounded-2xl overflow-hidden h-64 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400"
            alt="Medical specialists"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* 2. Values Cards */}
      <section className="space-y-8">
        <div className="text-center max-w-md mx-auto space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Our Guiding Values</h3>
          <p className="text-slate-400 text-xs">The technical and medical principles backing every click.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-blue-200 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">{v.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Advisory Panel */}
      <section className="space-y-8 bg-slate-900 text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center max-w-md mx-auto space-y-2">
          <h3 className="text-2xl font-extrabold tracking-tight">Medical Advisory Board</h3>
          <p className="text-slate-400 text-xs">Physicians guiding platform guidelines and validation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {[
            { name: 'Dr. Sarah Jenkins', specialty: 'Cardiology, Board Director', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' },
            { name: 'Dr. Michael Chang', specialty: 'Pediatrics, Lead Reviewer', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' },
            { name: 'Dr. Emily Ross', specialty: 'Dermatology, Advisory Panel', avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200' },
          ].map((board, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl text-center space-y-3">
              <div className="h-16 w-16 rounded-full overflow-hidden mx-auto border border-slate-700 bg-slate-800">
                <img
                  src={board.avatar}
                  alt={board.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-sm text-white">{board.name}</h5>
                <span className="text-[10px] text-slate-400 font-medium">{board.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
