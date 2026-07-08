import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Stethoscope, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Building, 
  DollarSign, 
  Award, 
  GraduationCap, 
  Upload, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Hash,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const ApplyDoctor: React.FC = () => {
  const { currentUser, applyDoctor, doctors } = useApp();
  const navigate = useNavigate();

  // Basic Details
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  // Professional Details
  const [specialization, setSpecialization] = useState('General Physician');
  const [experience, setExperience] = useState('5');
  const [hospital, setHospital] = useState('');
  const [qualification, setQualification] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');

  // File Upload states (with simulated progress & metadata)
  const [medicalCertificate, setMedicalCertificate] = useState<{ name: string; size: string; progress: number } | null>(null);
  const [governmentId, setGovernmentId] = useState<{ name: string; size: string; progress: number } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<{ name: string; preview: string; progress: number } | null>(null);

  // Drag states
  const [dragMedical, setDragMedical] = useState(false);
  const [dragGov, setDragGov] = useState(false);
  const [dragPhoto, setDragPhoto] = useState(false);

  // Status & Error
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // File helpers
  const handleSimulatedUpload = (
    file: File, 
    setter: React.Dispatch<React.SetStateAction<any | null>>,
    isImage: boolean = false
  ) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const initialFileState = {
      name: file.name,
      size: `${sizeInMB} MB`,
      progress: 0,
      preview: isImage ? URL.createObjectURL(file) : undefined
    };
    setter(initialFileState);

    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setter((prev: any) => prev ? { ...prev, progress: currentProgress } : null);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const handleFileDrop = (
    e: React.DragEvent, 
    setter: React.Dispatch<React.SetStateAction<any | null>>,
    dragSetter: React.Dispatch<React.SetStateAction<boolean>>,
    isImage: boolean = false
  ) => {
    e.preventDefault();
    dragSetter(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSimulatedUpload(file, setter, isImage);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<any | null>>,
    isImage: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulatedUpload(file, setter, isImage);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !phone || !hospital || !qualification || !registrationNumber || !address) {
      setErrorMessage('Please fill in all required text fields.');
      return;
    }

    if (!medicalCertificate || medicalCertificate.progress < 100) {
      setErrorMessage('Please upload a Medical Certificate before submitting.');
      return;
    }

    if (!governmentId || governmentId.progress < 100) {
      setErrorMessage('Please upload a Government ID before submitting.');
      return;
    }

    setIsSubmitting(true);

    const result = await applyDoctor({
      name,
      email,
      phone,
      specialization,
      qualification,
      experience: Number(experience),
      hospital,
      registrationNumber,
      address,
      medicalCertificate: medicalCertificate.name,
      governmentId: governmentId.name,
      avatar: profilePhoto?.preview || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(result.error || 'Failed to submit the application.');
    }
  };

  // Check if they already have doctor status
  const existingDocProfile = doctors.find(
    d => d.id === currentUser?.id || (currentUser?.email && d.email === currentUser.email)
  );

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto px-4 py-6">
      
      {/* Page Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#E8F5EC] border border-[#D1EADE] text-[#2E6F40]">
            <Stethoscope className="h-7 w-7 animate-pulse" />
          </div>
          Join BookMyDoctor as a Partner
        </h2>
        <p className="text-sm text-[#6B7280] font-medium mt-2">
          Apply for professional credentials validation and start offering active clinical consultation slots.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl border border-[#E5E7EB] p-10 text-center space-y-6 shadow-md max-w-2xl mx-auto"
          >
            <div className="inline-flex h-16 w-16 rounded-full bg-[#E8F5EC] text-[#2E6F40] border border-[#D1EADE] items-center justify-center shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-[#1F2937] text-xl tracking-tight">Application Submitted Successfully!</h4>
              <p className="text-[#6B7280] text-sm leading-relaxed max-w-md mx-auto font-medium">
                Your medical licensing, clinic details, and professional qualifications are undergoing active clinical review. Upon verification, BMD Admin will approve your application and generate your secure doctor portal login credentials.
              </p>
            </div>
            
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl text-left space-y-2 max-w-md mx-auto">
              <span className="text-[10px] font-bold text-[#2E6F40] uppercase tracking-wider block">Application Status</span>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xs font-semibold text-[#1F2937]">Pending Admin Approval</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  navigate('/');
                }}
                className="px-6 py-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                Go back to Homepage
              </button>
            </div>
          </motion.div>
        ) : existingDocProfile ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#E5E7EB] p-8 space-y-6 text-center max-w-md mx-auto shadow-sm"
          >
            <div className="inline-flex p-4 rounded-full bg-[#E8F5EC] border border-[#D1EADE] text-3xl">
              👨‍⚕️
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-[#1F2937] text-lg tracking-tight">Verification Status Checked</h4>
              {existingDocProfile.isApproved ? (
                <div className="space-y-4">
                  <p className="text-[#6B7280] text-xs leading-relaxed font-medium">
                    You are already registered and approved as an active medical specialist in our directory. Please access your designated dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/doctor')}
                    className="px-6 py-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Enter Doctor Console
                  </button>
                </div>
              ) : (
                <p className="text-[#6B7280] text-xs leading-relaxed font-medium">
                  Your clinical registration credentials are currently PENDING administrative check. We appreciate your patience.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit} 
            className="space-y-8"
          >
            {/* Note & Banner */}
            <div className="p-4 bg-[#E8F5EC] border border-[#D1EADE] rounded-2xl text-xs text-[#2E6F40] leading-relaxed flex items-start gap-3 shadow-sm">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-[#2E6F40] mt-0.5 animate-pulse" />
              <div>
                <strong className="font-extrabold block text-sm mb-1">Clinical Registration Note</strong>
                All partner doctor applications are subjected to meticulous background, qualification, and council registrations scrutiny. Upon validation, the administrator will authorize the profile and generate official credentials.
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: Personal Details */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-[#2E6F40]"></span>
                1. Basic Identity Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={!!currentUser}
                      placeholder="e.g. Dr. Jane Mitchell"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all disabled:opacity-70"
                    />
                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={!!currentUser}
                      placeholder="e.g. jane.mitchell@clinic.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all disabled:opacity-70"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Mobile / Practice Phone *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Professional Profile */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-[#2E6F40]"></span>
                2. Professional & Clinical Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Medical Specialty *</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Clinical Experience (Years) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Qualification */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Education & Degree Qualifications *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD - Cardiology, Johns Hopkins University School of Medicine"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Medical Council Reg Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Medical Council Registration Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. MC-908123-A"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Hospital Clinic */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Primary Clinic / Hospital Affiliation *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mount Sinai Medical Center, NY"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Hospital / Practice Address *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suite 400, 100 E 77th St, New York, NY 10075"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Documents and Photo Upload */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-[#2E6F40]"></span>
                3. Verification Documents Upload
              </h3>

              <div className="space-y-6">
                
                {/* 1. Medical Certificate */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Upload Medical Certificate * (PDF, JPEG, or PNG)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragMedical(true); }}
                    onDragLeave={() => setDragMedical(false)}
                    onDrop={(e) => handleFileDrop(e, setMedicalCertificate, setDragMedical)}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      dragMedical ? 'border-[#2E6F40] bg-[#E8F5EC]/25' : 'border-[#E5E7EB] bg-[#FAF9F6] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="med-cert-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setMedicalCertificate)}
                      className="hidden"
                    />
                    <label htmlFor="med-cert-upload" className="cursor-pointer block space-y-2">
                      <div className="h-10 w-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#6B7280] shadow-sm">
                        <Upload className="h-4.5 w-4.5" />
                      </div>
                      <p className="text-xs text-[#1F2937] font-bold">Drag and drop files here, or <span className="text-[#2E6F40] hover:underline">browse files</span></p>
                      <p className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  {medicalCertificate && (
                    <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {medicalCertificate.progress < 100 ? (
                          <div className="h-2 w-20 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2E6F40] transition-all" style={{ width: `${medicalCertificate.progress}%` }}></div>
                          </div>
                        ) : (
                          <FileCheck className="h-5 w-5 text-[#2E6F40]" />
                        )}
                        <div className="text-left leading-none">
                          <p className="text-xs font-bold text-[#1F2937] truncate max-w-[200px] sm:max-w-xs">{medicalCertificate.name}</p>
                          <span className="text-[10px] text-[#6B7280]">{medicalCertificate.size} • {medicalCertificate.progress}%</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setMedicalCertificate(null)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Government ID */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Upload Government ID * (Passport, License, etc.)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragGov(true); }}
                    onDragLeave={() => setDragGov(false)}
                    onDrop={(e) => handleFileDrop(e, setGovernmentId, setDragGov)}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      dragGov ? 'border-[#2E6F40] bg-[#E8F5EC]/25' : 'border-[#E5E7EB] bg-[#FAF9F6] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="gov-id-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setGovernmentId)}
                      className="hidden"
                    />
                    <label htmlFor="gov-id-upload" className="cursor-pointer block space-y-2">
                      <div className="h-10 w-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#6B7280] shadow-sm">
                        <Upload className="h-4.5 w-4.5" />
                      </div>
                      <p className="text-xs text-[#1F2937] font-bold">Drag and drop files here, or <span className="text-[#2E6F40] hover:underline">browse files</span></p>
                      <p className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  {governmentId && (
                    <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {governmentId.progress < 100 ? (
                          <div className="h-2 w-20 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2E6F40] transition-all" style={{ width: `${governmentId.progress}%` }}></div>
                          </div>
                        ) : (
                          <FileCheck className="h-5 w-5 text-[#2E6F40]" />
                        )}
                        <div className="text-left leading-none">
                          <p className="text-xs font-bold text-[#1F2937] truncate max-w-[200px] sm:max-w-xs">{governmentId.name}</p>
                          <span className="text-[10px] text-[#6B7280]">{governmentId.size} • {governmentId.progress}%</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setGovernmentId(null)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Profile Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1F2937] uppercase tracking-wider block">Upload Profile Photo (Optional)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragPhoto(true); }}
                    onDragLeave={() => setDragPhoto(false)}
                    onDrop={(e) => handleFileDrop(e, setProfilePhoto, setDragPhoto, true)}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      dragPhoto ? 'border-[#2E6F40] bg-[#E8F5EC]/25' : 'border-[#E5E7EB] bg-[#FAF9F6] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="profile-upload"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setProfilePhoto, true)}
                      className="hidden"
                    />
                    <label htmlFor="profile-upload" className="cursor-pointer block space-y-2">
                      <div className="h-10 w-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#6B7280] shadow-sm">
                        <Upload className="h-4.5 w-4.5" />
                      </div>
                      <p className="text-xs text-[#1F2937] font-bold">Drag and drop image here, or <span className="text-[#2E6F40] hover:underline">browse files</span></p>
                      <p className="text-[10px] text-[#6B7280]">Supports JPEG, PNG up to 5MB</p>
                    </label>
                  </div>
                  {profilePhoto && (
                    <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {profilePhoto.preview ? (
                          <img
                            src={profilePhoto.preview}
                            alt="Profile Preview"
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 rounded-full border border-[#E5E7EB] object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-[#6B7280]">
                            <UserIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="text-left leading-none">
                          <p className="text-xs font-bold text-[#1F2937] truncate max-w-[200px]">{profilePhoto.name}</p>
                          <span className="text-[10px] text-[#6B7280]">{profilePhoto.progress}% uploaded</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setProfilePhoto(null)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Submit Section */}
            <div className="p-6 bg-white border border-[#E5E7EB] rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <p className="text-xs text-[#6B7280] font-semibold text-center sm:text-left">
                * Indicates a strictly required clinical application detail.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50 text-center"
              >
                {isSubmitting ? 'Submitting Registry Details...' : 'Submit Partnership Application'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplyDoctor;
