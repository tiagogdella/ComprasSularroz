import { z } from "zod";

export const periodStatsQuerySchema = z.object({
    year: z.coerce.number().int().min(2000).max(2100),
});
export type PeriodStatsQuery = z.infer<typeof periodStatsQuerySchema>;

export const rangeStatsQuerySchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});
export type RangeStatsQuery = z.infer<typeof rangeStatsQuerySchema>;
