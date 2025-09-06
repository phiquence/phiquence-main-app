
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, DraftingCompass, FlaskConical, Target, Milestone, Bot, LineChart } from "lucide-react";
import { useUserData } from "@/hooks/use-auth";

const statusIcons = {
    active: { icon: CheckCircle, text: "অ্যাক্টিভ", color: "text-green-500", bgColor: "bg-green-500/10" },
    coming_soon: { icon: Clock, text: "শীঘ্রই আসছে", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    planned: { icon: DraftingCompass, text: "পরিকল্পনাধীন", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    research: { icon: FlaskConical, text: "গবেষণা পর্যায়ে", color: "text-purple-500", bgColor: "bg-purple-500/10" },
};

type Status = keyof typeof statusIcons;

const phase1Features = [
    {
        title: "স্মার্ট ওয়ালেট সিস্টেম",
        description: "আপনার আর্থিক লেনদেনের সম্পূর্ণ স্বাধীনতা এখন আপনার হাতে। স্বয়ংক্রিয় ডিপোজিট ও উইথড্র সিস্টেমের মাধ্যমে আপনার প্রতিটি লেনদেন হবে দ্রুত এবং নিরাপদ।",
        status: "active" as Status,
        progress: (userData: any) => `আপনি সফলভাবে ${userData?.transactions?.length || 0} টি লেনদেন সম্পন্ন করেছেন।`
    },
    {
        title: "ফাউন্ডার ক্লাব অ্যাক্টিভেশন",
        description: "ফাউন্ডার ক্লাবের বিশেষ সদস্য হিসেবে আপনার যাত্রা শুরু হয়েছে। এখন থেকে উপভোগ করুন প্রতিদিন ১.২% রিওয়ার্ড এবং আপনার জন্য তৈরি বিশেষ ড্যাশবোর্ড।",
        status: "active" as Status,
        progress: (userData: any) => userData?.isFounder ? "ফাউন্ডার হিসেবে আপনার দৈনিক রিওয়ার্ড শুরু হয়েছে।" : "ফাউন্ডার হতে এখানে ক্লিক করুন।"
    },
    {
        title: "প্রথম ধাপের অ্যাফিলিয়েট প্রোগ্রাম",
        description: "আপনার নিজস্ব রেফারেল লিঙ্ক তৈরি করে অন্যদের আমন্ত্রণ জানান এবং আপনার নেটওয়ার্ক থেকে আয় করার প্রস্তুতি নিন। আপনার সাফল্যের যাত্রা এবার অন্যদের সাথে ভাগ করে নেওয়ার পালা।",
        status: "coming_soon" as Status,
    },
    {
        title: "লক্ষ্য নির্ধারণ টুল",
        description: "আপনার মাসিক আয়ের লক্ষ্য নির্ধারণ করুন। আমাদের সিস্টেম আপনাকে সেই লক্ষ্যে পৌঁছানোর জন্য সঠিক পথ দেখাবে।",
        status: "coming_soon" as Status,
    },
];

const phase2Features = [
    {
        title: "অ্যাডভান্সড অ্যাফিলিয়েট ড্যাশবোর্ড",
        description: "আপনার অ্যাফিলিয়েট নেটওয়ার্ককে আরও শক্তিশালী করতে আসছে নতুন সব টুলস। আপনার টিমের পারফরম্যান্স ট্র্যাক করুন এবং আপনার নেতৃত্বকে এক নতুন উচ্চতায় নিয়ে যান।",
        status: "planned" as Status,
    },
    {
        title: "গোল্ডেন স্টেকিং পুল",
        description: "সাধারণ আয়ের বাইরেও অতিরিক্ত মুনাফার সুযোগ। বিশেষ স্টেকিং পুলের মাধ্যমে আপনার বিনিয়োগের শক্তিকে বহুগুণে বাড়িয়ে তুলুন।",
        status: "planned" as Status,
    },
    {
        title: "মাসিক ফাউন্ডার বোনাস",
        description: "ফাউন্ডার হিসেবে আপনার অবদানের জন্য মাসিক ৫% থেকে ১০% পর্যন্ত অতিরিক্ত বোনাস পাওয়ার জন্য প্রস্তুত থাকুন।",
        status: "planned" as Status,
    },
];

const phase3Features = [
    {
        title: "চক্রবৃদ্ধি ইঞ্জিন (The Compounding Engine)",
        description: "এটি আমাদের সবচেয়ে শক্তিশালী ফিচার হতে চলেছে। আপনার দৈনিক আয়কে স্বয়ংক্রিয়ভাবে পুনঃবিনিয়োগ করে চক্রবৃদ্ধি হারে আপনার সম্পদ বৃদ্ধি করুন। মিলিনিয়ার হওয়ার পথে এটি হবে আপনার তুরুপের তাস।",
        status: "research" as Status,
    },
    {
        title: "AI-ভিত্তিক পারফরম্যান্স সাজেশন",
        description: "আমাদের কৃত্রিম বুদ্ধিমত্তা আপনার পারফরম্যান্স বিশ্লেষণ করে আপনাকে ব্যক্তিগত পরামর্শ দেবে, যা আপনার আয়কে সর্বোচ্চ পর্যায়ে নিয়ে যেতে সাহায্য করবে।",
        status: "research" as Status,
    },
     {
        title: "বিলিয়নেয়ার্স ক্লাব প্রি-অ্যাক্সেস",
        description: "যারা আমাদের লক্ষ্যমাত্রা পূরণ করবে, তাদের জন্য উন্মুক্ত হবে বিলিয়নেয়ার্স ক্লাবের দরজা। এখানে অপেক্ষা করছে অকল্পনীয় সব সুযোগ এবং এলিট বিনিয়োগের জগৎ।",
        status: "research" as Status,
    },
];


export default function GoldenJourneyPage() {
    const { userData } = useUserData();

    return (
        <div className="space-y-12">
            <header className="text-center">
                <h1 className="text-3xl font-bold tracking-tight font-headline">আপনার আর্থিক স্বাধীনতার স্বর্ণালী পথচলা</h1>
                <p className="text-muted-foreground mt-2 text-lg">A Three-Month Roadmap to Becoming a True Millionaire</p>
            </header>

            <div className="relative border-l-2 border-primary/20 ml-6 space-y-16">
                 <PhaseSection
                    phaseNumber={1}
                    title="ভিত্তি স্থাপন এবং আত্মবিশ্বাসের সঞ্চার (প্রথম মাস)"
                    icon={Target}
                    features={phase1Features}
                    userData={userData}
                 />
                 <PhaseSection
                    phaseNumber={2}
                    title="প্রবৃদ্ধি এবং সুযোগের সদ্ব্যবহার (দ্বিতীয় মাস)"
                    icon={LineChart}
                    features={phase2Features}
                    userData={userData}
                 />
                  <PhaseSection
                    phaseNumber={3}
                    title="পরিপূর্ণ স্বাধীনতা এবং অটোমেশন (তৃতীয় মাস)"
                    icon={Bot}
                    features={phase3Features}
                    userData={userData}
                 />
            </div>

        </div>
    );
}


const PhaseSection = ({ phaseNumber, title, icon: Icon, features, userData }: { phaseNumber: number, title: string, icon: React.ElementType, features: any[], userData: any }) => (
     <div className="relative pl-10">
        <div className="absolute -left-[13px] top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {phaseNumber}
        </div>
        <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
            <Icon className="h-7 w-7 text-primary" />
            {title}
        </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {features.map(feature => <FeatureCard key={feature.title} feature={feature} userData={userData}/>)}
        </div>
    </div>
);


const FeatureCard = ({ feature, userData }: { feature: any, userData: any }) => {
    const StatusIcon = statusIcons[feature.status].icon;
    const statusColor = statusIcons[feature.status].color;
    const statusBgColor = statusIcons[feature.status].bgColor;
    const statusText = statusIcons[feature.status].text;

    return (
        <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${statusColor} ${statusBgColor}`}>
                        <StatusIcon className="h-4 w-4"/>
                        <span>{statusText}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                {feature.progress && (
                    <div className="mt-4 text-xs text-primary/80 italic p-2 bg-primary/5 rounded-md">
                        {feature.progress(userData)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
