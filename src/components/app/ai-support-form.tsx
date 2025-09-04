
"use client";

import * as React from "react";
import { useActionState } from "react";
import { handleSupportQuery, type SupportActionState } from "@/app/app/support/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const initialState: SupportActionState = {
  answer: null,
  suggestedDocuments: null,
  error: null,
  id: null,
};

export function AiSupportForm() {
  const [state, formAction, isPending] = useActionState(handleSupportQuery, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!isPending && !state.error && state.id) {
      // Reset form on successful submission
      formRef.current?.reset();
      setQuery('');
    }
  }, [isPending, state.error, state.id]);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        ref={formRef}
        className="space-y-4"
      >
        <Textarea
          name="query"
          placeholder="e.g., How do I enable auto-compounding for my stake?"
          required
          minLength={10}
          rows={5}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-base"
        />
        <Button type="submit" disabled={isPending || query.length < 10}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get Help
        </Button>
      </form>
      
      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state.id && !state.error && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {state.answer && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <CardTitle>AI Suggestion</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-p:text-foreground dark:prose-p:text-foreground">
                        <p>{state.answer}</p>
                    </CardContent>
                </Card>
            )}

            {state.suggestedDocuments && state.suggestedDocuments.length > 0 && (
                <Card>
                    <CardHeader  className="flex flex-row items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <CardTitle>Suggested Reading</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>These documents might also help you.</CardDescription>
                        <ul className="mt-4 list-none space-y-2">
                        {state.suggestedDocuments.map((doc, i) => (
                            <li key={i}>
                                <Link href="#" className="flex items-center gap-2 text-primary hover:underline">
                                    <FileText className="h-4 w-4" />
                                    <span>{doc}</span>
                                </Link>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
