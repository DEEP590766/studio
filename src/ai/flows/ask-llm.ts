'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about their financial data.
 *
 * It includes:
 * - `askLLM`: A function that takes a user's query and their expenses and returns a conversational answer.
 * - `AskLLMInput`: The input type for the askLLM function.
 * - `AskLLMOutput`: The output type for the askLLM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStockPrice } from '../tools/get-stock-price';

const AskLLMInputSchema = z.object({
  query: z.string().describe('The user\'s question about their finances.'),
  expenses: z.array(z.any()).describe('An array of recent user expenses.'),
});
export type AskLLMInput = z.infer<typeof AskLLMInputSchema>;

const AskLLMOutputSchema = z.object({
  answer: z.string().describe('A conversational answer to the user\'s question.'),
});
export type AskLLMOutput = z.infer<typeof AskLLMOutputSchema>;

export async function askLLM(input: AskLLMInput): Promise<AskLLMOutput> {
  return askLLMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askLLMPrompt',
  input: {schema: AskLLMInputSchema},
  output: {schema: AskLLMOutputSchema},
  tools: [getStockPrice],
  prompt: `You are a friendly and helpful personal finance assistant. The user will ask you a question about their spending based on the expense data provided.

Analyze the data and answer their question in a clear, conversational, and helpful tone.

If the user asks about a stock price, use the getStockPrice tool to get the current price and include it in your answer.

User's Question: {{{query}}}

Expense Data:
{{#each expenses}}
- {{this.category}}: {{this.amount}} on {{this.date}}
{{/each}}
`,
});

const askLLMFlow = ai.defineFlow(
  {
    name: 'askLLMFlow',
    inputSchema: AskLLMInputSchema,
    outputSchema: AskLLMOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
