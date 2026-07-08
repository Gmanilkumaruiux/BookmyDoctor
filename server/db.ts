import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db-storage.json');

// Full database schema
export interface DbSchema {
  recommendations: any[];
  predictions: any[];
  reminders: any[];
  reminderLogs: any[];
  users: any[];
  doctors: any[];
  appointments: any[];
  medicalRecords: any[];
  notifications: any[];
  doctorApplications: any[];
}

// Initialize the JSON file if it does not exist
function initDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    const initialState: DbSchema = {
      recommendations: [],
      predictions: [],
      reminders: [],
      reminderLogs: [],
      users: [],
      doctors: [],
      appointments: [],
      medicalRecords: [],
      notifications: [],
      doctorApplications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf8');
  }
}

initDbFile();

// Helper to read the database state
export function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDbFile();
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading JSON database file:", err);
    return {
      recommendations: [],
      predictions: [],
      reminders: [],
      reminderLogs: [],
      users: [],
      doctors: [],
      appointments: [],
      medicalRecords: [],
      notifications: [],
      doctorApplications: []
    };
  }
}

// Helper to write the database state
export function writeDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing JSON database file:", err);
  }
}

// Generic MongoDB-like Collection class backed by local JSON file storage
export class Collection<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  find(query?: Partial<T>): T[] {
    const db = readDb();
    const items = (db as any)[this.key] || [];

    if (!query || Object.keys(query).length === 0) {
      return items;
    }

    return items.filter((item: any) => {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        if (item[k] !== v) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query: Partial<T>): T | null {
    const items = this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  create(data: Omit<T, 'id'> & { id?: string }): T {
    const db = readDb();
    if (!(db as any)[this.key]) {
      (db as any)[this.key] = [];
    }

    const id = data.id || `${this.key}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    } as unknown as T;

    (db as any)[this.key].push(newItem);
    writeDb(db);
    return newItem;
  }

  updateOne(query: Partial<T>, update: Partial<T>): T | null {
    const db = readDb();
    const items = (db as any)[this.key] || [];

    // Find index of matching item
    const index = items.findIndex((item: any) => {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        if (item[k] !== v) return false;
      }
      return true;
    });

    if (index === -1) return null;

    const existing = items[index];
    const updatedItem = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    (db as any)[this.key] = items;
    writeDb(db);
    return updatedItem;
  }

  deleteOne(query: Partial<T>): boolean {
    if (!query || Object.keys(query).length === 0) return false;

    const db = readDb();
    const items = (db as any)[this.key] || [];

    const originalLength = items.length;
    const filteredItems = items.filter((item: any) => {
      let matches = true;
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        if (item[k] !== v) {
          matches = false;
          break;
        }
      }
      return !matches;
    });

    if (filteredItems.length === originalLength) {
      return false;
    }

    (db as any)[this.key] = filteredItems;
    writeDb(db);
    return true;
  }
}

// Instantiate JSON-backed Collections
export const RecommendationModel = new Collection<any>('recommendations');
export const PredictionModel = new Collection<any>('predictions');
export const ReminderModel = new Collection<any>('reminders');
export const ReminderLogModel = new Collection<any>('reminderLogs');
export const UserModel = new Collection<any>('users');
export const DoctorModel = new Collection<any>('doctors');
export const AppointmentModel = new Collection<any>('appointments');
export const MedicalRecordModel = new Collection<any>('medicalRecords');
export const NotificationModel = new Collection<any>('notifications');
export const DoctorApplicationModel = new Collection<any>('doctorApplications');
