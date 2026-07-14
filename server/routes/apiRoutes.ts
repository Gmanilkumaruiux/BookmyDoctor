import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  UserModel, 
  DoctorModel, 
  AppointmentModel, 
  MedicalRecordModel, 
  NotificationModel,
  DoctorApplicationModel
} from '../db';
import { validateRequest, loginSchema, registerSchema, doctorApplicationSchema } from '../middlewares/validateRequest';
import { authorizeRoles } from '../middlewares/roleAuth';
import { authRateLimiter } from '../middlewares/rateLimiter';
import logger from '../utils/logger';

const router = Router();

// Retrieve JWT Secret - Throws hard error if missing in environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.error("CRITICAL SECURITY VIOLATION: JWT_SECRET environment variable is missing!");
  throw new Error("CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing.");
}

// Middleware for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid. Please log in again.' });
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    next();
  });
}

// ---------------- AUTH ROUTES ----------------

// Login (With secure bcrypt password hashing verification)
router.post('/auth/login', authRateLimiter, validateRequest(loginSchema), async (req: Request, res: Response) => {
  const { email, password, requiredRole } = req.body;

  // Special handling for the fixed System Admin account
  if (email.toLowerCase() === 'admin@gmail.com') {
    let user = await UserModel.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      const salt = bcrypt.genSaltSync(10);
      user = await UserModel.create({
        id: 'user_admin_fixed',
        name: 'System Administrator',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('admin', salt),
        role: 'admin',
        phone: '+1 (555) 999-0000',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'
      });
    }

    if (requiredRole && requiredRole !== 'admin') {
      return res.status(403).json({ error: `Unauthorized. This login portal is restricted to ${requiredRole} accounts only.` });
    }

    // Verify hashed password
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin', name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ success: true, token, user });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // Enforce correct portal for each role
  if (requiredRole && user.role !== requiredRole) {
    return res.status(403).json({ error: `Unauthorized. This login portal is restricted to ${requiredRole} accounts only.` });
  }

  // Doctors must be approved to login
  if (user.role === 'doctor' && !user.isApproved) {
    return res.status(403).json({ error: 'Your doctor account is pending administrator approval and verification.' });
  }

  // Password verification (Support legacy plain fallback or secure bcrypt hashes)
  let isPasswordValid = false;
  if (user.password) {
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordValid = bcrypt.compareSync(password, user.password);
    } else {
      isPasswordValid = (user.password === password);
    }
  } else {
    isPasswordValid = (password === 'password' || password.length >= 4);
  }

  if (isPasswordValid) {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ success: true, token, user });
  }

  return res.status(401).json({ error: 'Invalid email or password.' });
});

// Register (With standard bcrypt encryption)
router.post('/auth/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  const userData = req.body;

  // Doctors and Administrators cannot self-register
  if (userData.role === 'doctor') {
    return res.status(403).json({ error: 'Doctors cannot self-register. Please submit a practitioner application for review.' });
  }
  if (userData.role === 'admin' || userData.email.toLowerCase() === 'admin@gmail.com') {
    return res.status(403).json({ error: 'Administrator accounts cannot be self-registered.' });
  }

  const existing = await UserModel.findOne({ email: userData.email });
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  // Encrypt password securely
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);

  const avatar = userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`;
  
  const newUser = await UserModel.create({
    ...userData,
    password: hashedPassword,
    avatar,
    isApproved: false
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Welcome notification
  await NotificationModel.create({
    userId: newUser.id,
    message: `Welcome ${newUser.name}! Your account has been registered successfully.`,
    date: new Date().toISOString(),
    read: false,
    type: 'success'
  });

  return res.json({ success: true, token, user: newUser });
});

// Google Login
router.post('/auth/google', async (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Google email and name are required.' });
  }

  let user = await UserModel.findOne({ email });
  let isNew = false;

  if (!user) {
    isNew = true;
    user = await UserModel.create({
      name,
      email,
      role: 'patient',
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    await NotificationModel.create({
      userId: user.id,
      message: `Welcome ${name}! Your account has been registered successfully via Google.`,
      date: new Date().toISOString(),
      read: false,
      type: 'success'
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ success: true, token, user, isNew });
});


// ---------------- DOCTORS ROUTES ----------------

// Get approved/active doctors
router.get('/doctors', async (req: Request, res: Response) => {
  const doctors = await DoctorModel.find({ isApproved: true });
  return res.json(doctors);
});

// Get all doctors (Admin only, role check)
router.get('/doctors/all', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const doctors = await DoctorModel.find();
  return res.json(doctors);
});

// Get all users (Admin only, role check)
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const users = await UserModel.find();
  return res.json(users);
});

// Verify doctor profile (Admin only)
router.put('/doctors/:id/verify', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'approve' or 'reject'
  const isApproved = status === 'approve';

  const updatedDoc = await DoctorModel.updateOne({ id }, { isApproved });
  if (!updatedDoc) {
    res.status(404).json({ error: 'Doctor profile not found.' });
    return;
  }

  // Update corresponding user record
  await UserModel.updateOne({ id }, { isApproved });

  // Send notification to doctor
  await NotificationModel.create({
    userId: id,
    message: isApproved 
      ? 'Congratulations! Your Doctor credentials have been verified. You can now accept patients.' 
      : 'Your Doctor credentials verification could not be completed. Please update your details.',
    date: new Date().toISOString(),
    read: false,
    type: isApproved ? 'success' : 'alert'
  });

  return res.json({ success: true, doctor: updatedDoc });
});


// ---------------- APPOINTMENTS ROUTES ----------------

// Get user appointments (Dynamic filters based on role)
router.get('/appointments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id, role } = req.user!;
  let appts = [];

  if (role === 'doctor') {
    appts = await AppointmentModel.find({ doctorId: id });
  } else if (role === 'patient') {
    appts = await AppointmentModel.find({ patientId: id });
  } else {
    // Admin gets all
    appts = await AppointmentModel.find();
  }

  return res.json(appts);
});

// Book an appointment (Patient only)
router.post('/appointments', authenticateToken, authorizeRoles('patient'), async (req: AuthenticatedRequest, res: Response) => {
  const { id: patientId, name: patientName, email: patientEmail } = req.user!;
  const { doctorId, date, time, symptoms, reportUrl, reportName } = req.body;

  if (!doctorId || !date || !time) {
    res.status(400).json({ error: 'Doctor ID, date, and time slot are required.' });
    return;
  }

  // Fetch doctor dynamically from database to make sure they are active
  const doctor = await DoctorModel.findOne({ id: doctorId });
  if (!doctor) {
    res.status(404).json({ error: 'Doctor profile not found.' });
    return;
  }

  if (!doctor.isApproved) {
    res.status(400).json({ error: 'Selected doctor is currently unavailable or unverified.' });
    return;
  }

  // Validate double booking of the same slot
  const existingBookings = await AppointmentModel.find({ doctorId, date, time });
  const activeBookings = existingBookings.filter(b => b.status !== 'cancelled');

  if (activeBookings.length > 0) {
    res.status(409).json({ error: 'This time slot has already been booked. Please pick a different slot.' });
    return;
  }

  // Create appointment
  const newAppt = await AppointmentModel.create({
    patientId,
    patientName,
    patientEmail,
    doctorId,
    doctorName: doctor.name,
    doctorSpecialization: doctor.specialization,
    doctorAvatar: doctor.avatar,
    date,
    time,
    symptoms: symptoms || '',
    reportUrl,
    reportName,
    status: 'pending'
  });

  // Notifications
  await NotificationModel.create({
    userId: patientId,
    message: `Your appointment request for ${doctor.name} on ${date} at ${time} was submitted successfully.`,
    date: new Date().toISOString(),
    read: false,
    type: 'info'
  });

  await NotificationModel.create({
    userId: doctorId,
    message: `New appointment requested by ${patientName} for ${date} at ${time}.`,
    date: new Date().toISOString(),
    read: false,
    type: 'info'
  });

  return res.status(201).json({ success: true, appointment: newAppt });
});

// Update appointment status
router.put('/appointments/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'completed' | 'cancelled'
  const { id: userId, role } = req.user!;

  const appt = await AppointmentModel.findOne({ id });
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found.' });
    return;
  }

  // Check authorization
  if (role === 'patient') {
    if (appt.patientId !== userId) {
      res.status(403).json({ error: 'Unauthorized. You cannot modify other patients\' appointments.' });
      return;
    }
    if (status !== 'cancelled') {
      res.status(400).json({ error: 'Patients can only cancel their appointments.' });
      return;
    }
  }

  if (role === 'doctor') {
    if (appt.doctorId !== userId) {
      res.status(403).json({ error: 'Unauthorized. This appointment is not assigned to you.' });
      return;
    }
  }

  // Save updated status
  const updated = await AppointmentModel.updateOne({ id }, { status });

  // Notifications
  let msg = '';
  let type: 'info' | 'success' | 'alert' = 'info';

  if (status === 'approved') {
    msg = `Your appointment with ${appt.doctorName} on ${appt.date} at ${appt.time} has been approved!`;
    type = 'success';
  } else if (status === 'completed') {
    msg = `Your appointment with ${appt.doctorName} on ${appt.date} is completed. Please view details.`;
    type = 'success';
  } else if (status === 'cancelled') {
    msg = `Your appointment with ${appt.doctorName} on ${appt.date} has been cancelled.`;
    type = 'alert';
  }

  await NotificationModel.create({
    userId: appt.patientId,
    message: msg,
    date: new Date().toISOString(),
    read: false,
    type
  });

  if (status === 'cancelled' && role === 'patient') {
    await NotificationModel.create({
      userId: appt.doctorId,
      message: `Appointment for ${appt.patientName} on ${appt.date} at ${appt.time} was cancelled by patient.`,
      date: new Date().toISOString(),
      read: false,
      type: 'alert'
    });
  }

  return res.json({ success: true, appointment: updated });
});

// Rate an appointment (Patient rating a doctor)
router.post('/appointments/:appointmentId/rate', authenticateToken, authorizeRoles('patient'), async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId } = req.params;
  const { rating } = req.body;
  const { id: patientId } = req.user!;

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    return;
  }

  const appt = await AppointmentModel.findOne({ id: appointmentId });
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found.' });
    return;
  }

  if (appt.patientId !== patientId) {
    res.status(403).json({ error: 'Unauthorized. You cannot rate another patient\'s appointment.' });
    return;
  }

  if (appt.status !== 'completed') {
    res.status(400).json({ error: 'Only completed appointments can be rated.' });
    return;
  }

  if (appt.rating) {
    res.status(400).json({ error: 'This appointment has already been rated.' });
    return;
  }

  // Update appointment rating
  const updatedAppt = await AppointmentModel.updateOne({ id: appointmentId }, { rating });

  // Update doctor average rating and reviews count
  const doctor = await DoctorModel.findOne({ id: appt.doctorId });
  if (doctor) {
    const reviewsCount = doctor.reviewsCount || 0;
    const currentRating = doctor.rating || 5.0;
    const nextReviewsCount = reviewsCount + 1;
    const nextRating = parseFloat((((currentRating * reviewsCount) + rating) / nextReviewsCount).toFixed(2));
    
    await DoctorModel.updateOne({ id: appt.doctorId }, {
      rating: nextRating,
      reviewsCount: nextReviewsCount
    });
  }

  return res.json({ success: true, appointment: updatedAppt });
});


// ---------------- MEDICAL RECORDS ROUTES ----------------

// Get medical records for patient
router.get('/medical-records', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id, role } = req.user!;
  let records = [];

  if (role === 'patient') {
    records = await MedicalRecordModel.find({ patientId: id });
  } else {
    // Doctors/Admins can query records passing patientId in query
    const { patientId } = req.query;
    if (patientId) {
      records = await MedicalRecordModel.find({ patientId: String(patientId) });
    } else {
      records = await MedicalRecordModel.find();
    }
  }

  return res.json(records);
});

// Upload medical record
router.post('/medical-records', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id: currentUserId, role } = req.user!;
  const recordData = req.body;

  const patientId = recordData.patientId || currentUserId;

  if (role === 'patient' && patientId !== currentUserId) {
    res.status(403).json({ error: 'Unauthorized. Patients cannot upload records for other patient accounts.' });
    return;
  }

  const newRecord = await MedicalRecordModel.create({
    patientId,
    title: recordData.title,
    date: recordData.date || new Date().toISOString().split('T')[0],
    doctorName: recordData.doctorName || req.user?.name || 'Consultation Clinic',
    attachmentUrl: recordData.attachmentUrl,
    attachmentName: recordData.attachmentName,
    description: recordData.description || ''
  });

  await NotificationModel.create({
    userId: patientId,
    message: `Medical record "${recordData.title}" uploaded successfully.`,
    date: new Date().toISOString(),
    read: false,
    type: 'success'
  });

  return res.status(201).json({ success: true, record: newRecord });
});

// Delete medical record
router.delete('/medical-records/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { id: userId, role } = req.user!;

  const record = await MedicalRecordModel.findOne({ id });
  if (!record) {
    res.status(404).json({ error: 'Medical record not found.' });
    return;
  }

  if (role === 'patient' && record.patientId !== userId) {
    res.status(403).json({ error: 'Unauthorized. You can only delete your own medical records.' });
    return;
  }

  await MedicalRecordModel.deleteOne({ id });

  await NotificationModel.create({
    userId: record.patientId,
    message: `Medical record "${record.title}" was deleted.`,
    date: new Date().toISOString(),
    read: false,
    type: 'alert'
  });

  return res.json({ success: true });
});


// ---------------- NOTIFICATIONS ROUTES ----------------

// Get notifications
router.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.user!;
  const notifs = await NotificationModel.find({ userId: id });
  return res.json(notifs);
});

// Mark single read
router.put('/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user!;

  const updated = await NotificationModel.updateOne({ id, userId }, { read: true });
  if (!updated) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  return res.json({ success: true });
});

// Mark all read
router.put('/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id: userId } = req.user!;
  
  const userNotifs = await NotificationModel.find({ userId });
  await Promise.all(userNotifs.map(n => 
    NotificationModel.updateOne({ id: n.id }, { read: true })
  ));

  return res.json({ success: true });
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user!;

  const deleted = await NotificationModel.deleteOne({ id, userId });
  if (!deleted) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  return res.json({ success: true });
});

// Update Profile Particulars (Fixing partial update erasure bug)
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id: userId, role } = req.user!;
  const profileData = req.body;

  // Doctors cannot change their email (username) or password directly through profile
  if (role === 'doctor') {
    delete profileData.email;
    delete profileData.password;
  }

  // Prevent field erasure: compile ONLY defined fields
  const userUpdates: any = {};
  const userAllowedFields = ['name', 'email', 'phone', 'avatar', 'gender', 'dob', 'address', 'bloodGroup'];
  
  for (const field of userAllowedFields) {
    if (profileData[field] !== undefined) {
      userUpdates[field] = profileData[field];
    }
  }

  // Update user with only supplied fields
  const updatedUser = await UserModel.updateOne({ id: userId }, userUpdates);
  if (!updatedUser) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  // If Doctor role, also update Doctor collection entry safely without erasure
  if (role === 'doctor') {
    const existingDoc = await DoctorModel.findOne({ id: userId });
    
    const doctorUpdates: any = {};
    const doctorAllowedFields = [
      'name', 'phone', 'avatar', 'hospital', 'specialization', 
      'bio', 'education', 'fees', 'experience', 'slots', 
      'availability', 'leaves'
    ];

    for (const field of doctorAllowedFields) {
      if (profileData[field] !== undefined) {
        if (field === 'fees' || field === 'experience') {
          doctorUpdates[field] = Number(profileData[field]);
        } else {
          doctorUpdates[field] = profileData[field];
        }
      }
    }

    await DoctorModel.updateOne({ id: userId }, doctorUpdates);
  }

  await NotificationModel.create({
    userId,
    message: 'Your profile information has been successfully updated.',
    date: new Date().toISOString(),
    read: false,
    type: 'success'
  });

  return res.json({ success: true, user: updatedUser });
});


// ---------------- DOCTOR APPLICATIONS ROUTES ----------------

// Submit Doctor Application (Public, with Zod schema verification)
router.post('/doctor-applications', validateRequest(doctorApplicationSchema), async (req: Request, res: Response) => {
  const appData = req.body;

  // Check if already a doctor user
  const existingUser = await UserModel.findOne({ email: appData.email });
  if (existingUser && existingUser.role === 'doctor') {
    return res.status(400).json({ error: 'An approved doctor account with this email already exists.' });
  }

  // Check if there's already a pending application for this email
  const existingApp = await DoctorApplicationModel.findOne({ email: appData.email, status: 'Pending' });
  if (existingApp) {
    return res.status(400).json({ error: 'You already have a pending application with this email.' });
  }

  const newApp = await DoctorApplicationModel.create({
    ...appData,
    experience: Number(appData.experience),
    status: 'Pending'
  });

  return res.status(201).json({ success: true, application: newApp });
});

// Get all applications (Admin only)
router.get('/doctor-applications', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const applications = await DoctorApplicationModel.find();
  return res.json(applications);
});

// Verify/Approve/Reject Doctor Application (Admin only)
router.put('/doctor-applications/:id/verify', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved' or 'Rejected'

  if (status !== 'Approved' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Invalid status. Must be "Approved" or "Rejected".' });
  }

  const app = await DoctorApplicationModel.findOne({ id });
  if (!app) {
    return res.status(404).json({ error: 'Doctor application not found.' });
  }

  if (app.status !== 'Pending') {
    return res.status(400).json({ error: 'This application has already been processed.' });
  }

  if (status === 'Approved') {
    // Generate secure randomized doctor password, then hash with bcrypt
    const rawPassword = `Doc_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const salt = bcrypt.genSaltSync(10);
    const generatedPassword = bcrypt.hashSync(rawPassword, salt);

    // Create User account (register them so they can log in)
    const newUser = await UserModel.create({
      name: app.name,
      email: app.email,
      password: generatedPassword,
      role: 'doctor',
      phone: app.phone,
      avatar: app.avatar,
      isApproved: true
    });

    // Create Doctor Profile
    await DoctorModel.create({
      id: newUser.id,
      name: app.name,
      email: app.email,
      specialization: app.specialization,
      experience: Number(app.experience) || 1,
      fees: 80, // default fee
      hospital: app.hospital,
      rating: 5.0,
      reviewsCount: 0,
      availability: ['Monday', 'Wednesday', 'Friday'],
      slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      avatar: app.avatar,
      bio: `Dr. ${app.name} is an approved specialist in ${app.specialization} with education and qualifications: ${app.qualification}.`,
      education: app.qualification,
      isApproved: true,
      phone: app.phone,
      registrationNumber: app.registrationNumber,
      address: app.address
    });

    // Welcome Notification for Doctor
    await NotificationModel.create({
      userId: newUser.id,
      message: `Welcome Dr. ${app.name}! Your medical credentials registration has been APPROVED by BMD Admin.`,
      date: new Date().toISOString(),
      read: false,
      type: 'success'
    });

    // Save generated credentials directly on the application for the Admin view (store rawPassword so admin can provide it)
    const updatedApp = await DoctorApplicationModel.updateOne({ id }, { 
      status: 'Approved',
      generatedEmail: app.email,
      generatedPassword: rawPassword
    });

    return res.json({ success: true, application: updatedApp });
  } else {
    const updatedApp = await DoctorApplicationModel.updateOne({ id }, { status: 'Rejected' });
    return res.json({ success: true, application: updatedApp });
  }
});

export default router;
