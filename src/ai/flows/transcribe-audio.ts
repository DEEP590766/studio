'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing audio to text.
 *
 * It includes:
 * - `transcribeAudio`: A function to transcribe audio.
 * - `TranscribeAudioInput`: The input type for the transcribeAudio function.
 * - `TranscribeAudioOutput`: The output type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audio: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type TranscribeAudioOutput = z.infer<
  typeof TranscribeAudioOutputSchema
>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: [{media: {url: input.audio}}],
    });
    return {text};
  }
);
