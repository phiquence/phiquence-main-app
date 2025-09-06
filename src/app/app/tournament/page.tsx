
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function TournamentPage() {
  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Affiliate Tournament</h1>
            <p className="text-muted-foreground">Compete and win exclusive rewards!</p>
        </header>
        <Card className="flex flex-col items-center justify-center text-center p-12">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Trophy className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="mt-4">Tournaments Are Coming Soon!</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                    Get ready to compete with other affiliates in exciting tournaments. Climb the leaderboard and win amazing prizes. Stay tuned for more details!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Sharpen your skills. The competition is on its way...</p>
            </CardContent>
        </Card>
    </div>
  );
}
