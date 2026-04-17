'use server';
/**
 * @fileOverview An AI agent that provides training recommendations based on an athlete's data.
 *
 * - aiTrainingRecommendation - A function that handles the AI training recommendation process.
 * - AiTrainingRecommendationInput - The input type for the aiTrainingRecommendation function.
 * - AiTrainingRecommendationOutput - The return type for the aiTrainingRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the AI training recommendation flow
const AiTrainingRecommendationInputSchema = z.object({
  athleteName: z.string().describe("The name of the athlete."),
  currentMaxes: z.object({
    squat: z.number().describe("Athlete's current 1RM for Squat in kg."),
    bench: z.number().describe("Athlete's current 1RM for Bench Press in kg."),
    deadlift: z.number().describe("Athlete's current 1RM for Deadlift in kg."),
  }).describe("Current 1-Rep Maxes (1RM) for the athlete's main lifts."),
  currentWorkoutWeek: z.array(z.object({
    id: z.number().describe("Unique identifier for the workout day."),
    day: z.string().describe("Name of the workout day (e.g., 'DIA 1')."),
    focus: z.string().describe("Main focus of the workout day (e.g., 'Squat')."),
    exercises: z.array(z.object({
      name: z.string().describe("Name of the exercise."),
      setsReps: z.string().describe("Sets and Reps for the exercise (e.g., '3x8')."),
      percent: z.union([z.number(), z.string()]).optional().describe("Percentage of 1RM for the exercise (e.g., 0.60 or '60%'). Can be empty for accessory lifts."),
      liftType: z.string().describe("Type of lift: 'squat', 'bench', 'deadlift', or 'accessory'."),
      link: z.string().optional().describe("Optional link to a video tutorial for the exercise.")
    })).describe("List of exercises for this workout day.")
  })).describe("The athlete's current training plan for one active week."),
  goalsAndCurrentStatus: z.string().optional().describe("Optional description of athlete's current goals, recent performance, or specific plateaus encountered (e.g., 'struggling to increase bench press', 'want to improve squat depth')."),
});
export type AiTrainingRecommendationInput = z.infer<typeof AiTrainingRecommendationInputSchema>;

// Output Schema for the AI training recommendation flow
const AiTrainingRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    type: z.enum(['adjust_exercise', 'add_exercise', 'remove_exercise', 'general_advice']).describe("Type of recommendation: 'adjust_exercise' (change sets/reps/percent), 'add_exercise', 'remove_exercise', 'general_advice' (overall coaching tip)."),
    dayId: z.number().optional().describe("The ID of the workout day the recommendation applies to (if applicable)."),
    exerciseIndex: z.number().optional().describe("The index of the exercise within the workout day's exercises array (if applicable)."),
    recommendation: z.string().describe("A detailed text description of the recommendation."),
    newSetsReps: z.string().optional().describe("New sets and reps for an adjusted exercise (e.g., '4x6')."),
    newPercent: z.number().optional().describe("New percentage of 1RM for an adjusted exercise (e.g., 0.70). This should be a decimal (e.g., 0.70 for 70%)."),
    newExerciseName: z.string().optional().describe("Name of a new exercise to add."),
    newExerciseLink: z.string().optional().describe("Optional link for a new exercise (e.g., a YouTube tutorial)."),
    reason: z.string().describe("Explanation for the recommendation.")
  })).describe("An array of suggested adjustments and advice for the training plan."),
  overallSummary: z.string().optional().describe("An optional overall summary of the AI's analysis and recommendations."),
});
export type AiTrainingRecommendationOutput = z.infer<typeof AiTrainingRecommendationOutputSchema>;

export async function aiTrainingRecommendation(input: AiTrainingRecommendationInput): Promise<AiTrainingRecommendationOutput> {
  return aiTrainingRecommendationFlow(input);
}

const aiTrainingRecommendationPrompt = ai.definePrompt({
  name: 'aiTrainingRecommendationPrompt',
  input: { schema: AiTrainingRecommendationInputSchema },
  output: { schema: AiTrainingRecommendationOutputSchema },
  prompt: `You are an expert strength and conditioning coach with deep knowledge in powerlifting.
Your goal is to analyze an athlete's current training plan and suggest intelligent adjustments to optimize strength gains, address plateaus, and ensure continuous progression.

Athlete Name: {{{athleteName}}}

Current 1RM Maxes (kg):
Squat: {{{currentMaxes.squat}}}
Bench Press: {{{currentMaxes.bench}}}
Deadlift: {{{currentMaxes.deadlift}}}

Athlete's Goals/Current Status:
{{#if goalsAndCurrentStatus}}
{{{goalsAndCurrentStatus}}}
{{else}}
The athlete aims for general strength optimization and continuous progression in powerlifting.
{{/if}}

Current Workout Plan for the Active Week:
{{#each currentWorkoutWeek}}
  Day ID: {{id}}, Day: {{day}}, Focus: {{focus}}
  Exercises:
  {{#each exercises}}
    - Name: {{name}}, SetsxReps: {{setsReps}}, Percent: {{percent}} (of {{liftType}} 1RM), Type: {{liftType}}
  {{/each}}
{{/each}}

Based on the provided information, identify potential areas for improvement, adjust training parameters (weights, sets, reps), suggest alternative or supplementary accessory exercises, or provide general coaching advice. When suggesting alternative or supplementary accessory exercises, try to pick from common powerlifting accessory exercises (e.g., pause squats, close grip bench, deficit deadlifts, Bulgarian split squats, leg press, rows, overhead press, triceps extensions, bicep curls, core work) or suggest new ones if appropriate.

For each recommendation, provide a 'type', 'dayId' and 'exerciseIndex' (if applicable), a 'recommendation' text, and a 'reason'. If adjusting an exercise, include 'newSetsReps' and/or 'newPercent'. If adding a new exercise, include 'newExerciseName' and optionally 'newExerciseLink'. Also provide an 'overallSummary'.

Example of output types:
- adjust_exercise: Change sets/reps/percentage of an existing exercise.
- add_exercise: Suggest a new exercise.
- remove_exercise: Suggest removing an exercise (less common, usually for overtraining or poor fit).
- general_advice: Broader coaching tips not tied to a specific exercise modification.

Ensure recommendations are actionable and align with powerlifting progression principles.
`
});

const aiTrainingRecommendationFlow = ai.defineFlow(
  {
    name: 'aiTrainingRecommendationFlow',
    inputSchema: AiTrainingRecommendationInputSchema,
    outputSchema: AiTrainingRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await aiTrainingRecommendationPrompt(input);
    if (!output) {
      throw new Error("Failed to get training recommendations.");
    }
    return output;
  }
);
