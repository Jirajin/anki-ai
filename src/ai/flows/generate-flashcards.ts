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
      question: z
        .string()
        .describe('The question for the flashcard, potentially including markdown for **keyword** highlighting. If extracted directly from source, this will be the original question.'),
      answer: z
        .string()
        .describe('The answer to the question. If generated, includes a separate paragraph with memory hooks/tips focused on visualization/mind-mapping. If extracted, this will be the original answer.'
        ),
    })
  ).describe('The generated or extracted flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
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
    schema: GenerateFlashcardsOutputSchema, // Use the defined output schema
  },
  // Reverted Prompt: Includes rules for highlights, existing Q&A (verbatim), and separate paragraph visualization/mind-map hooks
  prompt: `You are an expert educator specializing in creating effective anki flashcards using cognitive science principles.

**Task:** Analyze the provided document and generate/extract flashcards based on its content, following specific rules.

**Input Document:** {{media url=documentDataUri}}

**Rules for Flashcard Creation:**

1.  **Language:** Detect the primary language of the input document. Generate/extract all flashcard content (question, answer, memory hook) in this **same language**.
2.  **Prioritize Highlights:** First, look for any **highlighted text** in the document. If highlights are present, focus **exclusively** on the highlighted content for creating flashcards.
3.  **Extract Existing Q&A:** Search the document (especially within highlighted sections, if any) for existing **question-and-answer pairs** (e.g., chapter review questions, quizzes). If found, extract these **verbatim** into the flashcard format.
4.  **Generate New Flashcards:** For content that is **highlighted but NOT part of an existing Q&A pair**, OR if there are **no highlights**, generate new flashcards based on the core concepts.
    *   For **Generated** Flashcards ONLY:
        a.  Create a clear, concise **question** in the detected language. Identify 1-3 **crucial keywords** within the question and format them using **markdown bold** (e.g., \`**keyword**\`).
        b.  Provide an accurate and comprehensive **answer** in the detected language.
        c.  After the main answer, start a new **new paragraph** within the *same answer field*. Start this paragraph with "💡 **Memory Hook:**". Your task is to suggest science based memory hooks, give tips to remember this flashcards answer, mnemonics, or associations to help the user better remember and recall the information. Also build connection with other flashcards if there is any.
.
5.  **Output:** Format all extracted or generated flashcards as a JSON array according to the schema. Ensure valid JSON parseable by Javascript's JSON.parse.

**Output Schema:**
{
  "flashcards": [
    {
      "question": "<question_string (bolded keywords if generated, verbatim if extracted)>",
      "answer": "<answer_string (if generated)>

<localized_memory_hook_prefix> <visualization/mind-map hook_text>" 
      // OR if extracted: "<answer_string (verbatim)>"
    },
    ...
  ]
}
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
  // Ensure output is not null before returning
  if (!output) {
    throw new Error("Failed to generate flashcards: AI output was null.");
  }
  return output;
});
