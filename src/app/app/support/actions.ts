"use server";

import { z } from "zod";
import { aiDrivenSupport, type AIDrivenSupportOutput } from "@/ai/flows/ai-driven-support";

let responseId = 0;

export type SupportActionState = {
  answer: string | null;
  suggestedDocuments: string[] | null;
  error: string | null;
  id: number | null;
};

const QuerySchema = z.object({
    query: z.string().min(10, "Please describe your issue in at least 10 characters."),
    language: z.string(),
});

export async function handleSupportQuery(
  prevState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  const rawData = {
    query: formData.get("query"),
    language: formData.get("language"),
  }

  const validatedData = QuerySchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      answer: null,
      suggestedDocuments: null,
      error: validatedData.error.errors[0].message,
      id: null,
    };
  }
  
  try {
    const result: AIDrivenSupportOutput = await aiDrivenSupport(validatedData.data);
    responseId++;
    return {
      answer: result.answer,
      suggestedDocuments: result.suggestedDocuments,
      error: null,
      id: responseId,
    };
  } catch (e) {
    console.error(e);
    return {
      answer: null,
      suggestedDocuments: null,
      error: "An unexpected error occurred. Our AI assistant might be unavailable. Please try again later.",
      id: null,
    };
  }
}
