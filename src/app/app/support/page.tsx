
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiSupportForm } from "@/components/app/ai-support-form";
import { Bot, FileQuestion, UploadCloud } from "lucide-react";
import Script from "next/script";

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Support & KYC</h1>
        <p className="text-muted-foreground">Get help, submit your documents, and manage your tickets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> AI-Powered Support</CardTitle>
                <CardDescription>
                    Have a question? Get instant answers from our AI assistant. Select your preferred language and describe your issue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AiSupportForm />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileQuestion /> Live AI Agent</CardTitle>
                <CardDescription>
                    Chat with our live agent for more complex issues.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Script
                id="jotform-agent"
                src="https://cdn.jotfor.ms/agent/embed.js"
                onLoad={() => {
                  (window as any).JotformAgent?.init({
                    autoOpen: false,
                    agentId: "01986f2f3c3473c2a87de15da94a6ac0d481",
                  });
                }}
                strategy="lazyOnload"
              />
              <p className="text-sm text-muted-foreground">Click the bubble in the bottom right to start a chat with a live agent.</p>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UploadCloud /> KYC Verification</CardTitle>
                <CardDescription>
                    Upload your documents to unlock all features.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Input id="document-type" value="National ID / Passport" readOnly />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="document-upload">Upload File</Label>
                    <Input id="document-upload" type="file" />
                </div>
                <Button className="w-full" variant="outline">Upload Document</Button>
            </CardContent>
        </Card>

      </div>

    </div>
  );
}
