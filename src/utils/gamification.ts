export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  category: 'profile' | 'appointment' | 'record' | 'social' | 'special';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 to 100
  target: string;
  xpReward: number;
  completed: boolean;
  actionLabel: string;
  actionSection?: string;
  actionTab?: string;
}

export interface GamifiedStats {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  unlockedBadgesCount: number;
  badges: Badge[];
  quests: Quest[];
  streakDays: number;
}

export function calculatePatientGamification(
  currentUser: any,
  appointments: any[],
  medicalRecords: any[]
): GamifiedStats {
  const patientAppts = appointments.filter(a => a.patientId === currentUser?.id);
  const patientRecords = medicalRecords.filter(r => r.patientId === currentUser?.id);
  
  // 1. Calculate XP from Actions
  let baseXp = 0;
  
  // Profile Completeness Quest
  const hasProfile = currentUser?.phone && currentUser?.gender && currentUser?.dob && currentUser?.address;
  const profileProgress = [
    currentUser?.phone ? 25 : 0,
    currentUser?.gender ? 25 : 0,
    currentUser?.dob ? 25 : 0,
    currentUser?.address ? 25 : 0
  ].reduce((a, b) => a + b, 0);
  
  if (hasProfile) baseXp += 100;
  
  // Appointment XP
  const appointmentsCount = patientAppts.length;
  baseXp += appointmentsCount * 120; // 120 XP per appointment
  
  // Ratings XP
  const ratingsCount = patientAppts.filter(a => a.rating).length;
  baseXp += ratingsCount * 80; // 80 XP per review
  
  // Medical Records XP
  const recordsCount = patientRecords.length;
  baseXp += recordsCount * 150; // 150 XP per record
  
  // Streak calculations (simulated or based on creation)
  const streakDays = Math.min(3, Math.max(1, Math.floor(appointmentsCount * 1.5) || 1));
  baseXp += streakDays * 30; // 30 XP per streak day

  // 2. Compute Level
  const xpPerLevel = 250;
  const level = Math.floor(baseXp / xpPerLevel) + 1;
  const currentLevelXp = baseXp % xpPerLevel;
  const nextLevelXp = xpPerLevel;

  // 3. Badges Initialization
  const badges: Badge[] = [
    {
      id: 'p_triage_initiate',
      title: 'Triage Initiate',
      description: 'Completed your secure patient health profile details.',
      icon: '🛡️',
      xpReward: 100,
      unlocked: !!hasProfile,
      category: 'profile'
    },
    {
      id: 'p_first_contact',
      title: 'First Contact',
      description: 'Booked your first clinical consultation slot.',
      icon: '🤝',
      xpReward: 100,
      unlocked: appointmentsCount >= 1,
      category: 'appointment'
    },
    {
      id: 'p_review_expert',
      title: 'Feedback Master',
      description: 'Reviewed a completed clinician consultation with a star rating.',
      icon: '⭐',
      xpReward: 80,
      unlocked: ratingsCount >= 1,
      category: 'social'
    },
    {
      id: 'p_health_historian',
      title: 'Health Historian',
      description: 'Secured an official diagnostic record in your patient vault.',
      icon: '📁',
      xpReward: 150,
      unlocked: recordsCount >= 1,
      category: 'record'
    },
    {
      id: 'p_triage_titan',
      title: 'Triage Titan',
      description: 'Booked 3 or more total clinical checkups.',
      icon: '🏆',
      xpReward: 250,
      unlocked: appointmentsCount >= 3,
      category: 'appointment'
    },
    {
      id: 'p_vault_veteran',
      title: 'Clinical Archivist',
      description: 'Uploaded 3 or more critical health reports/scans.',
      icon: '💎',
      xpReward: 200,
      unlocked: recordsCount >= 3,
      category: 'record'
    }
  ];

  // 4. Quests Initialization
  const quests: Quest[] = [
    {
      id: 'q_profile',
      title: 'Triage Setup Mission',
      description: 'Fill in your phone, gender, birthday, and home address.',
      progress: profileProgress,
      target: '100%',
      xpReward: 100,
      completed: !!hasProfile,
      actionLabel: 'Complete Profile',
      actionSection: 'profile'
    },
    {
      id: 'q_book',
      title: 'Clinical Appointment',
      description: 'Book a medical consultation slot with an approved clinician.',
      progress: appointmentsCount >= 1 ? 100 : 0,
      target: '1 Booked',
      xpReward: 120,
      completed: appointmentsCount >= 1,
      actionLabel: 'Browse Doctors',
      actionSection: 'browse'
    },
    {
      id: 'q_upload',
      title: 'Upload Health Record',
      description: 'Secure a laboratory test, vaccine certificate, or doctor prescription.',
      progress: recordsCount >= 1 ? 100 : 0,
      target: '1 Uploaded',
      xpReward: 150,
      completed: recordsCount >= 1,
      actionLabel: 'Upload File',
      actionSection: 'records' // special flag
    },
    {
      id: 'q_rate',
      title: 'Rate Consultation',
      description: 'Submit your five-star review for a completed clinical visit.',
      progress: ratingsCount >= 1 ? 100 : 0,
      target: '1 Reviewed',
      xpReward: 80,
      completed: ratingsCount >= 1,
      actionLabel: 'Rate Visit',
      actionSection: 'dashboard'
    }
  ];

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  return {
    totalXp: baseXp,
    level,
    currentLevelXp,
    nextLevelXp,
    unlockedBadgesCount,
    badges,
    quests,
    streakDays
  };
}

export function calculateDoctorGamification(
  currentUser: any,
  appointments: any[],
  medicalRecords: any[]
): GamifiedStats {
  const doctorAppts = appointments.filter(a => a.doctorId === currentUser?.id);
  const doctorRecords = medicalRecords.filter(r => r.patientId === currentUser?.id || r.doctorName?.includes(currentUser?.name || ''));
  const doctorProfile = currentUser;

  let baseXp = 0;

  // Slots setup
  const slotsCount = doctorProfile?.slots?.length || 0;
  baseXp += slotsCount * 40; // 40 XP per schedule slot

  // Complete consultation XP
  const completedCount = doctorAppts.filter(a => a.status === 'completed').length;
  baseXp += completedCount * 180; // 180 XP per completed consult

  // Approved slots triage
  const approvedCount = doctorAppts.filter(a => a.status === 'approved').length;
  baseXp += approvedCount * 80;

  // Star Ratings XP
  const avgRating = doctorProfile?.rating || 5.0;
  const reviewsCount = doctorProfile?.reviewsCount || 0;
  baseXp += reviewsCount * 50;

  const streakDays = Math.min(5, Math.max(1, Math.floor(completedCount * 1.2) || 1));
  baseXp += streakDays * 40;

  // Level compute
  const xpPerLevel = 300;
  const level = Math.floor(baseXp / xpPerLevel) + 1;
  const currentLevelXp = baseXp % xpPerLevel;
  const nextLevelXp = xpPerLevel;

  // Badges
  const badges: Badge[] = [
    {
      id: 'd_duty_calls',
      title: 'Duty Calls',
      description: 'Activated 3 or more clinic schedule availability slots.',
      icon: '⏰',
      xpReward: 100,
      unlocked: slotsCount >= 3,
      category: 'profile'
    },
    {
      id: 'd_first_consult',
      title: 'First Recovery',
      description: 'Completed your first clinical consultation successfully.',
      icon: '🩺',
      xpReward: 150,
      unlocked: completedCount >= 1,
      category: 'appointment'
    },
    {
      id: 'd_five_star',
      title: 'Gold Standard',
      description: 'Clinician rating is 4.8 or higher with patients.',
      icon: '💫',
      xpReward: 200,
      unlocked: avgRating >= 4.8 && reviewsCount >= 1,
      category: 'social'
    },
    {
      id: 'd_triage_titan',
      title: 'Triage Captain',
      description: 'Administered checkups for 3 or more patients.',
      icon: '👑',
      xpReward: 250,
      unlocked: completedCount >= 3,
      category: 'appointment'
    }
  ];

  // Quests
  const quests: Quest[] = [
    {
      id: 'dq_slots',
      title: 'Establish Clinical Slots',
      description: 'Add 3 or more booking slots to your profile page.',
      progress: Math.min(100, Math.floor((slotsCount / 3) * 100)),
      target: '3 Slots',
      xpReward: 120,
      completed: slotsCount >= 3,
      actionLabel: 'Add Slots',
      actionSection: 'slots'
    },
    {
      id: 'dq_complete',
      title: 'Patient Consultations',
      description: 'Conduct and mark a consultation visit as completed.',
      progress: completedCount >= 1 ? 100 : 0,
      target: '1 Complete',
      xpReward: 180,
      completed: completedCount >= 1,
      actionLabel: 'View Queue',
      actionSection: 'queue'
    },
    {
      id: 'dq_five_star',
      title: 'Maintain Gold Star',
      description: 'Earn a rating of 4.8 or above on your clinician profile.',
      progress: avgRating >= 4.8 ? 100 : Math.floor((avgRating / 4.8) * 100),
      target: '4.8 Rating',
      xpReward: 200,
      completed: avgRating >= 4.8 && reviewsCount >= 1,
      actionLabel: 'See Reviews',
      actionSection: 'reviews'
    }
  ];

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  return {
    totalXp: baseXp,
    level,
    currentLevelXp,
    nextLevelXp,
    unlockedBadgesCount,
    badges,
    quests,
    streakDays
  };
}
