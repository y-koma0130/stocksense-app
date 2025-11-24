import { z } from "zod";

export const periodTypeSchema = z.enum(["weekly", "monthly"]);

export type PeriodType = z.infer<typeof periodTypeSchema>;
