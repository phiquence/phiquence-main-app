
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, DraftingCompass, FlaskConical, Target, Milestone, Bot, LineChart, Rocket } from "lucide-react";
import { useUserData } from "@/hooks/use-auth";

const statusConfig = {
    active: { text: "Active", icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-400/10" },
    coming_soon: { text: "Coming Soon", icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    planned: { text: "Planned", icon: DraftingCompass, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    research: { text: "Research", icon: FlaskConical, color: "text-purple-400", bgColor: "bg-purple-400/10" },
};

type Status = keyof typeof statusConfig;

const phase1Features = [
    {
        title: "Smart Wallet System",
        description: "Full control over your finances is now in your hands. With our automated deposit and withdrawal system, every transaction is fast and secure.",
        status: "active" as Status,
        progress: (userData: any) => `You have successfully completed ${userData?.transactions?.length || 0} transactions.`
    },
    {
        title: "Founder's Club Activation",
        description: "Your journey as a special member of the Founder's Club has begun. Enjoy a 1.2% daily reward and your exclusive dashboard.",
        status: "active" as Status,
        progress: (userData: any) => userData?.isFounder ? "Your daily Founder reward is active." : "Click here to become a Founder."
    },
    {
        title: "Initial Affiliate Program",
        description: "Generate your unique referral link, invite others, and prepare to earn from your network. It's time to share your success journey.",
        status: "coming_soon" as Status,
    },
    {
        title: "Goal Setting Tool",
        description: "Define your monthly income goals. Our system will guide you on the right path to achieve them.",
        status: "coming_soon" as Status,
    },
];

const phase2Features = [
    {
        title: "Advanced Affiliate Dashboard",
        description: "New tools are coming to strengthen your affiliate network. Track your team's performance and take your leadership to the next level.",
        status: "planned" as Status,
    },
    {
        title: "Golden Staking Pool",
        description: "An opportunity for extra profit beyond standard earnings. Multiply the power of your investment through a special staking pool.",
        status: "planned" as Status,
    },
    {
        title: "Monthly Founder Bonus",
        description: "Get ready to receive an additional monthly bonus of 5% to 10% for your contributions as a Founder.",
        status: "planned" as Status,
    },
];

const phase3Features = [
    {
        title: "The Compounding Engine",
        description: "This will be our most powerful feature. Grow your wealth exponentially by automatically reinvesting your daily earnings.",
        status: "research" as Status,
    },
    {
        title: "AI-Powered Performance Suggestions",
        description: "Our AI will analyze your performance and provide personalized advice to help you maximize your income.",
        status: "research" as Status,
    },
     {
        title: "Billionaire's Club Pre-Access",
        description: "The doors to the Billionaire's Club will open for those who meet our targets, offering incredible opportunities and an elite investment world.",
        status: "research" as Status,
    },
];


export default function GoldenJourneyPage() {
    const { userData } = useUserData();

    return (
        <div className="space-y-12 text-white p-2">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline bg-clip-text text-transparent bg-gradient-to-br from-yellow-300 to-amber-500">
                    The Golden Journey
                </h1>
                <p className="text-muted-foreground mt-2 text-lg md:text-xl">A Three-Month Roadmap to Becoming a True Millionaire</p>
            </header>

            <div className="relative border-l-2 border-primary/20 ml-6 space-y-16">
                 <PhaseSection
                    phaseNumber={1}
                    title="Foundation & Confidence Building (Month 1)"
                    icon={Target}
                    features={phase1Features}
                    userData={userData}
                 />
                 <PhaseSection
                    phaseNumber={2}
                    title="Growth and Opportunity (Month 2)"
                    icon={Rocket}
                    features={phase2Features}
                    userData={userData}
                 />
                  <PhaseSection
                    phaseNumber={3}
                    title="Total Freedom and Automation (Month 3)"
                    icon={Bot}
                    features={phase3Features}
                    userData={userData}
                 />
            </div>
        </div>
    );
}


const PhaseSection = ({ phaseNumber, title, icon: Icon, features, userData }: { phaseNumber: number, title: string, icon: React.ElementType, features: any[], userData: any }) => (
     <div className="relative pl-12">
        <div className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-background">
             <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-headline mb-8">
            <span className="text-primary">Phase {phaseNumber}:</span> {title}
        </h2>
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map(feature => <FeatureCard key={feature.title} feature={feature} userData={userData}/>)}
        </div>
    </div>
);


const FeatureCard = ({ feature, userData }: { feature: any, userData: any }) => {
    const status = statusConfig[feature.status];
    const StatusIcon = status.icon;

    return (
        <Card className="bg-gray-800/50 border-gray-700 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader>
                 <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full self-start ${status.bgColor} ${status.color}`}>
                    <StatusIcon className="h-4 w-4"/>
                    <span>{status.text}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                {feature.progress && (
                    <div className="mt-4 text-xs text-primary/80 italic p-3 bg-primary/10 rounded-lg border border-primary/20">
                        {feature.progress(userData)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
