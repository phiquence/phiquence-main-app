
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiSupportForm } from "@/components/app/ai-support-form";
import { Bot, FileQuestion, UploadCloud, Camera, UserCheck, Volume2 } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function SupportPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error('Camera functionality is not supported in this browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings for KYC verification.',
        });
      }
    };

    // We can trigger this based on user action, e.g. clicking a "Start KYC" button
    // For now, let's assume it checks when the component mounts.
    // In a real scenario, this would be inside a function called by a button.
    // getCameraPermission(); 
  }, [toast]);
  
  const handleStartKyc = () => {
     const getCameraPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error('Camera functionality is not supported in this browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings for KYC verification.',
        });
      }
    };
    getCameraPermission();
  }

  const handleListen = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "AI Text-to-Speech functionality will be available shortly.",
    });
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Support & KYC</h1>
        <p className="text-muted-foreground">Get help, submit your documents, and manage your tickets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="md:col-span-2">
          <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI-Powered Support</CardTitle>
                    <CardDescription>
                    Have a question? Get instant answers from our AI assistant.
                    </CardDescription>
                </div>
                 <Button variant="outline" size="icon" onClick={handleListen} disabled>
                    <Volume2 className="h-4 w-4"/>
                    <span className="sr-only">Listen to response</span>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AiSupportForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck /> KYC Verification</CardTitle>
                <CardDescription>
                    To ensure the security of our platform, please complete the identity verification process.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                    {/* Step 1: Document Upload */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><UploadCloud className="text-primary"/> Step 1: Upload Document</h3>
                        <div className="space-y-2">
                            <Label htmlFor="document-type">Document Type</Label>
                            <Input id="document-type" value="National ID / Passport" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="document-upload">Upload File</Label>
                            <Input id="document-upload" type="file" className="file:text-primary"/>
                        </div>
                         <Button variant="outline" className="w-full">Upload Document</Button>
                    </div>

                    {/* Step 2: Liveness Check */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Camera className="text-primary"/> Step 2: Liveness Check</h3>
                         <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         </div>
                        <Button onClick={handleStartKyc} className="w-full">Start Camera</Button>
                    </div>
                </div>
                 {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser to complete the liveness check.
                        </AlertDescription>
                    </Alert>
                )}
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
                if ((window as any).JotformAgent) {
                    (window as any).JotformAgent.init({
                        autoOpen: false,
                        agentId: "01986f2f3c3473c2a87de15da94a6ac0d481",
                    });
                }
              }}
              strategy="lazyOnload"
            />
            <p className="text-sm text-muted-foreground">Click the bubble in the bottom right to start a chat with a live agent.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    