'use server';

/**
 * @fileOverview An AI-powered support tool that suggests relevant documentation and answers user queries.
 *
 * - aiDrivenSupport - A function that handles the support process.
 * - AIDrivenSupportInput - The input type for the aiDrivenSupport function.
 * - AIDrivenSupportOutput - The return type for the aiDrivenSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDrivenSupportInputSchema = z.object({
  query: z.string().describe('The user query or issue description.'),
});
export type AIDrivenSupportInput = z.infer<typeof AIDrivenSupportInputSchema>;

const AIDrivenSupportOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user query.'),
  suggestedDocuments: z.array(z.string()).describe('A list of suggested support document titles that are relevant to the query.'),
});
export type AIDrivenSupportOutput = z.infer<typeof AIDrivenSupportOutputSchema>;

export async function aiDrivenSupport(input: AIDrivenSupportInput): Promise<AIDrivenSupportOutput> {
  return aiDrivenSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrivenSupportPrompt',
  input: {schema: AIDrivenSupportInputSchema},
  output: {schema: AIDrivenSupportOutputSchema},
  prompt: `You are an expert and friendly support assistant for a financial technology platform called Phiquence.

Your primary goal is to provide a clear, helpful, and concise answer to the user's question.
Based on the user's query, you must also suggest a few relevant support document titles that might help the user.

User's Question:
"{{{query}}}"

Please provide your response in a valid JSON object format with two keys:
1. "answer": A string containing the direct answer to the user's question.
2. "suggestedDocuments": A JSON array of strings, where each string is a helpful document title.
Example document titles: "How to open a stake", "Understanding affiliate commissions", "How to complete KYC verification".
`,
});

const aiDrivenSupportFlow = ai.defineFlow(
  {
    name: 'aiDrivenSupportFlow',
    inputSchema: AIDrivenSupportInputSchema,
    outputSchema: AIDrivenSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
