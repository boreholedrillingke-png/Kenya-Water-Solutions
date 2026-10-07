import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink, KENYA_COUNTIES } from "@/lib/utils";

const services = [
  { label: "Drilling", href: "/services" },
  { label: "Surveys", href: "/services" },
  { label: "Pumps", href: "/products" },
  { label: "Solar", href: "/services" },
];

function QuickQuote() {
  const [name, setName] = useState("");
  const [county, setCounty] = useState("");
  const [service, setService] = useState("Borehole Drilling");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello, my name is ${name || "a customer"}${county ? ` from ${county} County` : ""}. I would like a free quote for: ${service}.`;
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/70";

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-xl text-left"
      data-testid="form-quick-quote"
    >
      <div className="text-base font-bold mb-3">Free quote</div>
      <div className="space-y-2.5">
        <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
        <select className={`${field} [&>option]:text-foreground`} value={county} onChange={(e) => setCounty(e.target.value)} aria-label="County">
          <option value="">County</option>
          {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={`${field} [&>option]:text-foreground`} value={service} onChange={(e) => setService(e.target.value)} aria-label="Service needed">
          {["Borehole Drilling", "Hydrogeological Survey", "Pump Installation", "Solar Water System", "Borehole Repair"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-semibold py-2.5 transition-colors"
        data-testid="button-quick-quote"
      >
        <MessageCircle className="h-4 w-4" /> Send on WhatsApp
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-[calc(100dvh-92px)] pt-[92px] pb-8 text-white flex items-center"
      style={{ background: "linear-gradient(135deg, hsl(215 70% 12%) 0%, hsl(212 75% 22%) 55%, hsl(200 70% 30%) 100%)" }}
    >
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
            Borehole drilling <span className="block text-amber-300">across Kenya</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-md mb-5">
            Survey, drilling, pumps and solar. Get a free quote today.
          </p>

          <div className="flex flex-wrap gap-3 mb-5">
            <Button asChild className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-semibold" data-testid="button-hero-quote">
              <Link href="/contact">Get Free Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <a href="tel:+254762211512"><Phone className="mr-2 h-4 w-4" /> Call</a>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs sm:text-sm text-white/80 mb-5">
            {["Free site visit", "Written quotes", "All 47 counties"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" />{t}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <Link key={s.label} href={s.href} className="rounded-full border border-white/25 px-3.5 py-1 text-xs sm:text-sm hover:bg-white/10 transition-colors">
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:block md:col-span-2">
          <QuickQuote />
        </div>
      </div>
    </div>
  );
}
