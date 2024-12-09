import { z } from "zod";

export const topupSchema = z.object({
  top_up_ammount: z.number().min(0),
});
