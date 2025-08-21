'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personal finance tips.
 *
 * It includes:
 * - `generateFinanceTips`: A function to generate finance tips.
 * - `FinanceTipsInput`: The input type for the generateFinanceTips function.
 * - `FinanceTipsOutput`: The output type for the generateFinanceTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Expense } from '@/lib/types';

const FinanceTipsInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Optional topic to generate finance tips about.'),
  numberOfTips: z
    .number()
    .optional()
    .default(3)
    .describe('Number of tips to generate.'),
  expenses: z.array(z.any()).optional().describe('An array of recent user expenses to provide personalized advice.')
});
export type FinanceTipsInput = z.infer<typeof FinanceTipsInputSchema>;

const FinanceTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('An array of personal finance tips.'),
});
export type FinanceTipsOutput = z.infer<typeof FinanceTipsOutputSchema>;

export async function generateFinanceTips(input: FinanceTipsInput): Promise<FinanceTipsOutput> {
  return generateFinanceTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financeTipsPrompt',
  input: {schema: FinanceTipsInputSchema},
  output: {schema: FinanceTipsOutputSchema},
  prompt: `You are a personal finance expert and advisory chatbot. Your goal is to help users improve their financial health.

  {{#if expenses}}
  You have been provided with the user's recent expense data. Analyze their spending habits and provide personalized, actionable advice. For example, suggest reducing spending in a specific category and redirecting the savings towards a goal. Be specific and encouraging.
  Here are the recent expenses:
  {{#each expenses}}
  - {{this.category}}: {{this.amount}} on {{this.date}}
  {{/each}}
  {{else}}
  Generate a list of {{{numberOfTips}}} personal finance tips.
  {{/if}}

  {{#if topic}}
  The tips should be related to the following topic: {{{topic}}}.
  {{/if}}
  
  The tips should be concise and actionable.
  Format the output as a JSON array of strings.
  `,
});

const generateFinanceTipsFlow = ai.defineFlow(
  {
    name: 'generateFinanceTipsFlow',
    inputSchema: FinanceTipsInputSchema,
    outputSchema: FinanceTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
