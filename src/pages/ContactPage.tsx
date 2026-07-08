import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, HeartPulse, Send } from 'lucide-react';
import { motion } from 'motion/react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSuccess(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

    setTimeout(() => setIsSuccess(false), 3000);
  };

  const contactDetails = [
    { label: 'Patient Support Hotlines', value: '+1 (555) BOOK-DOC', desc: 'Direct scheduling assistance', icon: Phone },
    { label: 'Email Correspondence', value: 'support@bookmydoctor.com', desc: 'Queries answered in 24 hrs', icon: Mail },
    { label: 'Platform Headquarters', value: '100 Medical Center Way, Suite 500, San Francisco', desc: 'Corporate office locations', icon: MapPin },
  ];

  return (
    <div className="space-y-12 py-4 text-left">
      
      {/* Header title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Contact Customer Care</h2>
        <p className="text-xs text-slate-400">Reach our technical and clinician partner teams immediately.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Direct Contacts</h3>
          <p className="text-xs text-slate-400">Experience responsive assistance through our dedicated help desks.</p>

          <div className="space-y-4 pt-2">
            {contactDetails.map((det) => {
              const Icon = det.icon;
              return (
                <div key={det.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">{det.label}</span>
                    <span className="text-sm font-semibold text-slate-800 block truncate mt-0.5">{det.value}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{det.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Support Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Submit Support Request</h3>
            <p className="text-xs text-slate-400">Encountering problems during booking or profile updates? Drop a ticket below.</p>

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Support Request Sent!</span>
                  We have queued your ticket. A customer specialist will email you shortly.
                </div>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ticket Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Slot confirmation delay"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Message details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed description of your query or platform feedback..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Action */}
                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ContactPage;
