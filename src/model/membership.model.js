import z from "zod";

export const authRegisterSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(255),
  last_name: z.string().max(100),
  password: z.string().min(8),
});
export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
