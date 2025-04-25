/**
 * Represents a flashcard with a question and answer.
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
}

/**
 * Exports a single flashcard to CSV format.
 * @param flashcard - The flashcard to export.
 * @returns A CSV string representing the flashcard.
 */
export async function exportFlashcardToCsv(flashcard: Flashcard): Promise<string> {
  const question = escapeCsvField(flashcard.question);
  const answer = escapeCsvField(flashcard.answer);
  const csvString = `Question,Answer\n${question},${answer}\n`;
  return csvString;
}

/**
 * Asynchronously exports an array of flashcards to CSV format.
 *
 * @param flashcards An array of flashcards to export.
 * @returns A promise that resolves to a CSV string representing all flashcards.
 */
export async function exportFlashcardsToCsv(flashcards: Flashcard[]): Promise<string> {
  let csvString = 'Question,Answer\n';
  flashcards.forEach(flashcard => {
    const question = escapeCsvField(flashcard.question);
    const answer = escapeCsvField(flashcard.answer);
    csvString += `${question},${answer}\n`;
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
