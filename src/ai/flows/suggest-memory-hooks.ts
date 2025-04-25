'use server';

/**
 * @fileOverview AI flow to suggest memory hooks, mnemonics, or associations for flashcards.
 *
 * - suggestMemoryHooks - A function that suggests memory hooks for a flashcard.
 * - SuggestMemoryHooksInput - The input type for the suggestMemoryHooks function.
 * - SuggestMemoryHooksOutput - The return type for the suggestMemoryHooks function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestMemoryHooksInputSchema = z.object({
  flashcardQuestion: z.string().describe('The question part of the flashcard.'),
  flashcardAnswer: z.string().describe('The answer part of the flashcard.'),
});
export type SuggestMemoryHooksInput = z.infer<typeof SuggestMemoryHooksInputSchema>;

const SuggestMemoryHooksOutputSchema = z.object({
  memoryHooks: z
    .array(z.string())
    .describe(
      'An array of memory hooks, mnemonics, or associations to help remember the flashcard information.'
    ),
});
export type SuggestMemoryHooksOutput = z.infer<typeof SuggestMemoryHooksOutputSchema>;

export async function suggestMemoryHooks(input: SuggestMemoryHooksInput): Promise<SuggestMemoryHooksOutput> {
  return suggestMemoryHooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMemoryHooksPrompt',
  input: {
    schema: z.object({
      flashcardQuestion: z.string().describe('The question part of the flashcard.'),
      flashcardAnswer: z.string().describe('The answer part of the flashcard.'),
    }),
  },
  output: {
    schema: z.object({
      memoryHooks: z
        .array(z.string())
        .describe(
          'An array of memory hooks, mnemonics, or associations to help remember the flashcard information.'
        ),
    }),
  },
  prompt: `You are an expert memory improvement assistant. Given a flashcard question and answer, your task is to suggest memory hooks, mnemonics, or associations to help the user better remember and recall the information.

Flashcard Question: {{{flashcardQuestion}}}
Flashcard Answer: {{{flashcardAnswer}}}

Suggest at least three memory hooks:
{{#each memoryHooks}}- {{this}}
{{/each}}`,
});

const suggestMemoryHooksFlow = ai.defineFlow<
  typeof SuggestMemoryHooksInputSchema,
  typeof SuggestMemoryHooksOutputSchema
>({
  name: 'suggestMemoryHooksFlow',
  inputSchema: SuggestMemoryHooksInputSchema,
  outputSchema: SuggestMemoryHooksOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
