'use server';
/**
 * @fileOverview This file defines a Genkit flow that automatically determines the most effective flashcard type
 * based on the input text. It exports the flow, input and output types, and a wrapper function.
 *
 * - generateCardType - A function that calls the generateCardTypeFlow with the input and returns the output.
 * - GenerateCardTypeInput - The input type for the generateCardType function.
 * - GenerateCardTypeOutput - The return type for the generateCardType function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCardTypeInputSchema = z.object({
  textbookContent: z
    .string()
    .describe('The content of the textbook to generate flashcards from.'),
});
export type GenerateCardTypeInput = z.infer<typeof GenerateCardTypeInputSchema>;

const GenerateCardTypeOutputSchema = z.object({
  flashcardType: z
    .string()
    .describe(
      'The determined flashcard type (e.g., question-answer, fill-in-the-blank, concept mapping).'
    ),
  memoryHooks: z.string().describe('Suggestions for memory hooks to help remember the flashcard.'),
  tips: z.string().describe('Tips on how to effectively use the generated flashcard.'),
  question: z.string().optional().describe('The question for question-answer flashcards.'),
  answer: z.string().optional().describe('The answer for question-answer flashcards.'),
  fillInTheBlank: z.string().optional().describe('The fill-in-the-blank text.'),
});
export type GenerateCardTypeOutput = z.infer<typeof GenerateCardTypeOutputSchema>;

export async function generateCardType(input: GenerateCardTypeInput): Promise<GenerateCardTypeOutput> {
  return generateCardTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCardTypePrompt',
  input: {
    schema: z.object({
      textbookContent: z
        .string()
        .describe('The content of the textbook to generate flashcards from.'),
    }),
  },
  output: {
    schema: z.object({
      flashcardType: z
        .string()
        .describe(
          'The determined flashcard type (e.g., question-answer, fill-in-the-blank, concept mapping).'
        ),
      memoryHooks: z.string().describe('Suggestions for memory hooks to help remember the flashcard.'),
      tips: z.string().describe('Tips on how to effectively use the generated flashcard.'),
      question: z.string().optional().describe('The question for question-answer flashcards.'),
      answer: z.string().optional().describe('The answer for question-answer flashcards.'),
      fillInTheBlank: z.string().optional().describe('The fill-in-the-blank text.'),
    }),
  },
  prompt: `You are an expert in creating flashcards for students. Given the following textbook content, determine the most effective flashcard type (e.g., question-answer, fill-in-the-blank, concept mapping) to help students learn the material. Also, provide memory hooks and tips on how to effectively use the generated flashcard.

Textbook Content: {{{textbookContent}}}

Output the flashcard type, memory hooks, tips, and the flashcard content (question/answer or fill-in-the-blank text) in JSON format.  If the flashcard type is not question-answer or fill-in-the-blank, leave the question, answer, and fillInTheBlank fields empty.

Here is a sample JSON output:
{
  "flashcardType": "question-answer",
  "memoryHooks": "Associate the concept with a real-world example.",
  "tips": "Review this flashcard regularly to reinforce your understanding.",
  "question": "What is the capital of France?",
  "answer": "Paris"
}
`,
});

const generateCardTypeFlow = ai.defineFlow<
  typeof GenerateCardTypeInputSchema,
  typeof GenerateCardTypeOutputSchema
>(
  {
    name: 'generateCardTypeFlow',
    inputSchema: GenerateCardTypeInputSchema,
    outputSchema: GenerateCardTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
