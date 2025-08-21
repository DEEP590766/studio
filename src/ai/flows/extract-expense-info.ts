// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting expense information (amount and category) from voice input.
 *
 * - extractExpenseInfo - A function that processes voice input and extracts the expense amount and category.
 * - ExtractExpenseInfoInput - The input type for the extractExpenseInfo function.
 * - ExtractExpenseInfoOutput - The return type for the extractExpenseInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExpenseInfoInputSchema = z.object({
  voiceInput: z
    .string()
    .describe(
      'The voice input from the user, as a string.'
    ),
});
export type ExtractExpenseInfoInput = z.infer<typeof ExtractExpenseInfoInputSchema>;

const ExtractExpenseInfoOutputSchema = z.object({
  amount: z.number().describe('The expense amount.'),
  category: z.string().describe('The expense category (Food, Travel, Shopping, etc.).'),
});
export type ExtractExpenseInfoOutput = z.infer<typeof ExtractExpenseInfoOutputSchema>;

export async function extractExpenseInfo(input: ExtractExpenseInfoInput): Promise<ExtractExpenseInfoOutput> {
  return extractExpenseInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractExpenseInfoPrompt',
  input: {schema: ExtractExpenseInfoInputSchema},
  output: {schema: ExtractExpenseInfoOutputSchema},
  prompt: `You are a personal finance assistant that extracts the expense amount and category from user voice input.

  The user will provide voice input as text. You must extract two pieces of information:
  1.  The expense amount, as a number.
  2.  The expense category.  The category must be one of the following: Food, Travel, Shopping, Entertainment, Bills, Other. If the category is not clear, classify to the 'Other' category.

  Voice Input: {{{voiceInput}}}
  `,
});

const extractExpenseInfoFlow = ai.defineFlow(
  {
    name: 'extractExpenseInfoFlow',
    inputSchema: ExtractExpenseInfoInputSchema,
    outputSchema: ExtractExpenseInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
