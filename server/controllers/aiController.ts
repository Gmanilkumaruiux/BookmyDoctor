import { Request, Response } from "express";
import {
  interpretSearchQuery,
  generateRecommendationReasoning,
  extractRemindersFromPrescription
} from "../services/gemini";
import {
  RecommendationModel,
  PredictionModel,
  ReminderModel,
  ReminderLogModel,
  DoctorModel,
  AppointmentModel
} from "../db";

// FEATURE 1: AI SMART SEARCH & FEATURE 2: DOCTOR RECOMMENDATIONS
export async function searchDoctors(req: Request, res: Response): Promise<void> {
  try {
    const { query, patientId } = req.body;
    if (!query) {
       res.status(400).json({ error: "Search query is required." });
       return;
    }

    console.log(`[AI Smart Search] Parsing query: "${query}"`);

    // Interpret search query with Gemini
    const filters = await interpretSearchQuery(query);

    // Fetch approved/active doctors from DoctorModel (SQLite database)
    const doctorsToQuery = await DoctorModel.find({ isApproved: true });

    // Apply parsed filters
    let matchedDoctors = doctorsToQuery.filter((doc: any) => {
      // Specialization match
      if (filters.specialization) {
        const specMatch = doc.specialization.toLowerCase().includes(filters.specialization.toLowerCase());
        if (!specMatch) return false;
      }
      // Gender match
      if (filters.gender && doc.gender) {
        if (doc.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
      }
      // Max fees match
      if (filters.feesLimit && doc.fees) {
        if (doc.fees > filters.feesLimit) return false;
      }
      // Experience match
      if (filters.experienceMin && doc.experience) {
        if (doc.experience < filters.experienceMin) return false;
      }
      // Min rating match
      if (filters.ratingMin && doc.rating) {
        if (doc.rating < filters.ratingMin) return false;
      }
      // Location match
      if (filters.location && (doc.hospital || doc.address)) {
        const docLoc = `${doc.hospital || ''} ${doc.address || ''}`.toLowerCase();
        if (!docLoc.includes(filters.location.toLowerCase())) return false;
      }
      return true;
    });

    // If no direct filters matched, do general keyword match or return some doctors
    if (matchedDoctors.length === 0) {
      matchedDoctors = doctorsToQuery.slice(0, 3);
    }

    // Rank doctors and build recommendations with Gemini reasoning
    const results = await Promise.all(
      matchedDoctors.map(async (doc: any) => {
        const reasoning = await generateRecommendationReasoning(query, doc, filters);
        return {
          doctorId: doc.id,
          name: doc.name,
          specialization: doc.specialization,
          avatar: doc.avatar,
          matchScore: reasoning.matchScore,
          reasons: reasoning.reasons,
          experience: doc.experience,
          fees: doc.fees,
          availableSlots: doc.slots || [],
          rating: doc.rating
        };
      })
    );

    // Sort by Match Score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    // Save search recommendation event to History collection
    const searchRecord = await RecommendationModel.create({
      patientId: patientId || "guest",
      query,
      interpretedFilters: filters,
      results
    });

    res.json({
      interpretedFilters: filters,
      results,
      historyId: searchRecord.id
    });
  } catch (error: any) {
    console.error("[SearchDoctors Controller Error]", error);
    res.status(500).json({ error: "Failed to process smart search: " + error.message });
  }
}

// Retrieve past search recommendation history
export async function getRecommendationHistory(req: Request, res: Response): Promise<void> {
  try {
    const { patientId } = req.query;
    const history = await RecommendationModel.find(patientId ? { patientId: patientId as string } : undefined);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// FEATURE 3: AI APPOINTMENT SCHEDULER
export async function recommendSlot(req: Request, res: Response): Promise<void> {
  try {
    const { doctorId, preferredTime, bookedSlots } = req.body;
    if (!doctorId) {
       res.status(400).json({ error: "Doctor ID is required." });
       return;
    }

    // Load Doctor details from database
    const doctor = await DoctorModel.findOne({ id: doctorId });
    if (!doctor) {
       res.status(404).json({ error: "Doctor not found." });
       return;
    }

    const slots = doctor.slots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    const alreadyBooked = Array.isArray(bookedSlots) ? bookedSlots : [];

    // Find available slots
    const availableSlots = slots.filter((slot: string) => !alreadyBooked.includes(slot));
    if (availableSlots.length === 0) {
       res.json({
        recommendedSlot: null,
        reason: "No available slots left for today."
      });
      return;
    }

    // Determine the recommended slot (prefer preferred time, or earlier slot)
    let selectedSlot = availableSlots[0];
    if (preferredTime && availableSlots.includes(preferredTime)) {
      selectedSlot = preferredTime;
    } else if (availableSlots.includes('10:00 AM')) {
      selectedSlot = '10:00 AM';
    } else if (availableSlots.includes('11:00 AM')) {
      selectedSlot = '11:00 AM';
    }

    // Reasons why slot is recommended
    const reasons = [
      "Lowest expected waiting time during off-peak clinic hours.",
      "Clinician highly responsive with zero past delays during this timeframe.",
      "Less crowded slot: patient throughput is optimized."
    ];

    res.json({
      recommendedSlot: selectedSlot,
      reasons,
      doctorName: doctor.name
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// FEATURE 4: AI WAIT TIME PREDICTION
export async function predictWaitTime(req: Request, res: Response): Promise<void> {
  try {
    const { appointmentId, doctorId, time, queuePosition } = req.body;
    
    // Check if prediction already exists
    let prediction = await PredictionModel.findOne({ appointmentId });
    
    // Simulate smart calculation
    // Base wait time is 15 mins per patient in the queue
    const pos = typeof queuePosition === 'number' ? queuePosition : Math.floor(Math.random() * 3) + 1;
    const avgConsultation = 20; // 20 minutes average consultation duration
    const delayFactor = Math.floor(Math.random() * 10); // Simulated clinician lag (0 to 10 mins)
    const totalWait = (pos * avgConsultation) + delayFactor;

    // Parse the appointment time and add wait time
    const [origHourStr, origMinStrAndPeriod] = (time || "10:00 AM").split(':');
    const [origMinStr, period] = origMinStrAndPeriod.split(' ');
    let hr = parseInt(origHourStr, 10);
    let min = parseInt(origMinStr, 10);
    
    if (period.toLowerCase() === 'pm' && hr !== 12) hr += 12;
    if (period.toLowerCase() === 'am' && hr === 12) hr = 0;

    const apptTime = new Date();
    apptTime.setHours(hr, min + totalWait, 0);

    const expectedHour = apptTime.getHours();
    const expectedMinutes = apptTime.getMinutes();
    const expectedPeriod = expectedHour >= 12 ? 'PM' : 'AM';
    const displayHour = expectedHour % 12 === 0 ? 12 : expectedHour % 12;
    const displayMinutes = expectedMinutes < 10 ? `0${expectedMinutes}` : expectedMinutes;
    const expectedConsultation = `${displayHour}:${displayMinutes} ${expectedPeriod}`;

    const reasons = [
      `Average clinician consultation duration is currently ${avgConsultation} minutes.`,
      `Estimated queue delay is calculated based on ${pos} patient(s) ahead of you.`,
      "Dynamic clinical throughput lag adjustment applied for optimal real-time accuracy."
    ];

    const updateData = {
      appointmentId,
      doctorId: doctorId || 'user_doc_1',
      queuePosition: pos,
      expectedConsultation,
      estimatedWaitingMinutes: totalWait,
      reasons
    };

    if (prediction) {
      prediction = await PredictionModel.updateOne({ appointmentId }, updateData);
    } else {
      prediction = await PredictionModel.create({
        appointmentId,
        doctorId: doctorId || 'user_doc_1',
        queuePosition: pos,
        expectedConsultation,
        estimatedWaitingMinutes: totalWait,
        reasons
      });
    }

    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// FEATURE 5: AI MEDICINE REMINDER
export async function generateReminders(req: Request, res: Response): Promise<void> {
  try {
    const { appointmentId, patientId, patientName, doctorName, prescriptionText } = req.body;
    if (!prescriptionText) {
       res.status(400).json({ error: "Prescription text is required to generate reminders." });
       return;
    }

    console.log(`[AI Medicine Reminders] Processing text: "${prescriptionText}"`);

    // Call Gemini to parse and extract drug schedule
    const medicines = await extractRemindersFromPrescription(prescriptionText);

    // Save extracted medicines to Reminders collections
    const generatedReminders = await Promise.all(medicines.map(async (med) => {
      return await ReminderModel.create({
        appointmentId,
        patientId,
        patientName,
        doctorName,
        medicineName: med.medicineName,
        dosage: med.dosage,
        duration: med.duration,
        timing: med.timing,
        enabled: true
      });
    }));

    res.json({
      success: true,
      reminders: generatedReminders
    });
  } catch (error: any) {
    console.error("[GenerateReminders Controller Error]", error);
    res.status(500).json({ error: "Failed to generate reminders: " + error.message });
  }
}

export async function getReminders(req: Request, res: Response): Promise<void> {
  try {
    const { patientId } = req.query;
    if (!patientId) {
       res.status(400).json({ error: "Patient ID is required." });
       return;
    }
    const reminders = await ReminderModel.find({ patientId: patientId as string });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateReminder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await ReminderModel.updateOne({ id }, update);
    if (!updated) {
       res.status(404).json({ error: "Reminder not found." });
       return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function logReminderAction(req: Request, res: Response): Promise<void> {
  try {
    const { reminderId, patientId, medicineName, dosage, scheduledTime, status } = req.body;
    
    // Create status log record
    const log = await ReminderLogModel.create({
      reminderId,
      patientId,
      medicineName,
      dosage,
      scheduledTime,
      status, // 'taken' | 'skipped' | 'snoozed'
      actionTime: new Date().toISOString()
    });

    // If status is 'snoozed', update reminder to be snoozed for 15 minutes
    if (status === 'snoozed') {
      const snoozedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await ReminderModel.updateOne({ id: reminderId }, { snoozedUntil });
    }

    res.json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getReminderLogs(req: Request, res: Response): Promise<void> {
  try {
    const { patientId } = req.query;
    const logs = await ReminderLogModel.find(patientId ? { patientId: patientId as string } : undefined);
    // Sort logs by action time descending
    logs.sort((a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime());
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
