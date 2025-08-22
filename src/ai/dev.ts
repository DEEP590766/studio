import { config } from 'dotenv';
config();

import '@/ai/flows/extract-expense-info.ts';
import '@/ai/flows/generate-finance-tips.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/ask-llm.ts';
import '@/ai/tools/get-stock-price.ts';
