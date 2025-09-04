
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Rocket, ShieldCheck, Milestone, Users, GitCommit, Handshake, Target, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-[5vw]">
          <Logo />
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto py-12 md:py-20 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline mb-4">
            PHIQUENCE <span className="text-primary">Whitepaper</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            The official document outlining the vision, technology, and roadmap of the Phiquence ecosystem.
          </p>
        </div>

        <div className="space-y-16">
          <WhitepaperSection icon={Target} title="Executive Summary">
            <p>PHIQUENCE is a next-generation blockchain ecosystem offering staking, trading, and AI-powered financial solutions. Designed with speed, security, and scalability in mind, PHIQUENCE empowers users globally with transparent finance, innovative tools, and sustainable growth.</p>
          </WhitepaperSection>

          <WhitepaperSection icon={Rocket} title="Vision & Mission">
            <p>Our vision is to create a balanced and growth-driven ecosystem inspired by the Golden Ratio. Our mission is to empower individuals and businesses to take control of their financial future through secure, transparent, and rewarding blockchain solutions.</p>
          </WhitepaperSection>
          
          <WhitepaperSection icon={BarChart} title="Market Opportunity">
            <p>The global DeFi market is growing rapidly, with increasing demand for secure, high-yield investment opportunities. PHIQUENCE addresses this demand by offering flexible staking, affiliate rewards, and AI-driven trading tools.</p>
          </WhitepaperSection>

          <WhitepaperSection icon={Handshake} title="Ecosystem Overview">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Staking:</strong> Daily rewards with a 365-day term and optional auto-compounding.</li>
              <li><strong>Trading Hub:</strong> A simulated trading environment to test your skills and earn.</li>
              <li><strong>AI Solutions:</strong> AI-driven support and future market analysis tools.</li>
              <li><strong>Affiliate Program:</strong> A robust, multi-level reward system for network growth.</li>
            </ul>
          </WhitepaperSection>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <GitCommit className="h-7 w-7 text-primary"/>
                Tokenomics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <InfoCard title="Token Name" value="PHIQUENCE (PHI)" />
                <InfoCard title="Blockchain" value="BNB Smart Chain (BEP-20)" />
                <InfoCard title="Total Supply" value="1,618,000,000 PHI" fullWidth />
              </div>
               <div className="pt-4">
                 <h4 className="font-semibold text-lg mb-2">Use Cases:</h4>
                 <div className="flex flex-wrap gap-2">
                    <Pill>Staking rewards</Pill>
                    <Pill>Governance voting</Pill>
                    <Pill>Trading fees</Pill>
                    <Pill>Affiliate commissions</Pill>
                 </div>
               </div>
            </CardContent>
          </Card>

          <WhitepaperSection icon={Users} title="Affiliate & Reward Structure">
            <p className="mb-4">Our multi-faceted affiliate program is designed to reward our community for network growth and platform activity across three core pillars:</p>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-xl mb-2">1. Spot Commission (on Staking)</h4>
                    <p className="mb-2">Earn an instant commission when your direct or indirect referrals open a new stake. This is a one-time reward based on the initial staking amount, distributed across 5 levels:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Level 1:</strong> 10%</li>
                        <li><strong>Level 2:</strong> 6%</li>
                        <li><strong>Level 3:</strong> 4%</li>
                        <li><strong>Level 4:</strong> 2%</li>
                        <li><strong>Level 5:</strong> 1%</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-xl mb-2">2. Staking Reward Commission</h4>
                    <p className="mb-2">Receive a daily commission based on the staking rewards earned by your network. This creates a consistent, passive income stream, distributed across 5 levels:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Level 1:</strong> 2% of their daily reward</li>
                        <li><strong>Level 2:</strong> 1% of their daily reward</li>
                        <li><strong>Level 3:</strong> 0.5% of their daily reward</li>
                        <li><strong>Level 4:</strong> 0.3% of their daily reward</li>
                        <li><strong>Level 5:</strong> 0.2% of their daily reward</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-xl mb-2">3. Trading Hub Commission</h4>
                    <p className="mb-2">Engage with our Trading Hub and earn from your network’s performance. A portion of the total profit or loss from each trading session is shared across 6 levels, creating a unique risk-and-reward dynamic:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Profit Share:</strong> 4% of the total session profit is distributed among the upline network.</li>
                        <li><strong>Loss Share:</strong> 6% of the total session loss is distributed, offering a hedge.</li>
                    </ul>
                </div>
            </div>
          </WhitepaperSection>

          <WhitepaperSection icon={ShieldCheck} title="Security & Audit">
            <p>PHIQUENCE smart contracts are audited for security, ensuring protection against malicious code and vulnerabilities. User data and funds are protected using Firebase's robust security features, including secure authentication and Firestore Security Rules.</p>
          </WhitepaperSection>
          
          <WhitepaperSection icon={Milestone} title="Roadmap">
            <div className="relative border-l-2 border-primary/20 pl-6 space-y-10">
               <RoadmapItem
                  date="Q3 2025"
                  title="Foundation"
                  description="Platform launch, staking live, referral system, and core wallet functionality."
                />
                <RoadmapItem
                  date="Q4 2025"
                  title="Expansion"
                  description="Mobile app (Android/iOS), Trading Hub launch, NFT integration, and global marketing."
                />
                <RoadmapItem
                  date="Q1 2026"
                  title="Decentralization"
                  description="DAO governance implementation, community voting, and strategic partnership integrations."
                  isLast
                />
            </div>
          </WhitepaperSection>

           <WhitepaperSection title="Governance & DAO">
              <p>PHIQUENCE will transition to a Decentralized Autonomous Organization (DAO) model, allowing PHI token holders to vote on key platform decisions, propose changes, and collectively guide the ecosystem's future, ensuring community-driven and transparent growth.</p>
          </WhitepaperSection>

          <div className="text-center p-6 border rounded-lg bg-secondary/50">
             <h3 className="font-semibold text-lg">Legal Disclaimer</h3>
             <p className="text-sm text-muted-foreground mt-2">This whitepaper is for informational purposes only and does not constitute an offer to sell, a solicitation of an offer to buy, or a recommendation of any security or any other product or service. Cryptocurrency investments carry significant risks; please conduct your own research (DYOR).</p>
          </div>
        </div>
      </main>
       <footer className="py-8 px-[5vw] border-t bg-secondary/50">
        <div className="container flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Phiquence. All rights reserved.</p>
            <Link href="/app" className="text-sm font-medium text-primary hover:underline">
                Back to App
            </Link>
        </div>
    </footer>
    </div>
  );
}

const WhitepaperSection = ({ icon: Icon, title, children }: { icon?: React.ElementType, title: string, children: React.ReactNode }) => (
  <section>
    <h2 className="flex items-center gap-3 text-3xl font-bold font-headline mb-4">
      {Icon && <Icon className="h-8 w-8 text-primary" />}
      {title}
    </h2>
    <div className="text-muted-foreground text-lg leading-relaxed prose dark:prose-invert prose-p:leading-relaxed prose-strong:text-foreground">
        {children}
    </div>
  </section>
);

const InfoCard = ({ title, value, fullWidth = false }: { title: string, value: string, fullWidth?: boolean }) => (
    <div className={`bg-background/50 p-4 rounded-lg ${fullWidth ? 'md:col-span-2' : ''}`}>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
    </div>
);

const Pill = ({children}: {children: React.ReactNode}) => (
    <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
        {children}
    </span>
)

const RoadmapItem = ({ date, title, description, isLast = false }: { date: string, title: string, description: string, isLast?: boolean }) => (
    <div className="relative">
      <div className="absolute -left-[34px] top-1.5 h-4 w-4 rounded-full bg-primary" />
      <p className="text-sm font-semibold text-primary">{date}</p>
      <h4 className="text-xl font-bold mt-1">{title}</h4>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
)
