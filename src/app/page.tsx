import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  CandlestickChart,
  CheckCircle,
  ChevronRight,
  CircleDollarSign,
  Gift,
  Handshake,
  HeartHandshake,
  InfinityIcon,
  Library,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { AuthButtons } from '@/components/auth-buttons';
import { ThemeToggle } from '@/components/theme-toggle';

const marketData = [
  { symbol: 'BTC', price: '68,123.45', change: '+1.25%', iconColor: 'text-yellow-500' },
  { symbol: 'BNB', price: '590.12', change: '-0.50%', iconColor: 'text-yellow-400' },
  { symbol: 'USDT', price: '1.00', change: '+0.01%', iconColor: 'text-green-500' },
  { symbol: 'PHI', price: '0.15', change: '+5.78%', iconColor: 'text-primary' },
];

const stakingPackages = [
  { name: 'Harmony', daily: '0.5%', min: 100, max: 999, icon: HeartHandshake, href: { pathname: '/app/staking', query: { package: 'harmony' } } },
  { name: 'Proportion', daily: '0.75%', min: 1000, max: 4999, icon: Scale, href: { pathname: '/app/staking', query: { package: 'proportion' } } },
  { name: 'Divine', daily: '1.0%', min: 5000, max: 9999, icon: Zap, href: { pathname: '/app/staking', query: { package: 'divine' } } },
  { name: 'Infinity', daily: '1.25%', min: 10000, max: '∞', icon: InfinityIcon, href: { pathname: '/app/staking', query: { package: 'infinity' } } },
];

const howItWorksSteps = [
  {
    title: 'Create Account',
    description: 'Sign up in minutes and secure your account.',
    icon: Users,
  },
  {
    title: 'Deposit Funds',
    description: 'Easily deposit USDT, BNB, or PHI into your personal wallet.',
    icon: Wallet,
  },
  {
    title: 'Choose a Package',
    description: 'Select a staking package that aligns with your growth goals.',
    icon: Library,
  },
  {
    title: 'Earn & Grow',
    description: 'Watch your assets grow with daily rewards and compounding.',
    icon: CandlestickChart,
  },
];

const faqs = [
  {
    question: 'What is Phiquence?',
    answer: 'Phiquence is a comprehensive platform for digital asset management, offering staking, a trading hub, and a robust affiliate program to help you achieve real growth.',
  },
  {
    question: 'How secure is the platform?',
    answer: 'Security is our top priority. We use Firebase for authentication, secure storage for documents, and follow industry best practices to protect your assets and data.',
  },
  {
    question: 'What is staking?',
    answer: 'Staking is the process of holding funds in a cryptocurrency wallet to support the operations of a blockchain network. In return, you earn rewards for your contribution.',
  },
  {
    question: 'How does the affiliate program work?',
    answer: 'Our affiliate program allows you to earn commissions by referring new users to the platform. You can track your team, commissions, and rank through your affiliate dashboard.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <MarketTicker />
        <StakingSection />
        <HowItWorksSection />
        <ReferralSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-[5vw]">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="flex flex-col space-y-4 p-6">
                  <Logo />
                  <Link href="#staking" className="text-lg font-medium">Staking</Link>
                  <Link href="#how-it-works" className="text-lg font-medium">How it Works</Link>
                  <Link href="#referral" className="text-lg font-medium">Affiliate</Link>
                   <Link href="#faq" className="text-lg font-medium">FAQs</Link>
                   <Link href="/whitepaper" className="text-lg font-medium">Whitepaper</Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

           <div className="w-full flex-1 md:w-auto md:flex-none">
            <p className="sr-only">Logo</p>
             <div className="md:hidden">
                <Logo />
            </div>
          </div>


          <nav className="hidden md:flex items-center gap-4">
             <Link href="#staking" className="font-medium text-sm transition-colors hover:text-primary">Staking</Link>
             <Link href="#how-it-works" className="font-medium text-sm transition-colors hover:text-primary">How it Works</Link>
             <Link href="#referral" className="font-medium text-sm transition-colors hover:text-primary">Affiliate</Link>
             <Link href="#faq" className="font-medium text-sm transition-colors hover:text-primary">FAQs</Link>
             <Link href="/whitepaper" className="font-medium text-sm transition-colors hover:text-primary">Whitepaper</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 px-[5vw] bg-secondary/20">
      <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              Achieve Financial
              <span className="text-primary"> Balance</span>
              , Unlock Real
              <span className="text-primary"> Growth</span>.
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Phiquence is your all-in-one platform for secure staking, intuitive trading, and powerful affiliate networking. Start building your digital asset portfolio today.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-[400px]:flex-row">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/signup">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-square">
            <Image
            src="https://picsum.photos/500/500"
            fill
            alt="Phiquence Logo"
            data-ai-hint="logo"
            className="object-contain"
            />
        </div>
      </div>
    </section>
  );
}

function MarketTicker() {
  return (
    <div className="relative py-4 border-y">
        <div className="container max-w-screen-2xl mx-auto overflow-hidden">
            <div className="flex animate-marquee-infinite">
                {marketData.concat(marketData).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 px-8 py-2 flex-shrink-0">
                        <CircleDollarSign className={`w-5 h-5 ${item.iconColor}`} />
                        <div className="text-md font-semibold">{item.symbol}</div>
                        <div className="text-md">${item.price}</div>
                        <div className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.change}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}


function StakingSection() {
  return (
    <section id="staking" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50 px-[5vw]">
      <div className="container space-y-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
             <p className="text-primary font-semibold">STAKING</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Flexible Staking Packages</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find the perfect plan to grow your assets. All packages feature a 365-day term with optional auto-compounding for maximized returns.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stakingPackages.map((pkg) => (
            <Card key={pkg.name} className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="items-center pb-4 bg-muted/30">
                <div className="p-4 bg-primary/10 rounded-full mb-3">
                    <pkg.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow items-center text-center space-y-4 p-6">
                <p className="text-5xl font-bold text-accent">{pkg.daily}</p>
                <p className="text-sm text-muted-foreground -mt-3">Daily Reward</p>
                <p className="text-lg font-medium">
                  ${pkg.min} - ${pkg.max === '∞' ? 'Unlimited' : pkg.max}
                </p>
                <Button asChild className="mt-auto w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={pkg.href}>Select Package</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 px-[5vw]">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
            <p className="text-primary font-semibold">HOW IT WORKS</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Start Earning in 4 Simple Steps</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              We've streamlined the process to make it as easy as possible for you to get started with Phiquence and begin your growth journey.
            </p>
             <Button size="lg" asChild>
                <Link href="/signup">
                    Create Account Now
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {howItWorksSteps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-start text-left space-y-3 p-6 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 mb-2">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferralSection() {
  return (
    <section id="referral" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50 px-[5vw]">
      <div className="container grid items-center justify-center gap-6 px-4 text-center md:px-6 lg:gap-10">
        <div className="space-y-4">
         <p className="text-primary font-semibold">AFFILIATE PROGRAM</p>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
            Build Your Network, Boost Your Earnings
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Invite others to Phiquence and earn commissions from their activities. Our comprehensive affiliate dashboard and genealogy viewer help you track your network's growth and maximize your income.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/app/affiliate">
              Explore My Network
              <Users className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 px-[5vw]">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <p className="text-primary font-semibold">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Answers to Your Questions</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Have questions? We've got answers. If you don't see what you're looking for, our AI support is ready to help.
            </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-[5vw] border-t bg-secondary/50">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Phiquence. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#"><HeartHandshake className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
          <Link href="#"><Scale className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
          <Link href="#"><Zap className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
        </div>
      </div>
    </footer>
  );
}
