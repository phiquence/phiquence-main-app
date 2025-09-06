import { config } from 'dotenv';
config();

// Ensure all your defined flows are imported here
// so that they can be discovered by the Genkit CLI.
import '@/ai/flows/ai-driven-support.ts';
