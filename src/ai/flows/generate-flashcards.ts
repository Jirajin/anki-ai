// src/ai/flows/generate-flashcards.ts
'use server';
/**
 * @fileOverview Generates flashcards from uploaded textbook images or PDFs.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (image or PDF) of textbook pages, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question for the flashcard.'),
      answer: z.string().describe('The answer to the question.'),
      memoryHooks: z.array(z.string()).describe('Tips and memory hooks to remember the answer.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {
    schema: z.object({
      documentDataUri: z
        .string()
        .describe(
          "A document (image or PDF) of textbook pages, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      flashcards: z.array(
        z.object({
          question: z.string().describe('The question for the flashcard.'),
          answer: z.string().describe('The answer to the question.'),
          memoryHooks: z.array(z.string()).describe('Tips and memory hooks to remember the answer.'),
        })
      ).describe('The generated flashcards.'),
    }),
  },
  prompt: `You are an expert educator specializing in creating flashcards for students.

Analyze the provided textbook content and generate a set of flashcards with relevant questions, answers, memory hooks, and tips to help students learn the material efficiently. Automatically determine the most effective flashcard types, memory hooks, and tips for each piece of information.

Document: {{media url=documentDataUri}}

Output the flashcards in JSON format. Ensure that the questions are clear, concise, and directly related to the content. The answers should be accurate and comprehensive. The memoryHooks should provide helpful tips and techniques for memorization.

Ensure the outputted JSON can be parsed by Javascript's JSON.parse.
`, 
});

const generateFlashcardsFlow = ai.defineFlow<
  typeof GenerateFlashcardsInputSchema,
  typeof GenerateFlashcardsOutputSchema
>({
  name: 'generateFlashcardsFlow',
  inputSchema: GenerateFlashcardsInputSchema,
  outputSchema: GenerateFlashcardsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
