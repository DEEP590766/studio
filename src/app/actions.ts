
"use server";

import { askLLM } from "@/ai/flows/ask-llm";
import { extractExpenseInfo } from "@/ai/flows/extract-expense-info";
import { generateFinanceTips } from "@/ai/flows/generate-finance-tips";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { Expense } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function processVoiceInput(voiceInput: string) {
  try {
    const result = await extractExpenseInfo({ voiceInput });
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error processing voice input:", error);
    return { success: false, error: "Failed to process voice input." };
  }
}

export async function processAudioInput(audioDataUri: string) {
    try {
        const transcription = await transcribeAudio({ audio: audioDataUri });
        if (!transcription.text) {
            return { success: false, error: "Could not understand audio." };
        }
        const result = await extractExpenseInfo({ voiceInput: transcription.text });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/advisory");
        return { success: true, data: result };
    } catch (error) {
        console.error("Error processing audio input:", error);
        return { success: false, error: "Failed to process audio input." };
    }
}

export async function getFinanceTips(topic?: string, expenses?: Expense[]) {
    try {
        const result = await generateFinanceTips({ topic, numberOfTips: 5, expenses });
        return { success: true, data: result.tips };
    } catch (error) {
        console.error("Error generating finance tips:", error);
        return { success: false, error: "Failed to generate finance tips." };
    }
}

export async function generateAndRevalidateFinanceTips(topic?: string, expenses?: Expense[]) {
    const result = await getFinanceTips(topic, expenses);
    if (result.success) {
        revalidatePath("/dashboard/tips");
        revalidatePath("/dashboard/advisory");
    }
    return result;
}

export async function askLLMAboutExpenses(query: string, expenses: Expense[]) {
    try {
        const result = await askLLM({ query, expenses });
        return { success: true, data: result.answer };
    } catch (error) {
        console.error("Error asking LLM about expenses:", error);
        return { success: false, error: "Failed to get an answer." };
    }
}
