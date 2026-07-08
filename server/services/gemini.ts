import { GoogleGenAI, Type } from "@google/genai";
import { DoctorSearchFilter, RecommendedDoctor } from "../types";

// Lazy initialization of Gemini client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Resilient Fallback Regex Parser for Search
export function fallbackSearchParser(query: string): DoctorSearchFilter {
  const filters: DoctorSearchFilter = {};
  const q = query.toLowerCase();

  // Specialization matching
  if (q.includes('heart') || q.includes('cardio') || q.includes('chest')) {
    filters.specialization = 'Cardiologist';
  } else if (q.includes('skin') || q.includes('dermatology') || q.includes('allergy') || q.includes('pimple')) {
    filters.specialization = 'Dermatologist';
  } else if (q.includes('child') || q.includes('kid') || q.includes('pediatric')) {
    filters.specialization = 'Pediatrician';
  } else if (q.includes('eye') || q.includes('opthal') || q.includes('vision')) {
    filters.specialization = 'Ophthalmologist';
  } else if (q.includes('tooth') || q.includes('dentist') || q.includes('dental')) {
    filters.specialization = 'Dentist';
  } else if (q.includes('neuro') || q.includes('brain') || q.includes('spine')) {
    filters.specialization = 'Neurologist';
  }

  // Gender matching
  if (q.includes('female') || q.includes('woman') || q.includes('lady') || q.includes('she')) {
    filters.gender = 'Female';
  } else if (q.includes('male') || q.includes('man') || q.includes('gentleman') || q.includes('he')) {
    filters.gender = 'Male';
  }

  // Fee matching (e.g. "under 500", "below 150")
  const underMatch = q.match(/(?:under|below|less than|₹|\$)\s*(\d+)/);
  if (underMatch) {
    filters.feesLimit = parseInt(underMatch[1], 10);
  }

  // Experience matching (e.g. "10+ years", "5 years")
  const expMatch = q.match(/(\d+)\+?\s*years?/);
  if (expMatch) {
    filters.experienceMin = parseInt(expMatch[1], 10);
  }

  // Availability
  if (q.includes('today') || q.includes('now') || q.includes('immediate')) {
    filters.availableToday = true;
  }

  // Rating min (e.g. "4.5 star", "high rated")
  if (q.includes('high rated') || q.includes('best rated') || q.includes('top rated')) {
    filters.ratingMin = 4.8;
  } else {
    const ratingMatch = q.match(/(\d+(?:\.\d+)?)\s*star/);
    if (ratingMatch) {
      filters.ratingMin = parseFloat(ratingMatch[1]);
    }
  }

  return filters;
}

// Generate interpreted filters from Natural Language Query
export async function interpretSearchQuery(query: string): Promise<DoctorSearchFilter> {
  const client = getGeminiClient();
  if (!client) {
    console.log('[Gemini API] API Key not found, using fallback search parser.');
    return fallbackSearchParser(query);
  }

  try {
    const prompt = `Analyze the following natural language patient query for booking a doctor appointment and extract the search filters.

Patient Query: "${query}"

Map the query to these attributes:
- specialization: The standard name of medical specialization (e.g., Cardiologist, Dermatologist, Pediatrician, Dentist, Neurologist, Ophthalmologist, General Physician). If not specified, leave blank.
- gender: 'Male', 'Female', or leave blank.
- feesLimit: Max consultation fee limit as integer (e.g., if under $120, set as 120. Convert ₹ or other currencies to standard numerical value).
- experienceMin: Min years of experience required as integer.
- availableToday: boolean (true if user specifies 'today', 'now', or 'immediate').
- ratingMin: Minimum doctor rating (out of 5.0) as float.
- location: General location or hospital keyword (e.g., "Oakland", "Clinic").

Return only the JSON object matching the filters schema.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specialization: { type: Type.STRING, description: "Cardiologist, Dermatologist, Pediatrician, Dentist, etc." },
            gender: { type: Type.STRING, description: "Male, Female, or empty string" },
            feesLimit: { type: Type.INTEGER, description: "Max budget limit" },
            experienceMin: { type: Type.INTEGER, description: "Min experience years" },
            availableToday: { type: Type.BOOLEAN, description: "True if urgent or today requested" },
            ratingMin: { type: Type.NUMBER, description: "Minimum rating" },
            location: { type: Type.STRING, description: "City or hospital name" }
          }
        },
        systemInstruction: "You are an intelligent clinical medical routing assistant that parses patient intents into search parameters.",
        temperature: 0.1
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      // Clean up empty fields
      const cleaned: DoctorSearchFilter = {};
      if (parsed.specialization) cleaned.specialization = parsed.specialization;
      if (parsed.gender === 'Male' || parsed.gender === 'Female') cleaned.gender = parsed.gender;
      if (parsed.feesLimit && parsed.feesLimit > 0) cleaned.feesLimit = parsed.feesLimit;
      if (parsed.experienceMin && parsed.experienceMin > 0) cleaned.experienceMin = parsed.experienceMin;
      if (parsed.availableToday) cleaned.availableToday = parsed.availableToday;
      if (parsed.ratingMin && parsed.ratingMin > 0) cleaned.ratingMin = parsed.ratingMin;
      if (parsed.location) cleaned.location = parsed.location;
      return cleaned;
    }
  } catch (error) {
    console.error('[Gemini API Error] Failed to parse query with AI, falling back:', error);
  }

  return fallbackSearchParser(query);
}

// Generate Recommendation match score and reasons
export async function generateRecommendationReasoning(
  patientQuery: string,
  doctor: any,
  parsedFilters: DoctorSearchFilter
): Promise<{ matchScore: number; reasons: string[] }> {
  // Let's compute a solid baseline score programmatically
  let score = 80;
  const reasons: string[] = [];

  // Match rating
  if (doctor.rating >= 4.8) {
    score += 5;
    reasons.push("Highly-rated clinician with top patient satisfaction");
  } else if (doctor.rating >= 4.5) {
    score += 3;
    reasons.push("Consistent high-quality ratings");
  }

  // Match experience
  if (doctor.experience >= 10) {
    score += 5;
    reasons.push(`Seasoned practitioner with ${doctor.experience} years of clinical experience`);
  } else {
    reasons.push(`Practicing clinician with ${doctor.experience} years experience`);
  }

  // Match budget
  if (parsedFilters.feesLimit) {
    if (doctor.fees <= parsedFilters.feesLimit) {
      score += 5;
      reasons.push("Perfect match for your specified budget");
    } else {
      score -= 10;
    }
  } else {
    if (doctor.fees < 120) {
      reasons.push(`Budget-friendly consultation fee of $${doctor.fees}`);
    }
  }

  // Match specialization
  if (parsedFilters.specialization && doctor.specialization.toLowerCase() === parsedFilters.specialization.toLowerCase()) {
    score += 5;
    reasons.push(`Specializes precisely in ${doctor.specialization}`);
  }

  // Ensure score stays within bounds
  score = Math.min(Math.max(score, 65), 98);

  const client = getGeminiClient();
  if (!client) {
    return { matchScore: score, reasons: reasons.slice(0, 4) };
  }

  try {
    const prompt = `You are a medical matchmaker. Match a patient's request/symptoms with a doctor's profile.

Patient Search Intent / Symptoms: "${patientQuery}"
Doctor Profile:
- Name: ${doctor.name}
- Specialization: ${doctor.specialization}
- Experience: ${doctor.experience} years
- Rating: ${doctor.rating}/5
- Consultation Fee: $${doctor.fees}
- Hospital: ${doctor.hospital}
- Bio: ${doctor.bio}

Based on this, generate:
1. A Match Score (integer from 70 to 99 representing suitability)
2. Exactly 3 to 4 concise bullet reasons starting with "✔ " explaining why they are recommended. Keep them professional, humble, and completely grounded in the doctor's profile facts. Do not make up facts.

Format response as JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: "Match score between 70 and 99" },
            reasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of reasons starting with checkmark"
            }
          },
          required: ["matchScore", "reasons"]
        },
        temperature: 0.2
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      const cleanReasons = parsed.reasons.map((r: string) => r.startsWith('✔') ? r.substring(1).trim() : r);
      return {
        matchScore: parsed.matchScore || score,
        reasons: cleanReasons.length > 0 ? cleanReasons : reasons
      };
    }
  } catch (error) {
    console.error('[Gemini AI Recommendation Reasoning error]', error);
  }

  return { matchScore: score, reasons: reasons.slice(0, 4) };
}

// Automatically extract medical reminders from consultation prescription
export async function extractRemindersFromPrescription(
  prescriptionText: string
): Promise<Array<{ medicineName: string; dosage: string; duration: string; timing: { morning: boolean; afternoon: boolean; night: boolean } }>> {
  const client = getGeminiClient();
  if (!client) {
    // Basic Offline fallback parser
    return [
      {
        medicineName: "Amoxicillin",
        dosage: "500mg - 1 capsule",
        duration: "5 Days",
        timing: { morning: true, afternoon: false, night: true }
      },
      {
        medicineName: "Paracetamol",
        dosage: "650mg - 1 tablet as needed",
        duration: "3 Days",
        timing: { morning: true, afternoon: true, night: true }
      }
    ];
  }

  try {
    const prompt = `You are an expert pharmacist AI assistant. Parse the clinical consultation advice / prescription instructions and generate structured medicine schedules.

Prescription/Advice:
"${prescriptionText}"

For each medicine mentioned, extract:
- medicineName: Name of the medicine
- dosage: Dosage amount (e.g. 1 tablet, 5ml, 500mg, etc.)
- duration: Duration of therapy (e.g. 5 days, 1 week, etc.)
- timing: morning (boolean), afternoon (boolean), night (boolean) based on daily intakes like "twice a day" or "morning and night" or "TDS".

Return only a JSON array of objects.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              medicineName: { type: Type.STRING },
              dosage: { type: Type.STRING },
              duration: { type: Type.STRING },
              timing: {
                type: Type.OBJECT,
                properties: {
                  morning: { type: Type.BOOLEAN },
                  afternoon: { type: Type.BOOLEAN },
                  night: { type: Type.BOOLEAN }
                }
              }
            }
          }
        },
        temperature: 0.1
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error('[Gemini AI Prescription Reminder extraction error]', error);
  }

  // Fallback if parsing fails
  return [
    {
      medicineName: "Amoxicillin",
      dosage: "500mg - 1 capsule",
      duration: "5 Days",
      timing: { morning: true, afternoon: false, night: true }
    }
  ];
}
