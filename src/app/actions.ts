"use server";

import { extractExpenseInfo } from "@/ai/flows/extract-expense-info";
import { generateFinanceTips } from "@/ai/flows/generate-finance-tips";
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

export async function getFinanceTips(topic?: string) {
    try {
        const result = await generateFinanceTips({ topic, numberOfTips: 5 });
        return { success: true, data: result.tips };
    } catch (error) {
        console.error("Error generating finance tips:", error);
        return { success: false, error: "Failed to generate finance tips." };
    }
}

export async function generateAndRevalidateFinanceTips(topic?: string) {
    const result = await getFinanceTips(topic);
    if (result.success) {
        revalidatePath("/dashboard/tips");
    }
    return result;
}
