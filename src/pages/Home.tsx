import React, { useEffect, useState, useCallback } from 'react';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Home, Key, PiggyBank, RefreshCw, Phone, ArrowRight, ArrowRightCircle, Calculator, Star, TrendingUp, Users, ShieldCheck, Handshake, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import TorontoSkylinePhoto from "@/components/TorontoSkylinePhoto";

const publicAsset = (fileName: string) =>
  `${import.meta.env.BASE_URL}${fileName.replace(/^\//, "")}`;

const GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/FM0ved955XcwGFUi7wXt/webhook-trigger/d374115a-5a35-4f6f-81e4-623576db0613";
const HFS_LOGO_URL = publicAsset("hfs-logo.png");
const PINEAPPLE_LOGO_URL = publicAsset("pineapple-logo.png");

const FadeIn = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode, delay?: number, direction?: "up" | "down" | "left" | "right" }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut", delay } 
    }
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants}>
      {children}
    </motion.div>
  );
};

function calcMonthlyPayment(homePrice: number, downPayment: number, annualRate: number, amortYears: number): number {
  const principal = homePrice - downPayment;
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = amortYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n: number) {
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
}

function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(600000);
  const [downPayment, setDownPayment] = useState(120000);
  const [rate, setRate] = useState(5.0);
  const [amort, setAmort] = useState(25);

  const maxDown = homePrice;
  const downPct = homePrice > 0 ? Math.round((downPayment / homePrice) * 100) : 0;
  const monthly = calcMonthlyPayment(homePrice, downPayment, rate, amort);
  const totalPaid = monthly * amort * 12;
  const totalInterest = totalPaid - (homePrice - downPayment);

  const handleHomePriceInput = useCallback((val: string) => {
    const n = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(n)) {
      setHomePrice(n);
      if (downPayment > n) setDownPayment(Math.round(n * 0.2));
    }
  }, [downPayment]);

  return (
    <section id="calculator" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(14_78%_58%_/_0.06),_transparent_55%)] pointer-events-none" />
      <div className="container px-4 relative z-10">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Mortgage Calculator
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">Estimate Your Monthly Payment</h2>
            <p className="text-muted-foreground text-lg">Adjust the sliders below to get a quick estimate. For a precise pre-approval, reach out directly.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-border shadow-2xl">
            {/* Controls */}
            <div className="lg:col-span-3 p-8 md:p-10 bg-card space-y-8">

              {/* Home Price */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-medium text-foreground uppercase tracking-wide">Home Price</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">$</span>
                    <input
                      data-testid="input-calc-price"
                      type="text"
                      value={homePrice.toLocaleString('en-CA')}
                      onChange={e => handleHomePriceInput(e.target.value)}
                      className="w-32 text-right text-lg font-semibold text-foreground bg-transparent border-b border-border focus:border-primary outline-none pb-0.5"
                    />
                  </div>
                </div>
                <Slider
                  data-testid="slider-home-price"
                  min={100000} max={2000000} step={5000}
                  value={[homePrice]}
                  onValueChange={([v]) => { setHomePrice(v); if (downPayment > v) setDownPayment(Math.round(v * 0.2)); }}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$100K</span><span>$2M</span>
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-medium text-foreground uppercase tracking-wide">Down Payment <span className="text-primary font-bold ml-1">{downPct}%</span></label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">$</span>
                    <input
                      data-testid="input-calc-down"
                      type="text"
                      value={downPayment.toLocaleString('en-CA')}
                      onChange={e => { const n = parseInt(e.target.value.replace(/\D/g,''),10); if (!isNaN(n)) setDownPayment(Math.min(n, maxDown)); }}
                      className="w-32 text-right text-lg font-semibold text-foreground bg-transparent border-b border-border focus:border-primary outline-none pb-0.5"
                    />
                  </div>
                </div>
                <Slider
                  data-testid="slider-down-payment"
                  min={0} max={maxDown} step={1000}
                  value={[downPayment]}
                  onValueChange={([v]) => setDownPayment(v)}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span><span>{fmt(maxDown)}</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-medium text-foreground uppercase tracking-wide">Interest Rate</label>
                  <div className="flex items-center gap-1">
                    <input
                      data-testid="input-calc-rate"
                      type="number"
                      min={0.5} max={15} step={0.05}
                      value={rate}
                      onChange={e => setRate(parseFloat(e.target.value) || 0)}
                      className="w-16 text-right text-lg font-semibold text-foreground bg-transparent border-b border-border focus:border-primary outline-none pb-0.5"
                    />
                    <span className="text-lg font-semibold text-foreground">%</span>
                  </div>
                </div>
                <Slider
                  data-testid="slider-rate"
                  min={0.5} max={12} step={0.05}
                  value={[rate]}
                  onValueChange={([v]) => setRate(Math.round(v * 20) / 20)}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5%</span><span>12%</span>
                </div>
              </div>

              {/* Amortization */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-medium text-foreground uppercase tracking-wide">Amortization Period</label>
                  <span className="text-lg font-semibold text-foreground">{amort} years</span>
                </div>
                <Slider
                  data-testid="slider-amort"
                  min={5} max={30} step={1}
                  value={[amort]}
                  onValueChange={([v]) => setAmort(v)}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 yrs</span><span>30 yrs</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-between" style={{ background: 'hsl(222 44% 14%)' }}>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">Estimated Monthly Payment</p>
                <motion.p
                  key={monthly.toFixed(0)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  data-testid="text-monthly-payment"
                  className="text-5xl font-serif font-bold text-primary mb-1"
                >
                  {fmt(monthly)}
                </motion.p>
                <p className="text-xs text-muted-foreground mb-8">per month, principal &amp; interest</p>

                <div className="space-y-4">
                  {[
                    { label: "Loan Amount", value: fmt(Math.max(0, homePrice - downPayment)) },
                    { label: "Total Interest", value: fmt(Math.max(0, totalInterest)) },
                    { label: "Total Cost", value: fmt(Math.max(0, totalPaid + downPayment)) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                  This estimate is for illustrative purposes only and does not include property taxes, CMHC insurance, or other fees. Contact Evan for a detailed analysis.
                </p>
              </div>

              <Button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-calc-cta"
                className="w-full rounded-full mt-8"
                size="lg"
              >
                Get Pre-Approved
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Calculator", href: "#calculator" },
  { label: "About", href: "#about" },
  { label: "Reviews", href: "#reviews" },
];

export default function HomePage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", message: "" }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const name = `${values.firstName} ${values.lastName}`.trim();
      const response = await fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          name,
          source: "Home Financing Solution website",
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL webhook returned ${response.status}`);
      }

      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to submit contact form", error);
      toast({
        title: "Message could not be sent",
        description: "Please try again or call/text 437-253-4052.",
        variant: "destructive",
      });
    }
  }

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container px-4 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img src={HFS_LOGO_URL} alt="Home Financing Solution" className="h-auto w-44 sm:w-56" data-testid="img-hfs-logo-nav" />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={e => {
                  e.preventDefault();
                  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-foreground/5"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a href="tel:437-253-4052" data-testid="link-phone-nav" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              437-253-4052
            </a>
            <Button onClick={scrollToContact} data-testid="button-lets-talk" className="rounded-full px-4 sm:px-6">Let's Talk</Button>
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              data-testid="button-mobile-menu-toggle"
              aria-label="Toggle menu"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-foreground/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-md"
        >
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={e => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/50 last:border-0"
              >
                {label}
              </a>
            ))}
            <a
              href="tel:437-253-4052"
              className="flex items-center gap-2 px-3 py-3 text-base font-medium text-primary"
            >
              <Phone className="w-4 h-4" />
              437-253-4052
            </a>
          </nav>
        </motion.div>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: 'hsl(222 47% 9%)' }}>
          <div className="absolute inset-0 z-0">
            <TorontoSkylinePhoto />
            <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to right, rgba(9,18,36,0.88) 0%, rgba(9,18,36,0.65) 40%, rgba(9,18,36,0.15) 70%, rgba(9,18,36,0.05) 100%)" }} />
          </div>
          <div className="container relative z-10 px-4 py-20">
            <div className="max-w-2xl">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Serving Ontario, Alberta & British Columbia
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-[1.1] mb-6">
                  Your Path to Home, <span className="text-primary italic">Clear and Confident.</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  Navigating mortgages doesn't have to be overwhelming. I provide straightforward, expert guidance so you can focus on finding the right home.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={scrollToContact} data-testid="button-get-preapproved" className="rounded-full text-base h-14 px-8 group">
                    Get Pre-Approved
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" data-testid="button-call-hero" className="rounded-full text-base h-14 px-8 border-foreground/20 bg-foreground/5 hover:bg-foreground/10 text-foreground">
                    <a href="tel:437-253-4052" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Call 437-253-4052
                    </a>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-card relative">
          <div className="container px-4">
            <FadeIn>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">Tailored Mortgage Solutions</h2>
                <p className="text-muted-foreground text-lg">Whether you're stepping into your first home or leveraging your equity, I have the network and knowledge to secure the right terms.</p>
              </div>
            </FadeIn>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Home, title: "Home Purchases", desc: "Expert guidance for buying your dream home with competitive rates across ON, AB, and BC." },
                { icon: PiggyBank, title: "First-Time Buyers", desc: "Navigating grants, incentives, and down payments made simple." },
                { icon: RefreshCw, title: "Mortgage Renewals", desc: "Don't just sign your renewal letter. Let's find better terms." },
                { icon: Key, title: "Refinancing", desc: "Unlock your home's equity for renovations, investments, or debt consolidation." },
              ].map((service, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <Card data-testid={`card-service-${i}`} className="h-full bg-background border-border hover:border-primary/40 transition-colors group cursor-default">
                    <CardContent className="p-8 flex flex-col items-start h-full">
                      <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <service.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-serif font-medium mb-3 text-foreground">{service.title}</h3>
                      <p className="text-muted-foreground mb-6 flex-grow">{service.desc}</p>
                      <span className="text-sm font-medium text-primary flex items-center mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ArrowRightCircle className="ml-2 w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-us" className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(14_78%_58%_/_0.05),_transparent_65%)] pointer-events-none" />
          <div className="container px-4 relative z-10">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Why Choose Us
                </div>
                <h2 className="text-3xl md:text-4xl font-serif mb-5 text-foreground">Why Canadians Trust<br /><span className="text-primary italic">Home Financing Solution</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Home Financing Solution combines deep market expertise, extensive lender relationships, and a genuine commitment to client success. We bring values of community, transparency, and lasting relationships to every client we serve.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Deep Market Expertise",
                  desc: "Years of experience navigating Ontario, Alberta, and BC markets means you get guidance grounded in real, local knowledge."
                },
                {
                  icon: Handshake,
                  title: "Extensive Lender Network",
                  desc: "Through Pineapple Financial, we access Canada's top lenders to secure rates and terms that banks simply can't match on their own."
                },
                {
                  icon: Users,
                  title: "Client-First Approach",
                  desc: "No pressure, no jargon. We take time to understand your unique situation and find the exact right fit for your financial goals."
                },
                {
                  icon: ShieldCheck,
                  title: "Transparency You Can Count On",
                  desc: "Clear communication at every step. You'll always know where you stand, what your options are, and what to expect next."
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="rounded-2xl border border-border bg-card p-8 h-full hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-medium mb-3 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <MortgageCalculator />

        {/* About Section */}
        <section id="about" className="py-24 bg-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(14_78%_58%_/_0.07),_transparent_60%)] pointer-events-none" />
          <div className="container px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="right">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-border">
                  <img src={publicAsset("about-desk.png")} alt="Warm professional workspace" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                </div>
              </FadeIn>
              <FadeIn direction="left">
                <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">Advice you can trust.<br/><span className="text-primary italic">A process you'll actually enjoy.</span></h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Hi, I'm Evan Vart. As a Level 2 Mortgage Agent, I believe getting a mortgage shouldn't feel like a high-pressure sales pitch. It should feel like sitting down with a knowledgeable friend.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  With access to Canada's top lenders through Pineapple Financial, I do the heavy lifting to find the exact right fit for your unique financial situation across Ontario, Alberta, and British Columbia.
                </p>
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                  <div>
                    <h4 className="font-serif text-2xl text-primary mb-2">ON</h4>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Ontario</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl text-primary mb-2">AB</h4>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Alberta</p>
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl text-primary mb-2">BC</h4>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Brit. Columbia</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground">Mortgage Agent - Level 2 &nbsp;&bull;&nbsp; Lic. ON-M22001892, BC, AB</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="reviews" className="py-24 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(14_78%_58%_/_0.06),_transparent_55%)] pointer-events-none" />
          <div className="container px-4 relative z-10">
            <FadeIn>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <Star className="w-4 h-4 fill-primary" />
                  5-Star Google Reviews
                </div>
                <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">What Our Clients Say</h2>
                <p className="text-muted-foreground text-lg">Real experiences from real Canadians who trusted us with their home financing journey.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Sophia Vong",
                  text: "I had the pleasure of working with Evan recently, and I can't recommend him highly enough. Evan is not only incredibly knowledgeable about mortgages but also exceptionally reliable. He took the time to understand my unique situation and provided expert guidance throughout the entire process.",
                  initial: "S"
                },
                {
                  name: "Ryan Domian",
                  text: "I have been a real estate broker for over 10 years and I have to say Evan Vart has to be the most professional Mortgage Broker I have had the pleasure of working with. I always recommend clients use him to get approved prior to purchases.",
                  initial: "R"
                },
                {
                  name: "Matthew Slaunwhite",
                  text: "Evan was very knowledgeable in helping me navigate my mortgage financing, I would definitely recommend him!",
                  initial: "M"
                },
                {
                  name: "Stephen White",
                  text: "Excellent service from start to finish. The team was professional, responsive, and made the entire mortgage process seamless. Highly recommend to anyone looking for mortgage solutions.",
                  initial: "S"
                },
              ].map((review, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="rounded-2xl border border-border bg-background p-8 h-full flex flex-col hover:border-primary/30 transition-colors">
                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-muted-foreground leading-relaxed flex-grow mb-6 italic">"{review.text}"</p>
                    {/* Reviewer */}
                    <div className="flex items-center gap-3 pt-5 border-t border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-serif font-semibold text-lg flex-shrink-0">
                        {review.initial}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">Google Review</p>
                      </div>
                      {/* Google G logo */}
                      <div className="ml-auto">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="Google">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="container px-4 relative z-10">
            <FadeIn>
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">Ready to Get Started?</h2>
                <p className="text-muted-foreground text-lg">Reach out today for a no-obligation conversation about your home financing goals.</p>
              </div>
            </FadeIn>
            <div className="max-w-4xl mx-auto bg-background rounded-[2rem] shadow-xl overflow-hidden border border-border">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 p-10 flex flex-col justify-between relative overflow-hidden" style={{ background: 'hsl(222 44% 14%)' }}>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-serif mb-4 text-foreground">Let's connect</h3>
                    <p className="text-muted-foreground mb-8">Ready to start your homeownership journey? I'm here to help — no pressure, just honest guidance.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Call or Text</p>
                        <a href="tel:437-253-4052" data-testid="link-phone-contact" className="text-xl font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                          <Phone className="w-5 h-5 text-primary" />
                          437-253-4052
                        </a>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Serving</p>
                        <p className="text-foreground">Ontario, Alberta &amp; British Columbia</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Agent License</p>
                        <p className="text-sm text-foreground">Lic. ON-M22001892, BC, AB</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-3 p-10 bg-background">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input data-testid="input-first-name" placeholder="Jane" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input data-testid="input-last-name" placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input data-testid="input-phone" placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input data-testid="input-email" placeholder="jane@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How can I help you?</FormLabel>
                            <FormControl>
                              <Textarea 
                                data-testid="input-message"
                                placeholder="I'm looking to buy my first home in Vancouver..." 
                                className="min-h-[120px] resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        data-testid="button-submit"
                        type="submit"
                        size="lg"
                        className="w-full rounded-full"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border" style={{ background: 'hsl(222 47% 7%)' }}>
        <div className="container px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <img src={HFS_LOGO_URL} alt="Home Financing Solution" className="h-12 w-auto mb-4" data-testid="img-hfs-logo-footer" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Mortgage Agent Level 2, providing clear, confident, and professional home financing solutions across Ontario, Alberta, and British Columbia.
              </p>
              <a href="tel:437-253-4052" data-testid="link-phone-footer" className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                437-253-4052
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-6 uppercase tracking-wider text-xs">Services</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>Home Purchases</li>
                <li>First-Time Buyers</li>
                <li>Mortgage Renewals</li>
                <li>Refinancing</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-6 uppercase tracking-wider text-xs">Licensed Areas</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>Ontario</li>
                <li>Alberta</li>
                <li>British Columbia</li>
              </ul>
            </div>
          </div>

          {/* Pineapple Financial - prominent at the bottom */}
          <div className="border-t border-border pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
              <div className="bg-white rounded-xl px-6 py-3 flex-shrink-0">
                <img src={PINEAPPLE_LOGO_URL} alt="Pineapple Financial" className="h-8 object-contain" data-testid="img-pineapple-logo" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium mb-1">Powered by Pineapple Financial</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Pineapple Financial License Info: ON 12830 &nbsp;/&nbsp; BCFSA MB600871 &nbsp;/&nbsp; AMF 3002803823 &nbsp;/&nbsp; RECA 00424723 &nbsp;/&nbsp; SK 512229 &nbsp;/&nbsp; NS 3000504
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-xs text-muted-foreground space-y-2">
            <p>Evan Vart &nbsp;&bull;&nbsp; Mortgage Agent - Level 2 &nbsp;&bull;&nbsp; Lic. ON-M22001892, BC, AB</p>
            <p>&copy; {new Date().getFullYear()} Home Financing Solution. All rights reserved. Not intended to solicit properties already listed for sale.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
