
'use server';
/**
 * @fileOverview A Genkit flow for generating personalized mobility and warm-up routines.
 *
 * - generateMobilityRoutine - A function that handles the generation of mobility routines.
 * - MobilityRoutineGeneratorInput - The input type for the generateMobilityRoutine function.
 * - MobilityRoutineGeneratorOutput - The return type for the generateMobilityRoutine function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { EXERCISE_CATEGORIES } from '@/lib/constants';

const MobilityRoutineGeneratorInputSchema = z.object({
  mainLiftsToday: z
    .array(z.string())
    .describe('A list of the main lifts planned for the day (e.g., "Squat low bar", "Bench press").'),
});
export type MobilityRoutineGeneratorInput = z.infer<typeof MobilityRoutineGeneratorInputSchema>;

const MobilityExerciseSchema = z.object({
  name: z.string().describe('The name of the mobility or warm-up exercise.'),
  setsReps: z
    .string()
    .describe('Recommended sets and repetitions or duration for the exercise (e.g., "2x 10 reps", "3x 30 sec").'),
  link: z
    .string()
    .optional()
    .describe('An optional URL to a tutorial video for the exercise.'),
});

const MobilityRoutineGeneratorOutputSchema = z.object({
  mobilityRoutine: z.array(MobilityExerciseSchema).describe('A list of personalized mobility and warm-up exercises.'),
});
export type MobilityRoutineGeneratorOutput = z.infer<typeof MobilityRoutineGeneratorOutputSchema>;

export async function generateMobilityRoutine(input: MobilityRoutineGeneratorInput): Promise<MobilityRoutineGeneratorOutput> {
  return aiMobilityRoutineGeneratorFlow(input);
}

const aiMobilityRoutineGeneratorPrompt = ai.definePrompt({
  name: 'aiMobilityRoutineGeneratorPrompt',
  input: { schema: MobilityRoutineGeneratorInputSchema },
  output: { schema: MobilityRoutineGeneratorOutputSchema },
  prompt: `You are an expert strength and conditioning coach specializing in powerlifting and mobility. Your goal is to create a comprehensive and effective mobility and warm-up routine for an athlete based on their main lifts for the day.

Main lifts planned for today:
{{#each mainLiftsToday}}
- {{{this}}}
{{/each}}

Available exercise categories (use this as a reference):
${JSON.stringify(EXERCISE_CATEGORIES, null, 2)}

Create a mobility and warm-up routine that specifically targets the muscle groups and movement patterns involved in the main lifts. Each exercise in the routine should include its name, recommended sets and repetitions (or duration), and a link to a tutorial video if available in the provided categories, or a generic YouTube search link if not (e.g., "https://www.youtube.com/results?search_query=<exercise_name>"). Prioritize exercises that directly contribute to better performance and injury prevention for the main lifts. Keep the routine concise but effective (around 3-6 exercises).`,
});

const aiMobilityRoutineGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMobilityRoutineGeneratorFlow',
    inputSchema: MobilityRoutineGeneratorInputSchema,
    outputSchema: MobilityRoutineGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await aiMobilityRoutineGeneratorPrompt(input);
    return output!;
  }
);
