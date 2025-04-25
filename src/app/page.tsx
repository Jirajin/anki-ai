"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { Flashcard } from "@/services/csv-export";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Edit, ExternalLink, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportFlashcardToCsv, exportFlashcardsToCsv } from "@/services/csv-export";
import { Separator } from "@/components/ui/separator";

async function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], {type: mimeString});
  return blob;
}

export default function Home() {
  const [documentDataUri, setDocumentDataUri] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!documentDataUri) {
      toast({
        title: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateFlashcards({ documentDataUri });
      setFlashcards(result.flashcards);
      toast({
        title: "Flashcards generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Error generating flashcards.",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllCsv = async () => {
    if (flashcards.length === 0) {
      toast({
        title: "No flashcards to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvData = await exportFlashcardsToCsv(flashcards);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Flashcards exported to CSV successfully!",
      });
    } catch (error: any) {
      console.error("Error exporting flashcards to CSV:", error);
      toast({
        title: "Error exporting flashcards to CSV.",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleExportSingleCsv = async (flashcard: Flashcard) => {
    try {
      const csvData = await exportFlashcardToCsv(flashcard);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcard.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Flashcard exported to CSV successfully!",
      });
    } catch (error: any) {
      console.error("Error exporting flashcard to CSV:", error);
      toast({
        title: "Error exporting flashcard to CSV.",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-3xl font-bold">FlashGenius</h1>
      <Card>
        <CardHeader>
          <Label htmlFor="document">Upload Textbook Image/PDF</Label>
        </CardHeader>
        <CardContent>
          <Input type="file" id="document" accept="image/*, application/pdf" onChange={handleFileUpload} />
          {documentDataUri && (
            <img src={documentDataUri} alt="Uploaded Document" className="mt-4 rounded-md" />
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </CardFooter>
      </Card>

      {flashcards.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Flashcards</h2>
            <Button variant="secondary" size="sm" onClick={handleExportAllCsv}>
              Export All to CSV
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardContent>
                      <Label htmlFor={`question-${index}`}>Question</Label>
                      <Textarea id={`question-${index}`} defaultValue={card.question} className="mb-2" readOnly />
                      <Label htmlFor={`answer-${index}`}>Answer</Label>
                      <Textarea id={`answer-${index}`} defaultValue={card.answer} className="mb-2" readOnly />
                      {card.memoryHooks && card.memoryHooks.length > 0 && (
                        <>
                          <Label>Memory Hooks</Label>
                          <ul>
                            {card.memoryHooks.map((hook, i) => (
                              <li key={i} className="list-disc ml-4">{hook}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </CardContent>
                  </div>
                </CardHeader>
                <CardFooter className="justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportSingleCsv(card)}>
                        <Copy className="mr-2 h-4 w-4" /> Export to CSV
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
