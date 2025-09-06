
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function MysteryBoxPage() {
  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Mystery Box</h1>
            <p className="text-muted-foreground">Exciting surprises are coming soon!</p>
        </header>
        <Card className="flex flex-col items-center justify-center text-center p-12">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Gift className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="mt-4">The Mystery Box is Coming Soon!</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                    Get ready for a thrilling new feature. Keep an eye on this space for exciting announcements and opportunities to win amazing rewards.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">What secrets does it hold? Only time will tell...</p>
            </CardContent>
        </Card>
    </div>
  );
}
