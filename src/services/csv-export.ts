/**
 * Represents a flashcard with a question, answer, and memory hooks.
 */
export interface Flashcard {
  /**
   * The question part of the flashcard.
   */
  question: string;
  /**
   * The answer part of the flashcard.
   */
  answer: string;
  /**
   * Memory hooks to help remember the answer.
   */
  memoryHooks: string[];
}

/**
 * Asynchronously exports a single flashcard to CSV format.
 *
 * @param flashcard The flashcard to export.
 * @returns A promise that resolves to a CSV string representing the flashcard.
 */
export async function exportFlashcardToCsv(flashcard: Flashcard): Promise<string> {
  const question = escapeCsvField(flashcard.question);
  const answer = escapeCsvField(flashcard.answer);
  const memoryHooks = escapeCsvField(flashcard.memoryHooks.join('; ')); // Join memory hooks with semicolon

  const csvString = `Question,Answer,Memory Hooks\n${question},${answer},${memoryHooks}\n`;
  return csvString;
}

/**
 * Asynchronously exports an array of flashcards to CSV format.
 *
 * @param flashcards An array of flashcards to export.
 * @returns A promise that resolves to a CSV string representing all flashcards.
 */
export async function exportFlashcardsToCsv(flashcards: Flashcard[]): Promise<string> {
  let csvString = 'Question,Answer,Memory Hooks\n';
  flashcards.forEach(flashcard => {
    const question = escapeCsvField(flashcard.question);
    const answer = escapeCsvField(flashcard.answer);
    const memoryHooks = escapeCsvField(flashcard.memoryHooks.join('; ')); // Join memory hooks with semicolon
    csvString += `${question},${answer},${memoryHooks}\n`;
  });
  return csvString;
}

/**
 * Helper function to escape CSV fields that contain commas or double quotes.
 * @param field The field to escape.
 * @returns The escaped field.
 */
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Replace double quotes with two double quotes, and enclose the field in double quotes
    return `"${field.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
  }
  return field;
}
