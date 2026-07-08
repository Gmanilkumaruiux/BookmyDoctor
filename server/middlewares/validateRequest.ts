import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map(err => ({
            field: err.path.slice(1).join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
};

// Common Input Schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    requiredRole: z.enum(['patient', 'doctor', 'admin']).optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    role: z.enum(['patient', 'doctor', 'admin']),
    phone: z.string().optional(),
    gender: z.string().optional(),
    dob: z.string().optional(),
    avatar: z.string().url().optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
  }),
});

export const doctorApplicationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Phone number is too short'),
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experience: z.number().or(z.string().transform(Number)).pipe(z.number().min(0)),
    hospital: z.string().min(2, 'Hospital/clinic is required'),
    registrationNumber: z.string().min(2, 'Registration/license number is required'),
    address: z.string().min(2, 'Mailing or clinic address is required'),
    medicalCertificate: z.string().optional(),
    governmentId: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});
