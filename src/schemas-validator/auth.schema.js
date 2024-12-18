import { z } from "zod";

export const registerSchema = z.object({
    username: z.string({ required_error: 'Username is required' }),
    email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email' }),
    password: z.string({ required_error: 'Password is required' }).min(6, 
        { message: 'Password must be at least 6 characters' }),
    isAdmin: z.boolean().optional(),
});

export const loginSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email' }),
    password: z.string({ required_error: 'Password is required' }).min(5, 
        { message: 'Password must be at least 5 characters' }),
});

export const updateSchema = z.object({
    username: z.string().optional(),
    email: z.string().email({ message: 'Invalid email' }).optional(),
    isAdmin: z.boolean().optional(),
});

export const adminSchema = z.object({
    isAdmin: z.boolean().refine((val) => val === true, {
        message: "El usuario debe ser un administrador (isAdmin: true).",
    })
})