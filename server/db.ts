import mongoose, { Schema } from 'mongoose';

// Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookmydoctor';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Export dummy functions for backward compatibility
export function readDb(): any {
  return {};
}
export function writeDb(data: any): void {}

// Generic MongoDB-like Collection class backed by real MongoDB (Mongoose)
export class Collection<T extends { id: string }> {
  private mongooseModel: mongoose.Model<any>;

  constructor(collectionName: string) {
    // Map collectionName to appropriate MongoDB model schema.
    // Using strict: false enables dynamic schemas (MongoDB's schema-less style) 
    // while keeping id as a unique index for fast lookups.
    const schema = new Schema(
      { id: { type: String, unique: true } }, 
      { strict: false, timestamps: true }
    );
    this.mongooseModel = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
  }

  async find(query?: Partial<T>): Promise<T[]> {
    const filter = query || {};
    const docs = await this.mongooseModel.find(filter).lean();
    return docs as unknown as T[];
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const doc = await this.mongooseModel.findOne(query).lean();
    return doc as unknown as T | null;
  }

  async create(data: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const id = data.id || `${this.mongooseModel.modelName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem = {
      ...data,
      id,
    };
    const created = await this.mongooseModel.create(newItem);
    return created.toObject() as unknown as T;
  }

  async updateOne(query: Partial<T>, update: Partial<T>): Promise<T | null> {
    const updated = await this.mongooseModel.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, lean: true }
    );
    return updated as unknown as T | null;
  }

  async deleteOne(query: Partial<T>): Promise<boolean> {
    const result = await this.mongooseModel.deleteOne(query);
    return result.deletedCount ? result.deletedCount > 0 : false;
  }
}

// Instantiate MongoDB-backed Collections
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
