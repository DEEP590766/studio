'use server';
/**
 * @fileOverview A Genkit tool for fetching the stock price of a given ticker.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Returns the current market value of a stock for a given ticker symbol.',
    inputSchema: z.object({
      ticker: z.string().describe('The ticker symbol of the stock (e.g., "GOOGL", "AAPL").'),
    }),
    outputSchema: z.number(),
  },
  async (input) => {
    // In a real application, you would call a financial data API here.
    // For this demo, we'll return a random realistic price.
    console.log(`Fetching stock price for ${input.ticker}...`);
    const randomPrice = Math.random() * (1000 - 100) + 100;
    return parseFloat(randomPrice.toFixed(2));
  }
);
