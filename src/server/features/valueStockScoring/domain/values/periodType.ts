import { z } from "zod";

export const periodTypeSchema = z.enum(["mid_term", "long_term"]);

export type PeriodType = z.infer<typeof periodTypeSchema>;
