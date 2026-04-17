'use server';
/**
 * @fileOverview Provides AI-driven performance insights for athletes.
 *
 * - getAIPerformanceInsights - A function that generates a summary and analysis of an athlete's performance data.
 * - AIPerformanceInsightsInput - The input type for the getAIPerformanceInsights function.
 * - AIPerformanceInsightsOutput - The return type for the getAIPerformanceInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPerformanceInsightsInputSchema = z.object({
  athleteName: z.string().describe('The name of the athlete.'),
  maxes: z.object({
    squat: z.number().describe('Current 1RM for squat in kg.'),
    bench: z.number().describe('Current 1RM for bench press in kg.'),
    deadlift: z.number().describe('Current 1RM for deadlift in kg.'),
  }).describe('Current 1-rep maximums for core lifts.'),
  weeks: z.array(z.string()).describe('Labels for each training week (e.g., "Sem. 1").'),
  squatHistory: z.array(z.number()).describe('Historical squat 1RM data in kg for each week.'),
  benchHistory: z.array(z.number()).describe('Historical bench press 1RM data in kg for each week.'),
  deadliftHistory: z.array(z.number()).describe('Historical deadlift 1RM data in kg for each week.'),
  volumeHistory: z.array(z.number()).describe('Historical training volume data in kg for each week.'),
});
export type AIPerformanceInsightsInput = z.infer<typeof AIPerformanceInsightsInputSchema>;

const AIPerformanceInsightsOutputSchema = z.string().describe('A concise summary and analysis of the athlete\'s performance data, highlighting key trends, strengths, and areas for improvement.');
export type AIPerformanceInsightsOutput = z.infer<typeof AIPerformanceInsightsOutputSchema>;

export async function getAIPerformanceInsights(input: AIPerformanceInsightsInput): Promise<AIPerformanceInsightsOutput> {
  return aiPerformanceInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPerformanceInsightsPrompt',
  input: { schema: AIPerformanceInsightsInputSchema },
  output: { schema: AIPerformanceInsightsOutputSchema },
  prompt: `You are an experienced strength and conditioning coach specializing in powerlifting.
Your task is to analyze the provided performance data for the athlete and generate a concise, actionable summary.
Highlight key trends, identify strengths, and pinpoint areas for improvement across Squat, Bench Press, Deadlift, and overall training volume.
Offer practical, actionable insights for optimizing their training program.

Athlete: {{{athleteName}}}

Current 1RM Maxes:
Squat: {{{maxes.squat}}} kg
Bench: {{{maxes.bench}}} kg
Deadlift: {{{maxes.deadlift}}} kg

Historical Weekly Performance Data:
{{#each weeks}}
  {{this}}:
    Squat: {{lookup ../squatHistory @index}} kg
    Bench: {{lookup ../benchHistory @index}} kg
    Deadlift: {{lookup ../deadliftHistory @index}} kg
    Volume: {{lookup ../volumeHistory @index}} kg
{{/each}}

Provide your analysis and recommendations below, focusing on clarity and conciseness:`,
});

const aiPerformanceInsightsFlow = ai.defineFlow(
  {
    name: 'aiPerformanceInsightsFlow',
    inputSchema: AIPerformanceInsightsInputSchema,
    outputSchema: AIPerformanceInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
